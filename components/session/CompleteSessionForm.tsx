"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/utils/streak";
import type { Tables } from "@/types/database";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type CompleteSessionFormProps = {
  session: Tables<"sessions"> & {
    spots: Pick<Tables<"spots">, "id" | "name" | "area"> | null;
  };
};

export function CompleteSessionForm({ session }: CompleteSessionFormProps) {
  const router = useRouter();
  const [goalCompleted, setGoalCompleted] = useState(true);
  const [notes, setNotes] = useState(session.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationMinutes = useMemo(
    () =>
      Math.max(
        1,
        Math.round((Date.now() - new Date(session.start_time).getTime()) / 60000),
      ),
    [session.start_time],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        status: "completed",
        end_time: new Date().toISOString(),
        duration_minutes: durationMinutes,
        goal_completed: goalCompleted,
        notes: notes.trim() || null,
      })
      .eq("id", session.id);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    await fetch("/api/session-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id }),
    }).catch(() => undefined);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Nice focus.</h1>
        <p className="mt-2 text-muted-foreground">
          You logged {formatDuration(durationMinutes)}
          {session.spots ? ` at ${session.spots.name}` : ""}. Add the outcome
          before it lands in your dashboard.
        </p>
      </div>

      <Card className="sessio-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Complete session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label>Did you achieve your goal?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setGoalCompleted(value)}
                    className={`focus-ring rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                      goalCompleted === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40"
                    }`}
                  >
                    {value ? "Yes" : "Not yet"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="completion-notes">What did you finish?</Label>
              <textarea
                id="completion-notes"
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="focus-ring rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="A sentence or two is enough."
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" size="lg" disabled={isSaving}>
              <Check className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
