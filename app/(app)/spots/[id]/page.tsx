import { SessionCard } from "@/components/session/SessionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { loadCampusSpots } from "@/lib/spots/illini";
import { formatDuration } from "@/lib/utils/streak";
import { BarChart3, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type SpotDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const { id } = await params;
  const spotId = Number(id);
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{ data: dbSpot }, { data: sessions }] = await Promise.all([
    supabase
      .from("spots")
      .select("id, name, description, area, tags")
      .eq("id", spotId)
      .single(),
    supabase
      .from("sessions")
      .select("id, title, category, start_time, duration_minutes, goal_completed, summary_ai")
      .eq("spot_id", spotId)
      .eq("status", "completed")
      .order("start_time", { ascending: false })
      .limit(20),
  ]);
  let spot = dbSpot;

  if (!spot) {
    const { spots } = await loadCampusSpots(supabase);
    spot = spots.find((candidate) => candidate.id === spotId) ?? null;
  }

  if (!spot) {
    notFound();
  }

  const recentSessions = sessions ?? [];
  const weekSessions = recentSessions.filter(
    (session) => new Date(session.start_time) >= weekAgo,
  );
  const totalMinutes = recentSessions.reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0,
  );
  const averageDuration =
    recentSessions.length > 0
      ? Math.round(totalMinutes / recentSessions.length)
      : 0;
  const goalRate =
    recentSessions.length > 0
      ? Math.round(
          (recentSessions.filter((session) => session.goal_completed).length /
            recentSessions.length) *
            100,
        )
      : 0;

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            {spot.area ?? "Campus"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{spot.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {spot.description ?? "A Sessio campus study location."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(spot.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Button asChild className="rounded-full">
          <Link href={`/session/new?spot=${spot.id}`}>Start session here</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="sessio-card">
          <CardContent className="p-5">
            <BarChart3 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{weekSessions.length}</p>
            <p className="text-sm text-muted-foreground">
              sessions this week
            </p>
          </CardContent>
        </Card>
        <Card className="sessio-card">
          <CardContent className="p-5">
            <Clock3 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">
              {formatDuration(averageDuration)}
            </p>
            <p className="text-sm text-muted-foreground">average duration</p>
          </CardContent>
        </Card>
        <Card className="sessio-card">
          <CardContent className="p-5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{goalRate}%</p>
            <p className="text-sm text-muted-foreground">goal completion</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">Recent sessions here</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {recentSessions.map((session) => (
            <SessionCard
              key={session.id}
              title={session.title}
              category={session.category}
              durationMinutes={session.duration_minutes}
              startedAt={session.start_time}
              goalCompleted={session.goal_completed}
              summary={session.summary_ai}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
