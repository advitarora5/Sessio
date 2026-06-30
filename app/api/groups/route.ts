import { createClient, createServiceClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/utils/password";
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

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    visibility?: "public" | "private";
    password?: string;
    course?: string;
  } | null;
  const name = body?.name?.trim();
  const visibility = body?.visibility === "private" ? "private" : "public";
  const course = body?.course?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Group name is required." }, { status: 400 });
  }

  let passwordHash: string | null = null;
  if (visibility === "private") {
    const password = body?.password ?? "";
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Private groups need a password of at least 6 characters." },
        { status: 400 },
      );
    }
    passwordHash = await hashPassword(password);
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
      visibility,
      password_hash: passwordHash,
      course,
    })
    .select("id, name, visibility, course")
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
