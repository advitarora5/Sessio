"use client";

import { SpotCard } from "@/components/spots/SpotCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export type SpotExplorerSpot = {
  id: number;
  name: string;
  area: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[] | null;
  sessionsLastWeek: number;
  totalMinutes: number;
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
                    className="focus-ring rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-[#0F223A] transition hover:border-primary"
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

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-[#0F223A]">Study heat</p>
            <p className="mt-1 text-sm text-slate-600">
              {filteredSpots.length} matches, {maxSessions} sessions at the
              hottest spot this week.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Study heatmap</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Circle size reflects total focused minutes; color reflects recent
              completed sessions.
            </p>
          </div>
          <MapPin className="hidden h-5 w-5 text-primary sm:block" />
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_48%,#E8EEF5_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,34,58,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(15,34,58,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
          {mappedSpots.map((spot) => {
            const heat = maxSessions > 0 ? spot.sessionsLastWeek / maxSessions : 0;
            const minuteHeat = maxMinutes > 0 ? spot.totalMinutes / maxMinutes : 0;
            const size = 16 + minuteHeat * 34;
            const isHighlighted = highlightedId === spot.id;

            return (
              <button
                key={spot.id}
                type="button"
                title={spot.name}
                aria-label={`Highlight ${spot.name}`}
                onClick={() => selectSpot(spot.id)}
                className={cn(
                  "focus-ring absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_6px_18px_rgba(15,34,58,0.25)] transition hover:scale-110",
                  isHighlighted && "ring-4 ring-amber-300",
                )}
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: `rgba(15, ${Math.round(34 + heat * 48)}, ${Math.round(58 + heat * 112)}, ${0.32 + heat * 0.58})`,
                }}
              />
            );
          })}
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
