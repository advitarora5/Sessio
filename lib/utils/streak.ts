type CompletedSessionLike = {
  start_time: string;
  status?: string | null;
};

function toLocalDateKey(value: string) {
  const date = new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function offsetDateKey(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return toLocalDateKey(date.toISOString());
}

export function computeStreak(sessions: CompletedSessionLike[]): number {
  const completedDays = new Set(
    sessions
      .filter((session) => !session.status || session.status === "completed")
      .map((session) => toLocalDateKey(session.start_time)),
  );

  let streak = 0;

  for (let offset = 0; offset < 366; offset += 1) {
    if (!completedDays.has(offsetDateKey(offset))) {
      break;
    }
    streak += 1;
  }

  return streak;
}

export type WeekActivity = {
  /** Monday..Sunday of the current week; true when a session was completed that day. */
  days: boolean[];
  /** Number of consecutive weeks (including this week) with at least one session. */
  weeks: number;
};

export function computeWeekActivity(
  sessions: CompletedSessionLike[],
): WeekActivity {
  const completedDays = new Set(
    sessions
      .filter((session) => !session.status || session.status === "completed")
      .map((session) => toLocalDateKey(session.start_time)),
  );

  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);

  const dayKey = (weekStart: Date, index: number) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return toLocalDateKey(day.toISOString());
  };

  const days = Array.from({ length: 7 }, (_, index) =>
    completedDays.has(dayKey(monday, index)),
  );

  let weeks = 0;
  for (let week = 0; week < 54; week += 1) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - 7 * week);
    const hasActivity = Array.from({ length: 7 }, (_, index) =>
      completedDays.has(dayKey(weekStart, index)),
    ).some(Boolean);

    if (hasActivity) {
      weeks += 1;
    } else {
      break;
    }
  }

  return { days, weeks };
}

export function formatDuration(minutes: number | null | undefined) {
  const safeMinutes = Math.max(0, minutes ?? 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
}
