import { SessioLogo } from "@/components/brand/SessioLogo";
import { OpeningHero } from "@/components/marketing/OpeningHero";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  MapPinned,
  Star,
  TimerReset,
  Users,
} from "lucide-react";
import Link from "next/link";

const kpis = [
  {
    label: "Total Focus Time This Week",
    value: "8h 35m",
    delta: "+18% vs last week",
    icon: Clock3,
  },
  {
    label: "Sessions Completed",
    value: "11",
    delta: "+3 vs last week",
    icon: BarChart3,
  },
  {
    label: "Avg Session Length",
    value: "47m",
    delta: "+6% vs last week",
    icon: TimerReset,
  },
  {
    label: "% Goals Hit",
    value: "82%",
    delta: "+9 pts vs last week",
    icon: CheckCircle2,
  },
];

const weeklyBars = [
  { label: "Mon", height: "36%" },
  { label: "Tue", height: "54%" },
  { label: "Wed", height: "42%" },
  { label: "Thu", height: "78%" },
  { label: "Fri", height: "64%" },
  { label: "Sat", height: "48%" },
  { label: "Sun", height: "86%" },
];

const spotScores = [
  { name: "Grainger Level 2", score: 92 },
  { name: "ECEB Atrium", score: 81 },
  { name: "Main Library", score: 74 },
];

const topSpots = [
  { name: "Grainger Level 2", total: "3h 20m", score: "92%" },
  { name: "ECEB Atrium", total: "2h 45m", score: "81%" },
  { name: "BIF Study Commons", total: "1h 55m", score: "77%" },
  { name: "Main Library", total: "1h 30m", score: "74%" },
  { name: "EnterpriseWorks", total: "1h 05m", score: "69%" },
];

const recentSessions = [
  {
    title: "CS 225 MP debugging",
    duration: "42m",
    spot: "Grainger Level 2",
    score: "100%",
    dnd: true,
  },
  {
    title: "Research methods outline",
    duration: "55m",
    spot: "Main Library",
    score: "84%",
    dnd: true,
  },
  {
    title: "Calc review set",
    duration: "38m",
    spot: "ECEB Atrium",
    score: "76%",
    dnd: false,
  },
];

export default function Home() {
  return (
    <main className="bg-pageBg text-[#0F223A]">
      <OpeningHero />

      <section
        id="product"
        className="bg-pageBg px-5 py-16 text-[#0F223A] sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-5 rounded-2xl border border-borderSubtle bg-white p-5 shadow-[0_20px_80px_rgba(15,34,58,0.12)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SessioLogo variant="navy" tagline="Dashboard preview" />
              <h2 className="mt-3 text-3xl font-semibold text-[#0F223A] sm:text-4xl">
                See the week you actually showed up.
              </h2>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-borderSubtle bg-white px-4 py-2 text-sm font-medium text-[#0F223A] shadow-sm">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-500" />
              4-day streak
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-borderSubtle/70 bg-white p-6 shadow-[0_1px_6px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-medium text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-[#0F223A]">
                        {item.value}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#0F223A]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {item.delta}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-borderSubtle/70 bg-white p-6 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-[#0F223A]">
                Weekly Focus
              </h3>
              <span className="text-sm text-muted-foreground">Last 7 days</span>
            </div>
            <div className="mt-8 flex h-64 items-end gap-3 border-b border-l border-borderSubtle/70 px-2 pb-4 sm:gap-5">
              {weeklyBars.map((bar) => (
                <div
                  key={bar.label}
                  className="flex h-full flex-1 flex-col justify-end gap-3"
                >
                  <div
                    className="rounded-t-lg bg-[#0F223A]"
                    style={{ height: bar.height }}
                  />
                  <span className="text-center text-xs text-muted-foreground">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-xl border border-borderSubtle/70 bg-white p-6 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-8">
              <h3 className="text-xl font-semibold text-[#0F223A]">
                Focus by Spot
              </h3>
              <div className="mt-7 grid gap-5">
                {spotScores.map((spot) => (
                  <div key={spot.name} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-[#0F223A]">
                        {spot.name}
                      </span>
                      <span className="text-muted-foreground">
                        {spot.score}% goals hit
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#0F223A]"
                        style={{ width: `${spot.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-borderSubtle/70 bg-white p-6 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-8">
              <h3 className="text-xl font-semibold text-[#0F223A]">Top Spots</h3>
              <div className="mt-4 grid">
                {topSpots.map((spot, index) => (
                  <div
                    key={spot.name}
                    className="flex items-center justify-between gap-4 border-b border-borderSubtle/70 py-4 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-[#0F223A]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#0F223A]">
                          {spot.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {spot.total} total
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#0F223A]">
                      {spot.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-borderSubtle/70 bg-white p-6 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-[#0F223A]">
                Recent Sessions
              </h3>
              <Link
                href="/feed"
                className="text-sm font-medium text-[#0F223A] underline-offset-4 hover:underline"
              >
                View feed
              </Link>
            </div>
            <div className="mt-4 grid">
              {recentSessions.map((session) => (
                <div
                  key={session.title}
                  className="flex flex-col gap-3 border-b border-borderSubtle/70 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F223A] text-sm font-semibold text-white">
                      SE
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#0F223A]">
                        {session.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {session.duration} at {session.spot}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {session.dnd ? (
                      <span className="rounded-full border border-borderSubtle px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        DND
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#0F223A]">
                      <CheckCircle2 className="h-3 w-3" />
                      {session.score}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                      Gold stars
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3" id="contact">
            <Link
              href="/spots"
              className="focus-ring rounded-xl border border-borderSubtle bg-slate-50 p-5 transition hover:border-[#0F223A]"
            >
              <MapPinned className="h-5 w-5 text-[#0F223A]" />
              <p className="mt-3 font-semibold text-[#0F223A]">
                Map study spots
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Search Illini locations and see where sessions are heating up.
              </p>
            </Link>
            <Link
              href="/groups"
              className="focus-ring rounded-xl border border-borderSubtle bg-slate-50 p-5 transition hover:border-[#0F223A]"
            >
              <Users className="h-5 w-5 text-[#0F223A]" />
              <p className="mt-3 font-semibold text-[#0F223A]">
                Stay accountable
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share public focus blocks with friends and study groups.
              </p>
            </Link>
            <Link
              href="/auth/sign-up"
              className="focus-ring rounded-xl border border-borderSubtle bg-slate-50 p-5 transition hover:border-[#0F223A]"
            >
              <Flame className="h-5 w-5 text-[#0F223A]" />
              <p className="mt-3 font-semibold text-[#0F223A]">
                Start your streak
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a profile and log your first focused block.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
