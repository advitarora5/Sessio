"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type TimerSession = Tables<"sessions"> & {
  spots: Pick<Tables<"spots">, "id" | "name" | "area"> | null;
};

type SessionTimerProps = {
  session: TimerSession;
};

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function SessionTimer({ session }: SessionTimerProps) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - new Date(session.start_time).getTime()) / 1000),
  );
  const targetSeconds = session.target_duration_minutes * 60;
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const progress = Math.min(100, (elapsedSeconds / targetSeconds) * 100);
  const ringStyle = useMemo(
    () => ({
      background: `conic-gradient(hsl(var(--primary)) ${progress * 3.6}deg, hsl(var(--muted)) 0deg)`,
    }),
    [progress],
  );

  async function cancelSession() {
    setIsCanceling(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        status: "canceled",
        end_time: new Date().toISOString(),
        duration_minutes: 0,
      })
      .eq("id", session.id);

    if (updateError) {
      setError(updateError.message);
      setIsCanceling(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-[calc(100vh-160px)] place-items-center">
      <Card className="sessio-card w-full max-w-3xl border-primary/20">
        <CardContent className="grid gap-8 p-6 text-center sm:p-10">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">{session.category ?? "Focus"}</Badge>
              {session.spots ? (
                <Badge variant="outline">
                  {session.spots.name}
                  {session.spots.area ? `, ${session.spots.area}` : ""}
                </Badge>
              ) : null}
            </div>
            <h1 className="font-heading text-3xl font-semibold">
              {session.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Stay in flow. {formatClock(remainingSeconds)} left on your target.
            </p>
          </div>

          <div className="mx-auto flex h-72 w-72 items-center justify-center rounded-full p-3 sm:h-80 sm:w-80" style={ringStyle}>
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-background shadow-inner">
              <span className="text-sm font-medium text-muted-foreground">
                Elapsed
              </span>
              <span className="mt-2 font-heading text-6xl font-bold">
                {formatClock(elapsedSeconds)}
              </span>
              <span className="mt-3 text-sm text-muted-foreground">
                Target {session.target_duration_minutes}m
              </span>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push(`/session/${session.id}/complete`)}
              className="rounded-full"
            >
              <CheckCircle2 className="h-4 w-4" />
              End Session
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={cancelSession}
              disabled={isCanceling}
              className="rounded-full"
            >
              {isCanceling ? (
                <PauseCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {isCanceling ? "Canceling..." : "Cancel Session"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
