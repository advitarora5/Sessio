import { FriendsManager } from "@/components/friends/FriendsManager";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const service = createServiceClient();
  const { data: friendships } = await service
    .from("friendships")
    .select("id, user_id, friend_id, status, created_at")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const relatedProfileIds = Array.from(
    new Set(
      (friendships ?? []).map((friendship) =>
        friendship.user_id === user.id
          ? friendship.friend_id
          : friendship.user_id,
      ),
    ),
  );
  const { data: profiles } =
    relatedProfileIds.length > 0
      ? await service
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", relatedProfileIds)
      : { data: [] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  const toItem = (friendship: NonNullable<typeof friendships>[number]) => {
    const otherId =
      friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
    return {
      id: friendship.id,
      status: friendship.status,
      profile:
        profileById.get(otherId) ??
        ({
          id: otherId,
          full_name: null,
          username: otherId.slice(0, 8),
          avatar_url: null,
        } satisfies Profile),
    };
  };

  const accepted = (friendships ?? [])
    .filter((friendship) => friendship.status === "accepted")
    .map(toItem);
  const incoming = (friendships ?? [])
    .filter(
      (friendship) =>
        friendship.status === "pending" && friendship.friend_id === user.id,
    )
    .map(toItem);
  const outgoing = (friendships ?? [])
    .filter(
      (friendship) =>
        friendship.status === "pending" && friendship.user_id === user.id,
    )
    .map(toItem);
  const acceptedFriendIds = accepted.map((friend) => friend.profile.id);
  const { data: sessions } =
    acceptedFriendIds.length > 0
      ? await service
          .from("sessions")
          .select("id, user_id, title, category, start_time, duration_minutes, distraction_free, goal_completed, summary_ai, spots(name)")
          .in("user_id", acceptedFriendIds)
          .eq("status", "completed")
          .eq("visibility", "public")
          .order("start_time", { ascending: false })
          .limit(20)
      : { data: [] };

  const feed = (sessions ?? []).map((session) => {
    const profile = profileById.get(session.user_id);
    return {
      id: session.id,
      title: session.title,
      category: session.category,
      durationMinutes: session.duration_minutes,
      spotName: session.spots?.name ?? null,
      startedAt: session.start_time,
      goalCompleted: session.goal_completed,
      summary: session.summary_ai,
      actorId: session.user_id,
      actorName: profile?.full_name ?? profile?.username ?? "Sessio friend",
      actorUsername: profile?.username ?? null,
      actorAvatarUrl: profile?.avatar_url ?? null,
      distractionFree: session.distraction_free,
    };
  });

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Friends</p>
        <h1 className="mt-2 text-3xl font-semibold">Focus circle</h1>
        <p className="mt-2 text-muted-foreground">
          Send lightweight requests, accept study friends, and see their public
          completed sessions.
        </p>
      </div>
      <FriendsManager
        accepted={accepted}
        incoming={incoming}
        outgoing={outgoing}
        feed={feed}
      />
    </div>
  );
}
