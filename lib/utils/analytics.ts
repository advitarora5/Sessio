export type AnalyticsSession = {
  id: number;
  title?: string;
  category?: string | null;
  spot_id: number | null;
  start_time: string;
  duration_minutes: number | null;
  distraction_free?: boolean | null;
  goal_completed: boolean | null;
  summary_ai?: string | null;
  spots?: {
    id: number;
    name: string;
    area: string | null;
  } | null;
};

export type WeeklyFocusPoint = {
  date: string;
  label: string;
  minutes: number;
};

export type TopSpot = {
  id: number;
  name: string;
  area: string | null;
  totalMinutes: number;
  sessions: number;
  goalRate: number;
};

export type RecentSpot = {
  id: number;
  name: string;
  area: string | null;
  lastSessionAt: string;
  sessions: number;
};

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function aggregateWeeklyFocus(
  sessions: AnalyticsSession[],
): WeeklyFocusPoint[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const points = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date: dateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      minutes: 0,
    };
  });

  const pointByDate = new Map(points.map((point) => [point.date, point]));

  sessions.forEach((session) => {
    const point = pointByDate.get(dateKey(new Date(session.start_time)));

    if (point) {
      point.minutes += session.duration_minutes ?? 0;
    }
  });

  return points;
}

export function computeDashboardStats(sessions: AnalyticsSession[]) {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);

  const weekSessions = sessions.filter(
    (session) => new Date(session.start_time) >= weekStart,
  );
  const totalMinutes = weekSessions.reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0,
  );
  const averageDuration =
    weekSessions.length > 0 ? Math.round(totalMinutes / weekSessions.length) : 0;
  const completedGoals = weekSessions.filter(
    (session) => session.goal_completed,
  ).length;
  const goalRate =
    weekSessions.length > 0
      ? Math.round((completedGoals / weekSessions.length) * 100)
      : 0;

  return {
    totalMinutes,
    totalSessions: weekSessions.length,
    averageDuration,
    goalRate,
  };
}

export function computeTopSpots(
  sessions: AnalyticsSession[],
  limit = 3,
): TopSpot[] {
  const bySpot = new Map<
    number,
    {
      id: number;
      name: string;
      area: string | null;
      totalMinutes: number;
      sessions: number;
      completedGoals: number;
    }
  >();

  sessions.forEach((session) => {
    if (!session.spot_id || !session.spots) {
      return;
    }

    const existing =
      bySpot.get(session.spot_id) ??
      {
        id: session.spot_id,
        name: session.spots.name,
        area: session.spots.area,
        totalMinutes: 0,
        sessions: 0,
        completedGoals: 0,
      };

    existing.totalMinutes += session.duration_minutes ?? 0;
    existing.sessions += 1;
    existing.completedGoals += session.goal_completed ? 1 : 0;
    bySpot.set(session.spot_id, existing);
  });

  return Array.from(bySpot.values())
    .map((spot) => ({
      ...spot,
      goalRate:
        spot.sessions > 0
          ? Math.round((spot.completedGoals / spot.sessions) * 100)
          : 0,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, limit);
}

export function computeRecentSpots(
  sessions: AnalyticsSession[],
  limit = 5,
): RecentSpot[] {
  const bySpot = new Map<number, RecentSpot>();

  sessions.forEach((session) => {
    if (!session.spot_id || !session.spots) {
      return;
    }

    const existing = bySpot.get(session.spot_id);

    if (!existing) {
      bySpot.set(session.spot_id, {
        id: session.spot_id,
        name: session.spots.name,
        area: session.spots.area,
        lastSessionAt: session.start_time,
        sessions: 1,
      });
      return;
    }

    existing.sessions += 1;
    if (new Date(session.start_time) > new Date(existing.lastSessionAt)) {
      existing.lastSessionAt = session.start_time;
    }
  });

  return Array.from(bySpot.values())
    .sort(
      (a, b) =>
        new Date(b.lastSessionAt).getTime() - new Date(a.lastSessionAt).getTime(),
    )
    .slice(0, limit);
}

export function computeBestSessions(
  sessions: AnalyticsSession[],
  limit = 5,
): AnalyticsSession[] {
  return [...sessions]
    .sort((a, b) => {
      const durationDiff = (b.duration_minutes ?? 0) - (a.duration_minutes ?? 0);
      if (durationDiff !== 0) return durationDiff;

      const goalDiff = Number(b.goal_completed ?? false) - Number(a.goal_completed ?? false);
      if (goalDiff !== 0) return goalDiff;

      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    })
    .slice(0, limit);
}
