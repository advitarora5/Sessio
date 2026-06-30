"use client";

import { SessionCard } from "@/components/session/SessionCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Heart } from "lucide-react";
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
  actorName: string;
  actorAvatarUrl: string | null;
  kudosCount: number;
  likedByMe: boolean;
};

type GroupFeedProps = {
  sessions: FeedSession[];
  currentUserId: string;
};

export function GroupFeed({ sessions, currentUserId }: GroupFeedProps) {
  const [items, setItems] = useState(sessions);
  const [busySessionId, setBusySessionId] = useState<number | null>(null);

  async function toggleKudos(session: FeedSession) {
    setBusySessionId(session.id);
    const supabase = createClient();

    if (session.likedByMe) {
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
              likedByMe: !item.likedByMe,
              kudosCount: item.likedByMe
                ? Math.max(0, item.kudosCount - 1)
                : item.kudosCount + 1,
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
            actorAvatarUrl={session.actorAvatarUrl}
            category={session.category}
            durationMinutes={session.durationMinutes}
            spotName={session.spotName}
            startedAt={session.startedAt}
            goalCompleted={session.goalCompleted}
            summary={session.summary}
            kudosCount={session.kudosCount}
            action={
              <Button
                type="button"
                size="sm"
                variant={session.likedByMe ? "default" : "outline"}
                onClick={() => toggleKudos(session)}
                disabled={busySessionId === session.id}
                className="rounded-full"
              >
                <Heart
                  className={`h-4 w-4 transition ${
                    session.likedByMe ? "fill-current" : ""
                  }`}
                />
                Kudos
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
