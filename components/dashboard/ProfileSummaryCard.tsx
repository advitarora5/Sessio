import { WeeklyStreakWidget } from "@/components/dashboard/WeeklyStreakWidget";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type ProfileSummaryCardProps = {
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  metaLine?: string | null;
  friendsCount: number;
  sessionsCount: number;
  totalHoursLabel: string;
  latest?: { title: string; startedAt: string } | null;
  streakWeeks: number;
  streakDays: boolean[];
};

export function ProfileSummaryCard({
  name,
  username,
  avatarUrl,
  metaLine,
  friendsCount,
  sessionsCount,
  totalHoursLabel,
  latest,
  streakWeeks,
  streakDays,
}: ProfileSummaryCardProps) {
  const stats = [
    { label: "Friends", value: friendsCount },
    { label: "Sessions", value: sessionsCount },
    { label: "Hours", value: totalHoursLabel },
  ];

  return (
    <Card className="border-borderSubtle/70 bg-cardBg shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <UserAvatar
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            size="xl"
          />
          <h2 className="mt-3 text-lg font-semibold text-[#0F223A]">{name}</h2>
          {username ? (
            <p className="text-sm text-muted-foreground">@{username}</p>
          ) : null}
          {metaLine ? (
            <p className="mt-1 text-xs text-muted-foreground">{metaLine}</p>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-borderSubtle/70 rounded-xl border border-borderSubtle/70 bg-white py-3">
          {stats.map((stat) => (
            <div key={stat.label} className="px-1 text-center">
              <p className="text-base font-semibold text-[#0F223A]">
                {stat.value}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {latest ? (
          <div className="mt-5 border-t border-borderSubtle/70 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Latest session
            </p>
            <p className="mt-1 truncate font-semibold text-[#0F223A]">
              {latest.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(latest.startedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        ) : null}

        <div className="mt-5">
          <WeeklyStreakWidget weeks={streakWeeks} days={streakDays} />
        </div>

        <Link
          href="/profile"
          className="focus-ring mt-5 flex items-center justify-between rounded-lg border-t border-borderSubtle/70 pt-4 text-sm font-medium text-[#0F223A] hover:underline"
        >
          Your study log
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
