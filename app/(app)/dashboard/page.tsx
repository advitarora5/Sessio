import { ProfileSummaryCard } from "@/components/dashboard/ProfileSummaryCard";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  StravaFeed,
  type DashboardFeedItem,
} from "@/components/dashboard/StravaFeed";
import {
  SuggestedFriends,
  type SuggestedPerson,
} from "@/components/dashboard/SuggestedFriends";
import { WeeklyFocusChart } from "@/components/dashboard/WeeklyFocusChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  aggregateWeeklyFocus,
  type AnalyticsSession,
} from "@/lib/utils/analytics";
import { deltaToneClass, type DeltaTrend } from "@/lib/utils/delta";
import {
  computeStreak,
  computeWeekActivity,
  formatDuration,
} from "@/lib/utils/streak";
import {
  ArrowUpRight,
  BarChart3,
  Clock3,
  Flame,
  Target,
  TimerReset,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type DashboardStats = {
  totalMinutes: number;
  totalSessions: number;
  averageDuration: number;
  goalRate: number;
};

const WEEKLY_GOAL_MINUTES = 600; // 10-hour week challenge

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
      trend: (current > 0 ? "up" : "flat") as DeltaTrend,
    };
  }

  const delta = Math.round(((current - previous) / previous) * 100);
  return {
    label: `${delta > 0 ? "+" : ""}${delta}% vs last week`,
    trend: (delta > 0 ? "up" : delta < 0 ? "down" : "flat") as DeltaTrend,
  };
}

function deltaFromPoints(current: number, previous: number) {
  const delta = current - previous;
  return {
    label: `${delta > 0 ? "+" : ""}${delta} pts vs last week`,
    trend: (delta > 0 ? "up" : delta < 0 ? "down" : "flat") as DeltaTrend,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, avatar_url, major, year, role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (!profile?.major || !profile?.year) {
    redirect("/onboarding");
  }

  const userId = user?.id ?? "";
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setHours(0, 0, 0, 0);
  currentStart.setDate(currentStart.getDate() - 6);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - 7);

  const since = new Date(previousStart);
  since.setDate(since.getDate() - 16);

  const service = createServiceClient();

  const [
    { data: sessions },
    { data: activeSession },
    { data: allTimeRows },
    { data: friendships },
    { data: groups },
    { data: pendingInvitesRows }
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*, spots(id, name, area)")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("start_time", since.toISOString())
      .order("start_time", { ascending: false }),
    supabase
      .from("sessions")
      .select("id, title, start_time")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("start_time, duration_minutes")
      .eq("user_id", userId)
      .eq("status", "completed"),
    service
      .from("friendships")
      .select("user_id, friend_id, status")
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`),
    supabase
      .from("groups")
      .select("id, name, course")
      .order("name")
      .limit(6),
    supabase
      .from("event_rsvps")
      .select("id, event_id, status, calendar_events(*)")
      .eq("user_id", userId)
      .eq("status", "pending")
  ]);

  const completedSessions = (sessions ?? []) as AnalyticsSession[];
  const allTime = (allTimeRows ?? []) as { start_time: string; duration_minutes: number | null }[];

  const friendIds = Array.from(
    new Set(
      (friendships ?? [])
        .filter((row) => row.status === "accepted")
        .map((row) => (row.user_id === userId ? row.friend_id : row.user_id)),
    ),
  );

  const feedUserIds = [userId, ...friendIds];
  const { data: feedRows } = await service
    .from("sessions")
    .select(
      "id, user_id, title, start_time, duration_minutes, distraction_free, goal_completed, summary_ai, visibility, spots(name), likes(id, user_id)",
    )
    .in("user_id", feedUserIds)
    .eq("status", "completed")
    .order("start_time", { ascending: false })
    .limit(16);

  const actorIds = Array.from(
    new Set([userId, ...(feedRows ?? []).map((row) => row.user_id)]),
  );
  const { data: actorProfiles } =
    actorIds.length > 0
      ? await service
          .from("profiles")
          .select("id, full_name, username, avatar_url, major, role")
          .in("id", actorIds)
      : { data: [] };
  const profileById = new Map(
    (actorProfiles ?? []).map((row) => [row.id, row]),
  );

  const { data: suggestionRows } = await service
    .from("profiles")
    .select("id, full_name, username, avatar_url, major, role")
    .neq("id", userId)
    .limit(16);
  const excluded = new Set([userId, ...friendIds]);
  const suggestions: SuggestedPerson[] = (suggestionRows ?? [])
    .filter((row) => !excluded.has(row.id) && row.username)
    .slice(0, 4)
    .map((row) => ({
      id: row.id,
      name: row.full_name ?? row.username ?? "Sessio member",
      username: row.username,
      avatarUrl: row.avatar_url,
      meta: [row.major, row.role].filter(Boolean).join(" · ") || null,
    }));

  const pendingInvites = pendingInvitesRows ?? [];

  const feedItems: DashboardFeedItem[] = (feedRows ?? [])
    .filter((row) => row.visibility === "public" || row.user_id === userId)
    .slice(0, 8)
    .map((row) => {
      const actor = profileById.get(row.user_id);
      const likes = (row.likes ?? []) as { id: number; user_id: string }[];
      const spot = row.spots as { name: string } | { name: string }[] | null;
      const spotName = Array.isArray(spot) ? spot[0]?.name ?? null : spot?.name ?? null;
      return {
        id: row.id,
        actorId: row.user_id,
        actorName: actor?.full_name ?? actor?.username ?? "Sessio member",
        actorUsername: actor?.username ?? null,
        actorAvatarUrl: actor?.avatar_url ?? null,
        title: row.title ?? "Focus session",
        startedAt: row.start_time,
        durationMinutes: row.duration_minutes,
        spotName,
        goalCompleted: row.goal_completed,
        distractionFree: row.distraction_free,
        summary: row.summary_ai,
        goldStarsCount: likes.length,
        starredByMe: likes.some((like) => like.user_id === userId),
        isOwn: row.user_id === userId,
      };
    });

  const chartData = aggregateWeeklyFocus(completedSessions);
  const currentStats = computeStatsForRange(completedSessions, currentStart, now);
  const previousStats = computeStatsForRange(
    completedSessions,
    previousStart,
    currentStart,
  );
  const streak = computeStreak(allTime);
  const weekActivity = computeWeekActivity(allTime);
  const totalMinutesAll = allTime.reduce(
    (sum, row) => sum + (row.duration_minutes ?? 0),
    0,
  );

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
  const goalsDelta = deltaFromPoints(currentStats.goalRate, previousStats.goalRate);

  const displayName =
    profile?.full_name ?? profile?.username ?? user?.email?.split("@")[0] ?? "You";
  const metaLine =
    [profile?.major, profile?.year, profile?.role].filter(Boolean).join(" · ") ||
    null;
  const latest = completedSessions[0]
    ? {
        title: completedSessions[0].title ?? "Focus session",
        startedAt: completedSessions[0].start_time,
      }
    : null;

  const weeklyGoalPct = Math.min(
    100,
    Math.round((currentStats.totalMinutes / WEEKLY_GOAL_MINUTES) * 100),
  );
  const streakGoalPct = Math.min(100, Math.round((streak / 7) * 100));

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px] xl:items-start">
      {/* Left column — profile & streak */}
      <aside className="grid gap-6 xl:sticky xl:top-24">
        <ProfileSummaryCard
          name={displayName}
          username={profile?.username}
          avatarUrl={profile?.avatar_url}
          metaLine={metaLine}
          friendsCount={friendIds.length}
          sessionsCount={allTime.length}
          totalHoursLabel={formatDuration(totalMinutesAll)}
          latest={latest}
          streakWeeks={weekActivity.weeks}
          streakDays={weekActivity.days}
        />
      </aside>

      {/* Center column — KPIs, chart, activity feed */}
      <div className="grid min-w-0 gap-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        <Card className="border-borderSubtle/70 bg-cardBg shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
          <CardHeader className="flex-row items-center justify-between gap-3 p-6 pb-2">
            <CardTitle className="text-lg">Weekly Focus</CardTitle>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${deltaToneClass(
                focusDelta.trend,
              )}`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              {focusDelta.label}
            </span>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <WeeklyFocusChart data={chartData} />
          </CardContent>
        </Card>

        <section className="grid min-w-0 gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F223A]">Activity feed</h2>
            <Link
              href="/feed"
              className="text-sm font-medium text-[#0F223A] underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          
          {pendingInvites && pendingInvites.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm mb-4">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-900">Pending Invites ({pendingInvites.length})</h3>
                  <p className="text-sm text-amber-800">You have study session invites waiting.</p>
                </div>
                <Link href="/calendar" className="text-sm font-medium bg-amber-200 text-amber-900 px-4 py-2 rounded-full hover:bg-amber-300">
                  Review
                </Link>
              </CardContent>
            </Card>
          )}

          <StravaFeed items={feedItems} currentUserId={userId} />
        </section>
      </div>

      {/* Right column — challenges, clubs, suggested friends */}
      <aside className="grid gap-6">
        <Card className="border-borderSubtle/70 bg-cardBg shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#0F223A]">
              <Trophy className="h-4 w-4 text-amber-500" />
              Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 pt-2">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#0F223A]">10-hour week</span>
                <span className="text-muted-foreground">
                  {formatDuration(currentStats.totalMinutes)} / 10h
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0F223A]"
                  style={{ width: `${weeklyGoalPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-[#0F223A]">
                  <Flame className="h-4 w-4 fill-amber-400 text-amber-500" />
                  7-day streak
                </span>
                <span className="text-muted-foreground">{streak} / 7 days</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0F223A]"
                  style={{ width: `${streakGoalPct}%` }}
                />
              </div>
            </div>
            <Link
              href="/session/new"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-[#0F223A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F223A]/90"
            >
              {activeSession ? "Resume session" : "Start a session"}
            </Link>
          </CardContent>
        </Card>

        <Card className="border-borderSubtle/70 bg-cardBg shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
          <CardHeader className="flex-row items-center justify-between p-5 pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#0F223A]">
              <Users className="h-4 w-4 text-[#0F223A]" />
              Your clubs
            </CardTitle>
            <Link
              href="/groups"
              className="text-xs font-medium text-muted-foreground hover:text-[#0F223A]"
            >
              All
            </Link>
          </CardHeader>
          <CardContent className="grid gap-2 p-5 pt-2">
            {(groups ?? []).length > 0 ? (
              groups?.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="focus-ring flex items-center gap-3 rounded-lg border border-borderSubtle/70 bg-white p-3 transition hover:border-[#0F223A]/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0F223A] text-xs font-semibold text-white">
                    {group.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0F223A]">
                      {group.name}
                    </p>
                    {group.course ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {group.course}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Join a study group to share public effort with friends.
              </p>
            )}
          </CardContent>
        </Card>

        <SuggestedFriends people={suggestions} />
      </aside>
    </div>
  );
}
