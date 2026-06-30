import { computeStreak } from "./streak";

export type LeaderboardSession = {
  user_id: string;
  duration_minutes: number | null;
  start_time: string;
};

export type LeaderboardParticipant = {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  isYou: boolean;
};

export type LeaderboardEntry = LeaderboardParticipant & {
  totalMinutes: number;
  longestSession: number;
  sessionCount: number;
  streak: number;
};

export type LeaderboardCategory = "hours" | "longest" | "sessions";
export type LeaderboardPeriod = "week" | "month";

export function computeLeaderboard(
  participants: LeaderboardParticipant[],
  sessions: LeaderboardSession[],
  since: Date,
): LeaderboardEntry[] {
  return participants.map((p) => {
    const all = sessions.filter((s) => s.user_id === p.userId);
    const inPeriod = all.filter((s) => new Date(s.start_time) >= since);

    return {
      ...p,
      totalMinutes: inPeriod.reduce(
        (sum, s) => sum + (s.duration_minutes ?? 0),
        0,
      ),
      longestSession: inPeriod.reduce(
        (max, s) => Math.max(max, s.duration_minutes ?? 0),
        0,
      ),
      sessionCount: inPeriod.length,
      streak: computeStreak(all),
    };
  });
}

export function rankBy(
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
): LeaderboardEntry[] {
  const key: keyof LeaderboardEntry =
    category === "hours"
      ? "totalMinutes"
      : category === "longest"
        ? "longestSession"
        : "sessionCount";

  return [...entries].sort((a, b) => (b[key] as number) - (a[key] as number));
}
