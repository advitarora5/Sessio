import { LeaderboardTabs } from "@/components/leaderboard/LeaderboardTabs";
import type {
  LeaderboardParticipant,
  LeaderboardSession,
} from "@/lib/utils/leaderboard";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const participants: LeaderboardParticipant[] = [
  {
    userId: "u1",
    displayName: "Ana",
    username: "ana",
    avatarUrl: null,
    isYou: true,
  },
];
const sessions: LeaderboardSession[] = [
  { user_id: "u1", duration_minutes: 60, start_time: new Date().toISOString() },
];

describe("LeaderboardTabs contrast", () => {
  it("renders the selected category tab with readable (not white-on-white) classes", () => {
    render(<LeaderboardTabs participants={participants} sessions={sessions} />);
    const active = screen.getByRole("button", { name: "Top Hours" });
    // Regression guard for the bug where selected used `bg-card text-foreground`
    // (white text on a white card => invisible).
    expect(active.className).not.toContain("text-foreground");
    expect(active.className).toContain("text-[#0F223A]");
    expect(active.className).toContain("bg-white");
  });

  it("keeps the selected tab readable after switching categories", () => {
    render(<LeaderboardTabs participants={participants} sessions={sessions} />);
    const sessionsTab = screen.getByRole("button", { name: "Most Sessions" });
    fireEvent.click(sessionsTab);
    expect(sessionsTab.className).toContain("text-[#0F223A]");
    expect(sessionsTab.className).not.toContain("text-foreground");
  });

  it("renders the active period toggle with a dark background and white text", () => {
    render(<LeaderboardTabs participants={participants} sessions={sessions} />);
    const week = screen.getByRole("button", { name: "This Week" });
    expect(week.className).toContain("bg-[#0F223A]");
    expect(week.className).toContain("text-white");
  });
});
