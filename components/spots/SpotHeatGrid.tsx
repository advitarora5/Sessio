import { SpotCard } from "@/components/spots/SpotCard";

type SpotHeatGridProps = {
  spots: Array<{
    id: number;
    name: string;
    area: string | null;
    tags: string[] | null;
    sessionsLastWeek: number;
  }>;
};

export function SpotHeatGrid({ spots }: SpotHeatGridProps) {
  const maxSessions = Math.max(0, ...spots.map((spot) => spot.sessionsLastWeek));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {spots.map((spot) => (
        <SpotCard
          key={spot.id}
          id={spot.id}
          name={spot.name}
          area={spot.area}
          tags={spot.tags}
          sessionsLastWeek={spot.sessionsLastWeek}
          maxSessions={maxSessions}
        />
      ))}
    </div>
  );
}
