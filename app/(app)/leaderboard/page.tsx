import { LeaderboardTabs } from "@/components/leaderboard/LeaderboardTabs";
import { createClient } from "@/lib/supabase/server";
import { Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const since = new Date();
  since.setDate(since.getDate() - 60);

  // Fetch accepted friendships (either direction)
  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .eq("status", "accepted")
    .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);

  const friendIds = (friendships ?? []).map((f) =>
    f.user_id === user?.id ? f.friend_id : f.user_id,
  );
  const participantIds = [user?.id ?? "", ...friendIds].filter(Boolean);

  const [{ data: profiles }, { data: sessions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", participantIds),
    supabase
      .from("sessions")
      .select("user_id, duration_minutes, start_time")
      .in("user_id", participantIds)
      .eq("status", "completed")
      .gte("start_time", since.toISOString())
      .order("start_time", { ascending: false }),
  ]);

  const participants = (profiles ?? []).map((p) => ({
    userId: p.id,
    displayName: p.full_name ?? p.username ?? "Sessio user",
    username: p.username,
    avatarUrl: p.avatar_url,
    isYou: p.id === user?.id,
  }));

  // Put the current user first so ties break in their favor
  participants.sort((a, b) => (a.isYou ? -1 : b.isYou ? 1 : 0));

  const leaderboardSessions = (sessions ?? []).map((s) => ({
    user_id: s.user_id,
    duration_minutes: s.duration_minutes,
    start_time: s.start_time,
  }));

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            How you stack up against your friends
          </p>
        </div>
      </div>

      <LeaderboardTabs
        participants={participants}
        sessions={leaderboardSessions}
      />
    </div>
  );
}
