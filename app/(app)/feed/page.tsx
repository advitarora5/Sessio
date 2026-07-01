import { GroupFeed, type FeedSession } from "@/components/groups/GroupFeed";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No visibility filter: RLS already scopes this to the viewer's own sessions
  // plus everything they're allowed to see (public + their groups), so the
  // feed leads with friends/campus activity and the viewer's latest blocks.
  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "id, user_id, title, category, start_time, duration_minutes, distraction_free, goal_completed, summary_ai, media_url, spots(name), likes(id, user_id)",
    )
    .eq("status", "completed")
    .order("start_time", { ascending: false })
    .limit(30);

  const userIds = Array.from(new Set((sessions ?? []).map((session) => session.user_id)));
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds)
      : { data: [] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const feedSessions: FeedSession[] = (sessions ?? []).map((session) => {
    const profile = profileById.get(session.user_id);
    const likes = session.likes ?? [];
    return {
      id: session.id,
      title: session.title,
      category: session.category,
      durationMinutes: session.duration_minutes,
      spotName: session.spots?.name ?? null,
      startedAt: session.start_time,
      goalCompleted: session.goal_completed,
      summary: session.summary_ai,
      mediaUrl: session.media_url,
      actorName:
        profile?.full_name ?? profile?.username ?? `Member ${session.user_id.slice(0, 6)}`,
      actorUsername: profile?.username ?? null,
      actorAvatarUrl: profile?.avatar_url ?? null,
      goldStarsCount: likes.length,
      starredByMe: likes.some((like) => like.user_id === user?.id),
      distractionFree: session.distraction_free,
    };
  });

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Activity feed</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0F223A]">
          What campus is studying
        </h1>
        <p className="mt-2 text-slate-600">
          Your latest focus blocks and recent sessions from friends and groups.
        </p>
      </div>
      {user ? <GroupFeed sessions={feedSessions} currentUserId={user.id} /> : null}
    </div>
  );
}
