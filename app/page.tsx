import { AuthButton } from "@/components/auth-button";
import { SessioLogo } from "@/components/brand/SessioLogo";
import { Button } from "@/components/ui/button";
import { hasEnvVars } from "@/lib/utils";
import { BarChart3, MapPinned, Star, TimerReset, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const previewStats = [
  { label: "This week", value: "8h 35m", icon: BarChart3 },
  { label: "Streak", value: "4 days", icon: TimerReset },
  { label: "Top spot", value: "Grainger", icon: MapPinned },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_62%,#ecfdf5_100%)] text-foreground">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="Sessio home">
          <SessioLogo priority tagline="Deep work, mapped." />
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

      <section className="mx-auto flex max-w-7xl flex-col px-5 pb-16 pt-8 lg:pb-24 lg:pt-14">
        <div className="max-w-4xl">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
            Social accountability for deep work
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-emerald-950 sm:text-5xl lg:text-6xl">
            Log your deep work, map your study spots, and stay accountable with
            friends.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-900/80">
            Sessio turns focused study blocks into lightweight session cards,
            weekly analytics, campus spot insights, and classroom-style gold
            stars from friends.
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

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active session</p>
                <h2 className="mt-1 font-heading text-2xl font-semibold text-emerald-950">
                  CS 225 MP debugging
                </h2>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                42m
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-primary/80 text-lg font-bold text-emerald-950">
                78%
              </div>
              <div>
                <p className="font-medium text-emerald-950">Grainger Level 2</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Goal checked, notes summarized, ready for the group feed.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {previewStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border bg-emerald-50/60 p-4"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-xl font-semibold text-emerald-950">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium text-emerald-950">
                    CS Grind Squad
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  12 gold stars
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
              <p className="text-sm font-medium text-emerald-900">
                Campus heat
              </p>
              <div className="mt-4 h-36 rounded-lg border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_52%,#dcfce7_100%)] p-4">
                <div className="relative h-full">
                  <span className="absolute left-[18%] top-[42%] h-5 w-5 rounded-full bg-emerald-500/60 ring-4 ring-emerald-200" />
                  <span className="absolute left-[55%] top-[24%] h-9 w-9 rounded-full bg-emerald-600/70 ring-4 ring-emerald-200" />
                  <span className="absolute left-[72%] top-[62%] h-7 w-7 rounded-full bg-emerald-500/50 ring-4 ring-emerald-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
