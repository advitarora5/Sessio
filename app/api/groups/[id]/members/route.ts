import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

type MembersRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: MembersRouteProps) {
  const { id } = await params;
  const groupId = Number(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Number.isInteger(groupId)) {
    return NextResponse.json({ error: "Invalid group." }, { status: 400 });
  }

  const { data: isMember } = await supabase.rpc("is_group_member", {
    p_group_id: groupId,
  });

  if (!isMember) {
    return NextResponse.json(
      { error: "Only members can add people to this group." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    identifier?: string;
  } | null;
  const identifier = body?.identifier?.trim();

  if (!identifier) {
    return NextResponse.json({ error: "Enter a username." }, { status: 400 });
  }

  const service = createServiceClient();
  const normalized = identifier.toLowerCase().replace(/^@/, "");
  const { data: target } = await service
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .ilike("username", normalized)
    .maybeSingle();

  if (!target) {
    return NextResponse.json(
      { error: "No Sessio profile found for that username." },
      { status: 404 },
    );
  }

  const { error } = await service.from("group_members").upsert(
    {
      group_id: groupId,
      user_id: target.id,
      role: "member",
    },
    { onConflict: "group_id,user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member: target });
}
