import { SpotExplorer } from "@/components/spots/SpotExplorer";
import { createClient } from "@/lib/supabase/server";
import { loadCampusSpots } from "@/lib/spots/illini";

export default async function SpotsPage() {
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{ spots, source }, { data: sessions }] = await Promise.all([
    loadCampusSpots(supabase),
    supabase
      .from("sessions")
      .select("spot_id, status, duration_minutes")
      .in("status", ["completed", "active"])
      .gte("start_time", weekAgo.toISOString())
      .not("spot_id", "is", null),
  ]);

  const metrics = new Map<number, { sessionsLastWeek: number; totalMinutes: number; activeSessions: number }>();
  (sessions ?? []).forEach((session) => {
    if (session.spot_id) {
      const existing =
        metrics.get(session.spot_id) ??
        { sessionsLastWeek: 0, totalMinutes: 0, activeSessions: 0 };
      if (session.status === "completed") {
        existing.sessionsLastWeek += 1;
        existing.totalMinutes += session.duration_minutes ?? 0;
      } else if (session.status === "active") {
        existing.activeSessions += 1;
      }
      metrics.set(session.spot_id, existing);
    }
  });

  const spotsWithMetrics = spots.map((spot) => ({
    ...spot,
    sessionsLastWeek: metrics.get(spot.id)?.sessionsLastWeek ?? 0,
    totalMinutes: metrics.get(spot.id)?.totalMinutes ?? 0,
    activeSessions: metrics.get(spot.id)?.activeSessions ?? 0,
  }));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Campus heat</p>
        <h1 className="mt-2 text-3xl font-semibold">Study spots</h1>
        <p className="mt-2 text-muted-foreground">
          Browse UIUC focus spots. Brighter cards have more visible sessions in
          the last seven days.
        </p>
        {source === "fallback" ? (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            IlliniSpots are rendering from the cloned dataset fallback. Import
            them with <code>npm run import:illini-spots</code> to persist them
            in Supabase.
          </p>
        ) : null}
      </div>
      <SpotExplorer spots={spotsWithMetrics} />
    </div>
  );
}
