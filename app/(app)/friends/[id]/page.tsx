import { SessionCard } from "@/components/session/SessionCard";
import { StreakBadge } from "@/components/profile/StreakBadge";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  computeBestSessions,
  computeRecentSpots,
  type AnalyticsSession,
} from "@/lib/utils/analytics";
import { computeStreak } from "@/lib/utils/streak";
import { MapPinned } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type FriendProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function FriendProfilePage({ params }: FriendProfilePageProps) {
  const { id: friendId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (friendId === user.id) {
    redirect("/profile");
  }

  const service = createServiceClient();
  const { data: friendship } = await service
    .from("friendships")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`,
    )
    .maybeSingle();

  if (!friendship) {
    redirect("/friends");
  }

  const { data: profile } = await service
    .from("profiles")
    .select("id, full_name, username, avatar_url, major, year, study_focus")
    .eq("id", friendId)
    .maybeSingle();

  if (!profile) {
    redirect("/friends");
  }

  const { data: sessions } = await service
    .from("sessions")
    .select("*, spots(id, name, area)")
    .eq("user_id", friendId)
    .eq("status", "completed")
    .eq("visibility", "public")
    .order("start_time", { ascending: false })
    .limit(100);

  const completedSessions = (sessions ?? []) as AnalyticsSession[];
  const streak = computeStreak(completedSessions);
  const recentSpots = computeRecentSpots(completedSessions, 5);
  const bestSessions = computeBestSessions(completedSessions, 5);
  const displayName = profile.full_name ?? profile.username ?? "Sessio friend";

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border/70 bg-white p-8 shadow-[0_1px_6px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={profile.full_name}
            username={profile.username}
            avatarUrl={profile.avatar_url}
            size="xl"
          />
          <div>
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              @{profile.username ?? profile.id.slice(0, 8)}
              {profile.major ? ` · ${profile.major}` : ""}
              {profile.year ? ` · ${profile.year}` : ""}
            </p>
          </div>
        </div>
        <StreakBadge streak={streak} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="sessio-card h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              Recent Study Spots
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            {recentSpots.length > 0 ? (
              recentSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="focus-ring flex items-center justify-between gap-4 border-b border-border/70 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{spot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {spot.area ?? "Campus"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {new Date(spot.lastSessionAt).toLocaleDateString()}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No public sessions with a spot yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="sessio-card">
          <CardHeader>
            <CardTitle>Best Sessions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {bestSessions.length > 0 ? (
              bestSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  title={session.title ?? "Focus session"}
                  category={session.category}
                  durationMinutes={session.duration_minutes}
                  spotName={session.spots?.name ?? null}
                  startedAt={session.start_time}
                  goalCompleted={session.goal_completed}
                  summary={session.summary_ai}
                  distractionFree={session.distraction_free}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {displayName} hasn&apos;t completed a public session yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
