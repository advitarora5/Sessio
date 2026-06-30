"use client";

import { GroupCard } from "@/components/groups/GroupCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export type DiscoverableGroup = {
  id: number;
  name: string;
  course: string | null;
  memberCount: number;
};

type GroupDiscoveryProps = {
  groups: DiscoverableGroup[];
};

function includesQuery(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false;
}

export function GroupDiscovery({ groups }: GroupDiscoveryProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) {
      return groups;
    }

    return groups.filter(
      (group) =>
        includesQuery(group.name, normalizedQuery) ||
        includesQuery(group.course, normalizedQuery),
    );
  }, [normalizedQuery, groups]);

  return (
    <div className="grid gap-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by group name or course (e.g. CS 225)..."
          className="h-11 pl-9"
          autoComplete="off"
        />
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              course={group.course}
              memberCount={group.memberCount}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-muted-foreground">
          No public groups match that search yet.
        </div>
      )}
    </div>
  );
}
