import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

type FriendRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: FriendRouteProps) {
  const { id } = await params;
  const friendshipId = Number(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    status?: "accepted" | "blocked";
  } | null;
  const status = body?.status;

  if (!Number.isInteger(friendshipId) || !status) {
    return NextResponse.json({ error: "Invalid friendship update." }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("friendships")
    .update({ status })
    .eq("id", friendshipId)
    .or(`friend_id.eq.${user.id},user_id.eq.${user.id}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: FriendRouteProps) {
  const { id } = await params;
  const friendshipId = Number(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Number.isInteger(friendshipId)) {
    return NextResponse.json({ error: "Invalid friendship." }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .or(`friend_id.eq.${user.id},user_id.eq.${user.id}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
