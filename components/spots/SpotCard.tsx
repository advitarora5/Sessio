import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinned } from "lucide-react";
import Link from "next/link";

type SpotCardProps = {
  id: number;
  name: string;
  area?: string | null;
  tags?: string[] | null;
  sessionsLastWeek: number;
  maxSessions: number;
  isHighlighted?: boolean;
};

export function SpotCard({
  id,
  name,
  area,
  tags,
  sessionsLastWeek,
  maxSessions,
  isHighlighted = false,
}: SpotCardProps) {
  const intensity = maxSessions > 0 ? sessionsLastWeek / maxSessions : 0;

  return (
    <Link href={`/spots/${id}`} className="focus-ring block rounded-lg">
      <Card
        className={`sessio-card h-full transition hover:-translate-y-0.5 hover:border-primary/70 ${
          isHighlighted ? "border-amber-300 ring-2 ring-amber-200" : ""
        }`}
        style={{
          boxShadow: `0 0 ${Math.round(16 + intensity * 28)}px rgba(5, 150, 105, ${0.08 + intensity * 0.2})`,
        }}
      >
        <CardContent className="grid h-full gap-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {area ?? "Campus"}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <MapPinned className="h-5 w-5" />
            </span>
          </div>
          <div>
            <p className="text-2xl font-semibold">{sessionsLastWeek}</p>
            <p className="text-sm text-muted-foreground">
              visible sessions this week
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(tags ?? []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
