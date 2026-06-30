import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    invite_code?: string;
  } | null;
  const inviteCode = body?.invite_code?.trim().toUpperCase();

  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: group } = await service
    .from("groups")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (!group) {
    return NextResponse.json({ error: "No group found for that code." }, { status: 404 });
  }

  await service.from("profiles").upsert({
    id: user.id,
    full_name: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? null,
    username: user.email ? `${user.email.split("@")[0]}_${user.id.slice(0, 8)}` : null,
  });

  const { error } = await service.from("group_members").upsert(
    {
      group_id: group.id,
      user_id: user.id,
      role: "member",
    },
    { onConflict: "group_id,user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ group_id: group.id });
}
