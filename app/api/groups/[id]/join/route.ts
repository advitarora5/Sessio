import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

type JoinRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: JoinRouteProps) {
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

  const service = createServiceClient();
  const { data: group } = await service
    .from("groups")
    .select("id, visibility")
    .eq("id", groupId)
    .maybeSingle();

  if (!group || group.visibility !== "public") {
    return NextResponse.json({ error: "Group not found." }, { status: 404 });
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
