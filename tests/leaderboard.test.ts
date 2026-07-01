import { describe, expect, it } from "vitest";
import {
  computeLeaderboard,
  rankBy,
  type LeaderboardParticipant,
  type LeaderboardSession,
} from "@/lib/utils/leaderboard";

const participants: LeaderboardParticipant[] = [
  { userId: "u1", displayName: "Ana", username: "ana", avatarUrl: null, isYou: true },
  { userId: "u2", displayName: "Ben", username: "ben", avatarUrl: null, isYou: false },
];

const now = new Date();
const iso = (daysAgo: number) =>
  new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

const sessions: LeaderboardSession[] = [
  { user_id: "u1", duration_minutes: 60, start_time: iso(1) },
  { user_id: "u1", duration_minutes: 30, start_time: iso(2) },
  { user_id: "u2", duration_minutes: 120, start_time: iso(1) },
  { user_id: "u2", duration_minutes: 10, start_time: iso(40) }, // outside week window
];

describe("computeLeaderboard", () => {
  it("only counts sessions within the period window", () => {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const entries = computeLeaderboard(participants, sessions, since);
    const ben = entries.find((e) => e.userId === "u2")!;
    // The 40-day-old 10-minute session must be excluded from the week window.
    expect(ben.totalMinutes).toBe(120);
    expect(ben.sessionCount).toBe(1);
  });

  it("computes totals and longest session per participant", () => {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const entries = computeLeaderboard(participants, sessions, since);
    const ana = entries.find((e) => e.userId === "u1")!;
    expect(ana.totalMinutes).toBe(90);
    expect(ana.longestSession).toBe(60);
    expect(ana.sessionCount).toBe(2);
  });
});

describe("rankBy", () => {
  it("ranks by total hours descending", () => {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ranked = rankBy(
      computeLeaderboard(participants, sessions, since),
      "hours",
    );
    expect(ranked[0].userId).toBe("u2"); // 120 > 90
  });

  it("ranks by session count descending", () => {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ranked = rankBy(
      computeLeaderboard(participants, sessions, since),
      "sessions",
    );
    expect(ranked[0].userId).toBe("u1"); // 2 sessions > 1
  });
});
