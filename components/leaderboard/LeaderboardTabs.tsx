"use client";

import { UserAvatar } from "@/components/profile/UserAvatar";
import {
  computeLeaderboard,
  rankBy,
  type LeaderboardCategory,
  type LeaderboardParticipant,
  type LeaderboardPeriod,
  type LeaderboardSession,
} from "@/lib/utils/leaderboard";
import { formatDuration } from "@/lib/utils/streak";
import { Flame } from "lucide-react";
import { useState } from "react";

type LeaderboardTabsProps = {
  participants: LeaderboardParticipant[];
  sessions: LeaderboardSession[];
};

const CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: "hours", label: "Top Hours" },
  { key: "longest", label: "Longest Session" },
  { key: "sessions", label: "Most Sessions" },
];

function metricValue(
  entry: ReturnType<typeof computeLeaderboard>[number],
  category: LeaderboardCategory,
) {
  if (category === "hours") return formatDuration(entry.totalMinutes);
  if (category === "longest") return formatDuration(entry.longestSession);
  return `${entry.sessionCount} session${entry.sessionCount !== 1 ? "s" : ""}`;
}

export function LeaderboardTabs({ participants, sessions }: LeaderboardTabsProps) {
  const [category, setCategory] = useState<LeaderboardCategory>("hours");
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");

  const since = new Date();
  since.setDate(since.getDate() - (period === "week" ? 7 : 30));
  since.setHours(0, 0, 0, 0);

  const entries = rankBy(computeLeaderboard(participants, sessions, since), category);
  const hasData = entries.some((e) =>
    category === "hours"
      ? e.totalMinutes > 0
      : category === "longest"
        ? e.longestSession > 0
        : e.sessionCount > 0,
  );

  return (
    <div className="grid gap-5">
      {/* Period toggle */}
      <div className="flex items-center gap-2">
        {(["week", "month"] as LeaderboardPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              period === p
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {p === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              category === c.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Ranked list */}
      <div className="sessio-card divide-y divide-border/50">
        {!hasData ? (
          <p className="px-8 py-10 text-center text-sm text-muted-foreground">
            No sessions logged{" "}
            {period === "week" ? "this week" : "this month"} yet.
          </p>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 px-6 py-4 first:pt-5 last:pb-5 ${
                entry.isYou ? "bg-primary/5" : ""
              }`}
            >
              {/* Rank */}
              <span
                className={`w-6 shrink-0 text-center text-sm font-bold ${
                  i === 0
                    ? "text-yellow-500"
                    : i === 1
                      ? "text-slate-400"
                      : i === 2
                        ? "text-amber-600"
                        : "text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>

              {/* Avatar + name */}
              <UserAvatar
                name={entry.displayName}
                username={entry.username}
                avatarUrl={entry.avatarUrl}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {entry.displayName}
                  {entry.isYou && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      You
                    </span>
                  )}
                </p>
                {entry.username && (
                  <p className="text-xs text-muted-foreground">
                    @{entry.username}
                  </p>
                )}
              </div>

              {/* Streak */}
              {entry.streak > 0 && (
                <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-emerald-700 sm:flex">
                  <Flame className="h-3 w-3 text-emerald-600" />
                  {entry.streak}d
                </span>
              )}

              {/* Metric */}
              <span className="shrink-0 text-right text-sm font-semibold">
                {metricValue(entry, category)}
              </span>
            </div>
          ))
        )}
      </div>

      {participants.length === 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Just you for now —{" "}
          <a href="/friends" className="text-primary hover:underline">
            add friends
          </a>{" "}
          to compete.
        </p>
      )}
    </div>
  );
}
