"use client";

import { SpotCard } from "@/components/spots/SpotCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import FacilityMap from "@/components/spots/FacilityMap";

export type SpotExplorerSpot = {
  id: number;
  name: string;
  area: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[] | null;
  sessionsLastWeek: number;
  totalMinutes: number;
  activeSessions: number;
};

type SpotExplorerProps = {
  spots: SpotExplorerSpot[];
};

function includesQuery(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false;
}

function normalize(value: number, min: number, max: number) {
  if (max === min) {
    return 50;
  }

  return ((value - min) / (max - min)) * 82 + 9;
}

export function SpotExplorer({ spots }: SpotExplorerProps) {
  const [query, setQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const maxSessions = Math.max(0, ...spots.map((spot) => spot.sessionsLastWeek));
  const maxMinutes = Math.max(0, ...spots.map((spot) => spot.totalMinutes));

  const filteredSpots = useMemo(() => {
    if (!normalizedQuery) {
      return spots;
    }

    return spots.filter((spot) => {
      return (
        includesQuery(spot.name, normalizedQuery) ||
        includesQuery(spot.area, normalizedQuery) ||
        (spot.tags ?? []).some((tag) => includesQuery(tag, normalizedQuery))
      );
    });
  }, [normalizedQuery, spots]);

  const mappedSpots = useMemo(() => {
    const coordinateSpots = spots.filter(
      (spot) => typeof spot.lat === "number" && typeof spot.lng === "number",
    );

    if (coordinateSpots.length === 0) {
      return [];
    }

    const lats = coordinateSpots.map((spot) => spot.lat as number);
    const lngs = coordinateSpots.map((spot) => spot.lng as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return coordinateSpots.map((spot) => ({
      ...spot,
      x: normalize(spot.lng as number, minLng, maxLng),
      y: 100 - normalize(spot.lat as number, minLat, maxLat),
    }));
  }, [spots]);

  function selectSpot(id: number) {
    setHighlightedId(id);
    document.getElementById(`spot-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  const suggestions = normalizedQuery ? filteredSpots.slice(0, 5) : [];

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="grid gap-3">
            <label className="text-sm font-medium" htmlFor="spot-search">
              Find a study spot
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="spot-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search study spots..."
                className="h-11 pl-9 pr-11"
                autoComplete="off"
              />
              {query ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Clear spot search"
                  onClick={() => {
                    setQuery("");
                    setHighlightedId(null);
                  }}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-md"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => selectSpot(spot.id)}
                    className="focus-ring rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900 transition hover:border-emerald-500"
                  >
                    {spot.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Search by building, study spot name, area, or tag.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-950">Study heat</p>
            <p className="mt-1 text-sm text-emerald-900/75">
              {filteredSpots.length} matches, {maxSessions} sessions at the
              hottest spot this week.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_6px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Interactive 3D Study Map</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pulsing markers show active studiers right now. Color intensity reflects weekly focus sessions.
            </p>
          </div>
          <MapPin className="hidden h-5 w-5 text-primary sm:block" />
        </div>
        <div className="overflow-hidden rounded-lg border border-emerald-100 h-[450px]">
          <FacilityMap
            spots={filteredSpots}
            highlightedId={highlightedId}
            onSpotClick={selectSpot}
          />
        </div>
      </section>

      {filteredSpots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSpots.map((spot) => (
            <div key={spot.id} id={`spot-${spot.id}`}>
              <SpotCard
                id={spot.id}
                name={spot.name}
                area={spot.area}
                tags={spot.tags}
                sessionsLastWeek={spot.sessionsLastWeek}
                maxSessions={maxSessions}
                isHighlighted={highlightedId === spot.id}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-muted-foreground">
          No spots match that search yet.
        </div>
      )}
    </div>
  );
}
