import { CopyInviteCodeButton } from "@/components/groups/CopyInviteCodeButton";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils/streak";
import { Users } from "lucide-react";
import Link from "next/link";

type GroupCardProps = {
  id: number;
  name: string;
  inviteCode?: string;
  course?: string | null;
  focusMinutes?: number;
  sessionCount?: number;
  memberCount?: number;
};

export function GroupCard({
  id,
  name,
  inviteCode,
  course,
  focusMinutes = 0,
  sessionCount = 0,
  memberCount,
}: GroupCardProps) {
  return (
    <Card className="sessio-card h-full transition hover:-translate-y-0.5 hover:border-primary/70">
      <CardContent className="grid gap-4 p-5">
        <Link href={`/groups/${id}`} className="focus-ring grid gap-4 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#0F223A]">{name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {course ? `${course} · ` : ""}
                {typeof memberCount === "number"
                  ? `${memberCount} member${memberCount === 1 ? "" : "s"}`
                  : `${sessionCount} completed sessions`}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Users className="h-5 w-5" />
            </span>
          </div>
          {typeof memberCount !== "number" ? (
            <p className="text-2xl font-semibold text-[#0F223A]">
              {formatDuration(focusMinutes)}
            </p>
          ) : null}
        </Link>
        {inviteCode ? <CopyInviteCodeButton inviteCode={inviteCode} /> : null}
      </CardContent>
    </Card>
  );
}
