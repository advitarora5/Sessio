import { SpotExplorer } from "@/components/spots/SpotExplorer";
import { loadCampusSpots } from "@/lib/spots/illini";
import { createClient } from "@/lib/supabase/server";

export default async function HeatmapPage() {
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{ spots, source }, { data: sessions }] = await Promise.all([
    loadCampusSpots(supabase),
    supabase
      .from("sessions")
      .select("spot_id, duration_minutes")
      .eq("status", "completed")
      .gte("start_time", weekAgo.toISOString())
      .not("spot_id", "is", null),
  ]);

  const metrics = new Map<
    number,
    { sessionsLastWeek: number; totalMinutes: number }
  >();

  (sessions ?? []).forEach((session) => {
    if (!session.spot_id) {
      return;
    }

    const existing =
      metrics.get(session.spot_id) ?? { sessionsLastWeek: 0, totalMinutes: 0 };
    existing.sessionsLastWeek += 1;
    existing.totalMinutes += session.duration_minutes ?? 0;
    metrics.set(session.spot_id, existing);
  });

  const spotsWithMetrics = spots.map((spot) => ({
    ...spot,
    sessionsLastWeek: metrics.get(spot.id)?.sessionsLastWeek ?? 0,
    totalMinutes: metrics.get(spot.id)?.totalMinutes ?? 0,
  }));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Study heatmap</p>
        <h1 className="mt-2 text-3xl font-semibold">Where campus is focusing</h1>
        <p className="mt-2 text-muted-foreground">
          Search Illini spots and scan where completed Sessio sessions are
          clustering this week.
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
