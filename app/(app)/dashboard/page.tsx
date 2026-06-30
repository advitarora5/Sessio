import { SessioLogo } from "@/components/brand/SessioLogo";
import { FocusBySpotChart } from "@/components/dashboard/FocusBySpotChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { WeeklyFocusChart } from "@/components/dashboard/WeeklyFocusChart";
import { StreakBadge } from "@/components/profile/StreakBadge";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateWeeklyFocus,
  computeTopSpots,
  type AnalyticsSession,
} from "@/lib/utils/analytics";
import { computeStreak, formatDuration } from "@/lib/utils/streak";
import { BarChart3, CheckCircle2, Clock3, Target, TimerReset } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type DashboardStats = {
  totalMinutes: number;
  totalSessions: number;
  averageDuration: number;
  goalRate: number;
};

type Trend = "up" | "down" | "flat";

function computeStatsForRange(
  sessions: AnalyticsSession[],
  start: Date,
  end: Date,
): DashboardStats {
  const rangeSessions = sessions.filter((session) => {
    const startedAt = new Date(session.start_time);
    return startedAt >= start && startedAt < end;
  });
  const totalMinutes = rangeSessions.reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0,
  );
  const completedGoals = rangeSessions.filter(
    (session) => session.goal_completed,
  ).length;

  return {
    totalMinutes,
    totalSessions: rangeSessions.length,
    averageDuration:
      rangeSessions.length > 0
        ? Math.round(totalMinutes / rangeSessions.length)
        : 0,
    goalRate:
      rangeSessions.length > 0
        ? Math.round((completedGoals / rangeSessions.length) * 100)
        : 0,
  };
}

function deltaFromPercent(current: number, previous: number) {
  if (previous === 0) {
    return {
      label: current > 0 ? "New vs last week" : "No change vs last week",
      trend: current > 0 ? "up" : "flat",
    } satisfies { label: string; trend: Trend };
  }

  const delta = Math.round(((current - previous) / previous) * 100);

  return {
    label: `${delta > 0 ? "+" : ""}${delta}% vs last week`,
    trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  } satisfies { label: string; trend: Trend };
}

function deltaFromPoints(current: number, previous: number) {
  const delta = current - previous;

  return {
    label: `${delta > 0 ? "+" : ""}${delta} pts vs last week`,
    trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  } satisfies { label: string; trend: Trend };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, avatar_url, major, year")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (!profile?.major || !profile?.year) {
    redirect("/onboarding");
  }

  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setHours(0, 0, 0, 0);
  currentStart.setDate(currentStart.getDate() - 6);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - 7);

  const since = new Date(previousStart);
  since.setDate(since.getDate() - 16);

  const [{ data: sessions }, { data: activeSession }] = await Promise.all([
    supabase
      .from("sessions")
      .select("*, spots(id, name, area)")
      .eq("user_id", user?.id ?? "")
      .eq("status", "completed")
      .gte("start_time", since.toISOString())
      .order("start_time", { ascending: false }),
    supabase
      .from("sessions")
      .select("id, title, start_time")
      .eq("user_id", user?.id ?? "")
      .eq("status", "active")
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const completedSessions = (sessions ?? []) as AnalyticsSession[];
  const chartData = aggregateWeeklyFocus(completedSessions);
  const currentStats = computeStatsForRange(completedSessions, currentStart, now);
  const previousStats = computeStatsForRange(
    completedSessions,
    previousStart,
    currentStart,
  );
  const topSpots = computeTopSpots(completedSessions, 5);
  const streak = computeStreak(completedSessions);
  const focusDelta = deltaFromPercent(
    currentStats.totalMinutes,
    previousStats.totalMinutes,
  );
  const sessionsDelta = deltaFromPercent(
    currentStats.totalSessions,
    previousStats.totalSessions,
  );
  const averageDelta = deltaFromPercent(
    currentStats.averageDuration,
    previousStats.averageDuration,
  );
  const goalsDelta = deltaFromPoints(
    currentStats.goalRate,
    previousStats.goalRate,
  );
  const displayName =
    profile?.full_name ?? profile?.username ?? user?.email?.split("@")[0] ?? "You";

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-4 rounded-lg border border-border/70 bg-white p-8 shadow-[0_1px_6px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:justify-between">
        <SessioLogo
          tagline="Deep work, mapped."
          markClassName="h-12 w-12"
          priority
        />
        <div className="flex flex-wrap items-center gap-3">
          {activeSession ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/session/${activeSession.id}`}>
                Resume {activeSession.title}
              </Link>
            </Button>
          ) : null}
          <StreakBadge streak={streak} />
          <Button asChild className="rounded-full">
            <Link href="/session/new">Start Session</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Focus Time This Week"
          value={formatDuration(currentStats.totalMinutes)}
          delta={focusDelta.label}
          trend={focusDelta.trend}
          icon={Clock3}
        />
        <StatCard
          label="Sessions Completed"
          value={String(currentStats.totalSessions)}
          delta={sessionsDelta.label}
          trend={sessionsDelta.trend}
          icon={BarChart3}
        />
        <StatCard
          label="Avg Session Length"
          value={formatDuration(currentStats.averageDuration)}
          delta={averageDelta.label}
          trend={averageDelta.trend}
          icon={TimerReset}
        />
        <StatCard
          label="% Goals Hit"
          value={`${currentStats.goalRate}%`}
          delta={goalsDelta.label}
          trend={goalsDelta.trend}
          icon={Target}
        />
      </section>

      <Card className="rounded-lg border-border/70 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
        <CardHeader className="p-8 pb-2">
          <CardTitle className="text-xl">Weekly Focus</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <WeeklyFocusChart data={chartData} />
        </CardContent>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="rounded-lg border-border/70 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-xl">Focus by Spot</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <FocusBySpotChart data={topSpots} />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/70 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-xl">Top Spots</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {topSpots.length > 0 ? (
              <div className="grid">
                {topSpots.map((spot, index) => (
                  <Link
                    key={spot.id}
                    href={`/spots/${spot.id}`}
                    className="focus-ring flex items-center justify-between gap-4 border-b border-border/70 py-4 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-emerald-950">
                          {spot.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(spot.totalMinutes)} total
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{spot.goalRate}%</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete sessions with spots to build this leaderboard.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-lg border-border/70 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
        <CardHeader className="flex-row items-center justify-between p-8 pb-2">
          <CardTitle className="text-xl">Recent Sessions</CardTitle>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/feed">View feed</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {completedSessions.slice(0, 6).length > 0 ? (
            <div className="grid">
              {completedSessions.slice(0, 6).map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 border-b border-border/70 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <UserAvatar
                      name={displayName}
                      username={profile?.username}
                      avatarUrl={profile?.avatar_url}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-emerald-950">
                        {session.title ?? "Focus session"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDuration(session.duration_minutes)} at{" "}
                        {session.spots?.name ?? "a campus spot"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge variant="secondary">
                      {session.goal_completed ? "Goal hit" : "Logged"}
                    </Badge>
                    {session.distraction_free ? (
                      <Badge variant="outline">DND</Badge>
                    ) : null}
                    <Badge variant="outline">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {session.goal_completed ? "100%" : "0%"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Start and complete a session to populate your training log.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
