import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasEnvVars } from "@/lib/utils";
import { BarChart3, Heart, MapPinned, TimerReset, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const previewStats = [
  { label: "This week", value: "8h 35m", icon: BarChart3 },
  { label: "Streak", value: "4 days", icon: TimerReset },
  { label: "Top spot", value: "Grainger", icon: MapPinned },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#022c22_0%,#065f46_42%,#f0fdf4_42%,#ffffff_100%)] text-foreground">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-heading text-xl font-semibold text-white lg:text-emerald-950">
          Sessio
        </Link>
        {hasEnvVars ? (
          <Suspense>
            <AuthButton />
          </Suspense>
        ) : (
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/auth/login">Set env vars first</Link>
          </Button>
        )}
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:pb-24 lg:pt-16">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            Strava-style accountability for deep work
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl lg:text-emerald-950">
            Log your deep work, map your study spots, and stay accountable with
            friends.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50 lg:text-emerald-900/80">
            Sessio turns focused study blocks into lightweight session cards,
            weekly analytics, campus spot insights, and group feeds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/session/new">Start a session</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/auth/sign-up">Create account</Link>
            </Button>
          </div>
        </div>

        <Card className="sessio-card overflow-hidden border-primary/20">
          <CardContent className="p-0">
            <div className="border-b border-border/80 bg-muted/40 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active session</p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold">
                    CS 225 MP debugging
                  </h2>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                  42m
                </span>
              </div>
            </div>
            <div className="grid gap-4 p-5">
              <div className="flex items-center gap-4 rounded-lg border border-border bg-background/50 p-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-primary/80 text-lg font-bold">
                  78%
                </div>
                <div>
                  <p className="font-medium">Grainger Level 2</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Goal checked, notes summarized, ready for the group feed.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {previewStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border bg-background/60 p-4"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <p className="mt-3 text-xl font-semibold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">CS Grind Squad</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  12 kudos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
