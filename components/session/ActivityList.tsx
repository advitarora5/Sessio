"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/utils/streak";
import { CheckCircle2, Clock3, MapPinned, Trash2 } from "lucide-react";
import { useState } from "react";

export type OwnActivity = {
  id: number;
  title: string;
  category: string | null;
  startedAt: string;
  durationMinutes: number | null;
  spotName: string | null;
  goalCompleted: boolean | null;
};

type ActivityListProps = {
  activities: OwnActivity[];
};

export function ActivityList({ activities }: ActivityListProps) {
  const [items, setItems] = useState(activities);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function deleteActivity(id: number) {
    if (!window.confirm("Delete this activity? This cannot be undone.")) {
      return;
    }
    setBusyId(id);
    setError(null);
    const supabase = createClient();
    // RLS ("Users can delete their own sessions") restricts this to the owner,
    // so no extra ownership check is needed here — the DB is the enforcement
    // layer. We still only surface the control on the user's own log.
    const { error: deleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError("Could not delete that activity. Please try again.");
      setBusyId(null);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setBusyId(null);
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No activities yet. Start a session to build your training log.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {items.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-border bg-white p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-[#0F223A]">
              {activity.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Clock3 className="h-4 w-4 text-primary" />
                {formatDuration(activity.durationMinutes)}
              </span>
              {activity.spotName ? (
                <span className="flex items-center gap-1">
                  <MapPinned className="h-4 w-4 text-primary" />
                  {activity.spotName}
                </span>
              ) : null}
              <span>{new Date(activity.startedAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {activity.category ? (
                <Badge variant="secondary">{activity.category}</Badge>
              ) : null}
              {activity.goalCompleted !== null &&
              activity.goalCompleted !== undefined ? (
                <Badge variant={activity.goalCompleted ? "default" : "outline"}>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {activity.goalCompleted ? "Goal met" : "Logged"}
                </Badge>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => deleteActivity(activity.id)}
            disabled={busyId === activity.id}
            aria-label={`Delete activity: ${activity.title}`}
            className="shrink-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
