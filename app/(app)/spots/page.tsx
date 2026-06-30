import { SpotHeatGrid } from "@/components/spots/SpotHeatGrid";
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
      .select("spot_id")
      .eq("status", "completed")
      .gte("start_time", weekAgo.toISOString())
      .not("spot_id", "is", null),
  ]);

  const counts = new Map<number, number>();
  (sessions ?? []).forEach((session) => {
    if (session.spot_id) {
      counts.set(session.spot_id, (counts.get(session.spot_id) ?? 0) + 1);
    }
  });

  const spotsWithMetrics = spots.map((spot) => ({
    ...spot,
    sessionsLastWeek: counts.get(spot.id) ?? 0,
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
      <SpotHeatGrid spots={spotsWithMetrics} />
    </div>
  );
}
