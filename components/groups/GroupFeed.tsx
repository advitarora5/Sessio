"use client";

import { SessionCard } from "@/components/session/SessionCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import { useState } from "react";

export type FeedSession = {
  id: number;
  title: string;
  category: string | null;
  durationMinutes: number | null;
  spotName: string | null;
  startedAt: string;
  goalCompleted: boolean | null;
  summary: string | null;
  mediaUrl: string | null;
  actorName: string;
  actorUsername?: string | null;
  actorAvatarUrl: string | null;
  goldStarsCount: number;
  starredByMe: boolean;
  distractionFree?: boolean | null;
};

type GroupFeedProps = {
  sessions: FeedSession[];
  currentUserId: string;
};

export function GroupFeed({ sessions, currentUserId }: GroupFeedProps) {
  const [items, setItems] = useState(sessions);
  const [busySessionId, setBusySessionId] = useState<number | null>(null);

  async function toggleGoldStar(session: FeedSession) {
    setBusySessionId(session.id);
    const supabase = createClient();

    if (session.starredByMe) {
      await supabase
        .from("likes")
        .delete()
        .eq("session_id", session.id)
        .eq("user_id", currentUserId);
    } else {
      await supabase.from("likes").insert({
        session_id: session.id,
        user_id: currentUserId,
      });
    }

    setItems((current) =>
      current.map((item) =>
        item.id === session.id
          ? {
              ...item,
              starredByMe: !item.starredByMe,
              goldStarsCount: item.starredByMe
                ? Math.max(0, item.goldStarsCount - 1)
                : item.goldStarsCount + 1,
            }
          : item,
      ),
    );
    setBusySessionId(null);
  }

  return (
    <div className="grid gap-4">
      {items.length > 0 ? (
        items.map((session) => (
          <SessionCard
            key={session.id}
            title={session.title}
            actorName={session.actorName}
            actorUsername={session.actorUsername}
            actorAvatarUrl={session.actorAvatarUrl}
            category={session.category}
            durationMinutes={session.durationMinutes}
            spotName={session.spotName}
            startedAt={session.startedAt}
            goalCompleted={session.goalCompleted}
            summary={session.summary}
            mediaUrl={session.mediaUrl}
            goldStarsCount={session.goldStarsCount}
            distractionFree={session.distractionFree}
            action={
              <Button
                type="button"
                size="sm"
                variant={session.starredByMe ? "default" : "outline"}
                onClick={() => toggleGoldStar(session)}
                disabled={busySessionId === session.id}
                aria-label={
                  session.starredByMe
                    ? "Remove your gold star"
                    : "Give a gold star"
                }
                className="rounded-full"
              >
                <Star
                  className={`h-4 w-4 transition ${
                    session.starredByMe ? "fill-current" : ""
                  }`}
                />
                Gold star
              </Button>
            }
          />
        ))
      ) : (
        <div className="sessio-card rounded-lg p-6 text-muted-foreground">
          No shared sessions yet. Start a group-visible session to wake up the feed.
        </div>
      )}
    </div>
  );
}
