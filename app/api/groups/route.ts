import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Group name is required." }, { status: 400 });
  }

  const service = createServiceClient();
  await service.from("profiles").upsert({
    id: user.id,
    full_name: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? null,
    username: user.email ? `${user.email.split("@")[0]}_${user.id.slice(0, 8)}` : null,
  });

  const { data: group, error: groupError } = await service
    .from("groups")
    .insert({
      name,
      owner_id: user.id,
      invite_code: makeInviteCode(),
    })
    .select("id, name, invite_code")
    .single();

  if (groupError || !group) {
    return NextResponse.json(
      { error: groupError?.message ?? "Could not create group." },
      { status: 500 },
    );
  }

  const { error: memberError } = await service.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ group });
}
