import { SuggestionBanner } from "@/components/dashboard/SuggestionBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { WeeklyFocusChart } from "@/components/dashboard/WeeklyFocusChart";
import { SessionCard } from "@/components/session/SessionCard";
import { StreakBadge } from "@/components/profile/StreakBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateWeeklyFocus,
  computeDashboardStats,
  computeTopSpots,
  type AnalyticsSession,
} from "@/lib/utils/analytics";
import { computeStreak, formatDuration } from "@/lib/utils/streak";
import { BarChart3, CheckCircle2, Clock3, Flame, MapPinned } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("major, year")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (!profile?.major || !profile?.year) {
    redirect("/onboarding");
  }
  const since = new Date();
  since.setDate(since.getDate() - 30);

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
  const stats = computeDashboardStats(completedSessions);
  const topSpots = computeTopSpots(completedSessions);
  const streak = computeStreak(completedSessions);
  const suggestedSpot = topSpots[0];

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">This week</p>
          <h1 className="mt-2 text-4xl font-semibold">
            {formatDuration(stats.totalMinutes)} focused
          </h1>
          <div className="mt-4">
            <StreakBadge streak={streak} size="large" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {activeSession ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/session/${activeSession.id}`}>
                Resume {activeSession.title}
              </Link>
            </Button>
          ) : null}
          <Button asChild className="rounded-full">
            <Link href="/session/new">Start Session</Link>
          </Button>
        </div>
      </section>

      <SuggestionBanner
        title={
          suggestedSpot
            ? `Your best spot lately: ${suggestedSpot.name}`
            : "Start one focused block today"
        }
        detail={
          suggestedSpot
            ? `${formatDuration(suggestedSpot.totalMinutes)} logged there with ${suggestedSpot.goalRate}% goal completion.`
            : "Once you complete a few sessions, Sessio will suggest your best campus spots."
        }
        href={
          suggestedSpot ? `/session/new?spot=${suggestedSpot.id}` : "/session/new"
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sessions"
          value={String(stats.totalSessions)}
          detail="Completed in the last 7 days"
          icon={BarChart3}
        />
        <StatCard
          label="Average"
          value={formatDuration(stats.averageDuration)}
          detail="Mean completed session length"
          icon={Clock3}
        />
        <StatCard
          label="Goal rate"
          value={`${stats.goalRate}%`}
          detail="Sessions marked successful"
          icon={CheckCircle2}
        />
        <StatCard
          label="Streak"
          value={streak > 0 ? `${streak}d` : "Start"}
          detail={
            streak > 0
              ? "Consecutive days with focus"
              : "Complete one session to light it up"
          }
          icon={Flame}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="sessio-card">
          <CardHeader>
            <CardTitle>Weekly focus chart</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyFocusChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="sessio-card">
          <CardHeader>
            <CardTitle>Top spots</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {topSpots.length > 0 ? (
              topSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="focus-ring rounded-lg border border-border bg-muted/30 p-4 transition hover:border-primary/60"
                >
                  <div className="flex items-start gap-3">
                    <MapPinned className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{spot.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(spot.totalMinutes)} · {spot.goalRate}%
                        goal rate
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete sessions with spots to build this leaderboard.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent sessions</h2>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/feed">View feed</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {completedSessions.slice(0, 4).map((session) => (
            <SessionCard
              key={session.id}
              title={session.title ?? "Focus session"}
              category={session.category}
              durationMinutes={session.duration_minutes}
              spotName={session.spots?.name}
              startedAt={session.start_time}
              goalCompleted={session.goal_completed}
              summary={session.summary_ai}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
