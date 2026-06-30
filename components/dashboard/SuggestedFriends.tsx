"use client";

import { UserAvatar } from "@/components/profile/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus2 } from "lucide-react";
import { useState } from "react";

export type SuggestedPerson = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  meta: string | null;
};

type SuggestedFriendsProps = {
  people: SuggestedPerson[];
};

type Status = "idle" | "loading" | "requested" | "error";

export function SuggestedFriends({ people }: SuggestedFriendsProps) {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  async function follow(person: SuggestedPerson) {
    if (!person.username) return;
    setStatuses((current) => ({ ...current, [person.id]: "loading" }));

    const response = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: person.username }),
    });

    setStatuses((current) => ({
      ...current,
      [person.id]: response.ok ? "requested" : "error",
    }));
  }

  if (people.length === 0) {
    return null;
  }

  return (
    <Card className="border-borderSubtle/70 bg-cardBg shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-semibold text-[#0F223A]">
          Suggested friends
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 pt-2">
        {people.map((person) => {
          const status = statuses[person.id] ?? "idle";
          return (
            <div key={person.id} className="flex items-center gap-3">
              <UserAvatar
                name={person.name}
                username={person.username}
                avatarUrl={person.avatarUrl}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0F223A]">
                  {person.name}
                </p>
                {person.meta ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {person.meta}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => follow(person)}
                disabled={status === "loading" || status === "requested"}
                className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0F223A] px-3 py-1.5 text-xs font-semibold text-[#0F223A] transition hover:bg-[#0F223A] hover:text-white disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[#0F223A]"
              >
                <UserPlus2 className="h-3.5 w-3.5" />
                {status === "requested"
                  ? "Requested"
                  : status === "loading"
                    ? "…"
                    : status === "error"
                      ? "Retry"
                      : "Follow"}
              </button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
