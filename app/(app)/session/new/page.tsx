import { StartSessionForm } from "@/components/session/StartSessionForm";
import { createClient } from "@/lib/supabase/server";
import { loadCampusSpots } from "@/lib/spots/illini";

type NewSessionPageProps = {
  searchParams: Promise<{ spot?: string }>;
};

export default async function NewSessionPage({
  searchParams,
}: NewSessionPageProps) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ spots, source: spotsSource }, { data: memberships }, { data: recentSessions }] =
    await Promise.all([
      loadCampusSpots(supabase),
      // Only groups the user actually belongs to — starting a group session in
      // a group you're not a member of violates the sessions INSERT RLS policy.
      supabase
        .from("group_members")
        .select("groups(id, name)")
        .eq("user_id", user?.id ?? ""),
      supabase
        .from("sessions")
        .select("spot_id, duration_minutes, goal_completed, spots(id, name, area, tags)")
        .eq("status", "completed")
        .not("spot_id", "is", null)
        .order("start_time", { ascending: false })
        .limit(50),
    ]);

  const groups = (memberships ?? []).flatMap((membership) => {
    const g = membership.groups as
      | { id: number; name: string }
      | { id: number; name: string }[]
      | null;
    if (!g) return [];
    return Array.isArray(g) ? g : [g];
  });

  const suggestedSpotId = recentSessions
    ?.filter((session) => session.spot_id)
    .reduce(
      (best, session) => {
        const score =
          (session.duration_minutes ?? 0) + (session.goal_completed ? 30 : 0);
        return score > best.score
          ? { id: session.spot_id ?? undefined, score }
          : best;
      },
      { id: undefined as number | undefined, score: -1 },
    ).id;
  const defaultSpotId = resolvedSearchParams.spot
    ? Number(resolvedSearchParams.spot)
    : undefined;
  const suggestedSpot =
    spots.find((spot) => spot.id === (defaultSpotId ?? suggestedSpotId)) ?? null;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Start a focus session</h1>
        <p className="mt-2 text-muted-foreground">
          Name the work, pick a campus spot, and let the timer keep the receipt.
        </p>
      </div>
      <StartSessionForm
        spots={spots}
        groups={groups ?? []}
        defaultSpotId={defaultSpotId}
        suggestedSpot={suggestedSpot}
        spotsSource={spotsSource}
      />
    </div>
  );
}
