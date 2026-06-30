import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils/streak";
import { Copy, Users } from "lucide-react";
import Link from "next/link";

type GroupCardProps = {
  id: number;
  name: string;
  inviteCode: string;
  focusMinutes?: number;
  sessionCount?: number;
};

export function GroupCard({
  id,
  name,
  inviteCode,
  focusMinutes = 0,
  sessionCount = 0,
}: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`} className="focus-ring block rounded-lg">
      <Card className="sessio-card h-full transition hover:-translate-y-0.5 hover:border-primary/70">
        <CardContent className="grid gap-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {sessionCount} completed sessions
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="text-2xl font-semibold">{formatDuration(focusMinutes)}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Copy className="h-4 w-4" />
            Invite code {inviteCode}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
