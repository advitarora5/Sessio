import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils/streak";
import { CheckCircle2, Clock3, MapPinned, Sparkles } from "lucide-react";

type SessionCardProps = {
  title: string;
  category?: string | null;
  durationMinutes?: number | null;
  spotName?: string | null;
  startedAt?: string | null;
  goalCompleted?: boolean | null;
  summary?: string | null;
  actorName?: string | null;
  actorAvatarUrl?: string | null;
  kudosCount?: number;
  action?: React.ReactNode;
};

export function SessionCard({
  title,
  category,
  durationMinutes,
  spotName,
  startedAt,
  goalCompleted,
  summary,
  actorName,
  actorAvatarUrl,
  kudosCount,
  action,
}: SessionCardProps) {
  return (
    <Card className="sessio-card">
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {actorName ? (
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="h-7 w-7 rounded-full border border-border bg-muted bg-cover bg-center"
                  style={{
                    backgroundImage: actorAvatarUrl
                      ? `url(${actorAvatarUrl})`
                      : undefined,
                  }}
                />
                {actorName}
              </div>
            ) : null}
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          </div>
          {action}
        </div>

        <div className="flex flex-wrap gap-2">
          {category ? <Badge variant="secondary">{category}</Badge> : null}
          {goalCompleted !== null && goalCompleted !== undefined ? (
            <Badge variant={goalCompleted ? "default" : "outline"}>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {goalCompleted ? "Goal met" : "Logged"}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <span className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            {formatDuration(durationMinutes)}
          </span>
          {spotName ? (
            <span className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-primary" />
              {spotName}
            </span>
          ) : null}
          {startedAt ? (
            <span>{new Date(startedAt).toLocaleDateString()}</span>
          ) : null}
        </div>

        {summary ? (
          <p className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-foreground">
            <Sparkles className="mr-2 inline h-4 w-4 text-primary" />
            {summary}
          </p>
        ) : null}

        {typeof kudosCount === "number" ? (
          <p className="text-sm text-muted-foreground">{kudosCount} kudos</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
