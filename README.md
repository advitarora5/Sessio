# Sessio

Sessio is a campus-focused, **feed-first** deep-work app for UIUC students — think
"Strava for studying." Students log focus blocks, run a timer flow, browse campus
study spots on a 3D map, add friends and groups, schedule sessions on a shared
calendar, and give classroom-style **gold stars** on an activity feed. Analytics
live on a secondary Dashboard tab; the app opens on the Feed.

- **Framework:** Next.js App Router (React 19) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui primitives (`components/ui`)
- **Motion:** framer-motion
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Storage)
- **Maps:** mapbox-gl / maplibre-gl with a bundled local style
- **Charts:** Recharts · **Icons:** lucide-react

---

## Quick start

### Requirements

- Node.js 18.18+ (Node 20/22 recommended; Vercel builds on Node 24)
- npm 9+

### Install & run

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

### Scripts

```bash
npm run dev                  # local dev server
npm run build                # production build (run before claiming a change compiles)
npm run lint                 # eslint .
npm run import:illini-spots  # seed/upsert campus spots (needs service-role env)
npx supabase db push         # apply migrations in supabase/migrations/
```

CI (`.github/workflows/ci.yml`) runs `lint` then `build` — match that bar locally
before pushing.

---

## Environment variables

Copy `.env.example` → `.env.local`.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client | Supabase project URL (auth + data). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Anon/publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` also accepted). |
| `SUPABASE_URL` | server | Supabase URL for server/service usage. |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Service role for privileged, **RLS-bypassing** writes/reads after the user is authorized. Never exposed to the client. |
| `OPENAI_API_KEY` | server, optional | AI session summaries. Without it, summaries fall back to a locally-composed sentence. |
| `OPENAI_MODEL` | server, optional | Summary model (default handled in code). |
| `NEXT_PUBLIC_MAPBOX_*` | client, optional | Overrides for the bundled local map style. |

Path alias: `@/*` → repo root.

---

## Architecture

### Auth gating (two layers)

- **`proxy.ts`** (repo root) is the request middleware (Next.js's newer name for
  `middleware.ts`). It calls `updateSession` in `lib/supabase/proxy.ts` to refresh
  the Supabase cookie session on every matched request.
- **`app/(app)/layout.tsx`** is the server-rendered shell for the authenticated
  route group. It re-checks `auth.getUser()` and redirects to `/auth/login` if
  absent. All real app pages live under the `(app)` route group; public routes are
  `/`, `/login`, `/signup`, and `/auth/*`.

### Three Supabase clients — pick deliberately

- `createClient()` from `lib/supabase/server.ts` — cookie-bound, **acts as the
  logged-in user, RLS enforced**. Default for reads/writes in server components and
  route handlers.
- `createServiceClient()` from `lib/supabase/server.ts` — service role, **bypasses
  RLS**. Only for privileged reads/writes after you've already authorized the user
  (e.g. reading *all* of a user's friend profiles for the calendar, feed fan-out).
- `createClient()` from `lib/supabase/client.ts` — browser client for `"use client"`
  components.

Never store any client in a module global — create a fresh one per request/function.

### Navigation & roles

- **Marketing (logged-out):** `components/marketing/OpeningHero.tsx` — video hero,
  brand copy, `Home` / `Log in` nav, and equal-weight `Start a session` /
  `Create account` CTAs. No app tabs are shown to logged-out visitors.
- **App shell (logged-in):** `components/layout/Header.tsx` + `HeaderNav.tsx` —
  navy header with the white Sessio logo, primary nav, a working notifications bell
  (`NotificationsBell.tsx`), the "Start session" button, and the user avatar.
- **Feed-first:** login and onboarding redirect to `/feed`, and the header logo
  links to `/feed`. Nav order is `Feed · Start · Spots · Groups · Friends · Calendar
  · Leaderboard · Dashboard`. There is no standalone Heatmap route — the 3D map and
  heat visualization live inside **Spots**.

### Data layer

Postgres types are generated into `types/database.ts`; all clients are typed with
`<Database>`. Use the `Tables<"...">` / `TablesInsert<"...">` helpers. Core tables:
`profiles`, `sessions`, `spots`, `groups`, `group_members`, `friendships`, `likes`,
`deadlines`, `calendar_events`, `event_rsvps`.

Schema changes go through a **new file** in `supabase/migrations/` — never edit a
live DB directly — and every migration defines the SELECT/INSERT/UPDATE/DELETE
policies needed for `authenticated` users.

### Campus spots & maps

`lib/spots/illini.ts` (`server-only`) reads bundled GeoJSON/building-hours,
normalizes coordinates, and upserts spots; `scripts/import-illini-spots.mjs` drives
the seed. Map UI renders from the local style at `public/map/style.json`.
`illinispots/` is a vendored copy of the upstream open-source illiniSpots app and is
the *source of the campus data*, not part of Sessio's build.

---

## Supabase & Row Level Security

**RLS is on for every table.** Highlights (see `supabase/migrations/` for the full,
authoritative set):

- **profiles** — users read/update their own; others are readable when attached to a
  session the viewer can see. Cross-user reads that must always resolve (e.g. the
  calendar friends list) use the service client.
- **sessions** — **private by default.**
  - `INSERT`: `user_id = auth.uid()`, and if `group_id` is set the user must be a
    member of that group.
  - `SELECT`: owner, `visibility = 'public'`, or group sessions where the viewer is
    a member.
  - `UPDATE`/`DELETE`: owner.
  - Because a group insert requires membership, the Start form defaults to
    **private** and only offers groups the user actually belongs to — this is what
    eliminates the "new row violates row-level security policy" error.
- **groups / group_members** — visible per privacy setting (public, owner, or
  member); `password_hash`/`invite_code` column reads are revoked from
  `authenticated`. `is_group_member()` is a `SECURITY DEFINER` helper that avoids
  RLS self-reference recursion.
- **calendar_events / event_rsvps** — event creators get full CRUD on their own
  events; invited users (via `event_rsvps`) and public events are readable. This is
  what allows creators to delete their events and makes pending invites visible.
- **friendships / likes / deadlines** — scoped to the participating user(s).

---

## UI architecture

- **Hero (`/`):** full-screen video background, friendly Inter-style typography,
  brand copy, and two equal CTAs.
- **Feed (`/feed`, home):** Strava-style `SessionCard`s (avatar, name, title,
  duration, spot, goal/DND badges, gold stars) driven by `GroupFeed`. RLS scopes the
  query to the viewer's own plus visible friend/group/public sessions, newest first.
- **Dashboard (`/dashboard`, secondary):** three-column analytics — profile & streak
  (left), KPI cards + weekly focus chart + activity feed (center), challenges / clubs
  / suggested friends (right).
- **Spots (`/spots`):** 3D Illini campus map with availability + heat visualization.
- **Groups / Friends / Calendar:** study clubs with public/private join flows; friend
  requests with a header notification dot; a week/month calendar with manual
  scheduling, friend/group invites, and RSVPs.

---

## Design principles

- **Color:** navy `#0F223A` for nav/primary, white cards, light-gray page surface
  (`bg-pageBg`). Metric deltas are green (up), red (down), gray (flat).
- **Contrast:** dark text (`text-[#0F223A]`) and muted `text-slate-600` on
  light/gray surfaces — never white text on gray.
- **Typography:** friendly sans (Inter / system UI) for headings and body.
- **Layout:** feed-first home for engagement; Strava-style three-column dashboard
  for analytics. Only navigation is navy — content surfaces stay light.

---

## Product docs

Deeper product/design context lives in `docs/` (`prd`, `trd`, `backend_schema`,
`uiux_design_brief`, `web_app_flow`) with root mirrors.
