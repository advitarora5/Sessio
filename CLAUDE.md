# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sessio is a campus-focused deep-work app for UIUC students: log focus blocks, run a timer flow, view weekly analytics, browse campus study spots on a map, add friends/groups, and give "gold stars" in activity feeds. Next.js App Router (React 19) + Supabase (Postgres, Auth, RLS, Storage).

## Commands

```bash
npm run dev                  # local dev server
npm run build                # production build (run before claiming a change compiles)
npm run lint                 # eslint . — the only check besides build
npm run import:illini-spots  # seed/upsert campus spots into Supabase (needs service-role env)
npx supabase db push         # apply migrations in supabase/migrations/
```

There is **no test framework**. CI (`.github/workflows/ci.yml`) runs `lint` then `build` only — match that bar locally before pushing.

## Environment

Copy `.env.example` → `.env.local`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key also accepted), `SUPABASE_SERVICE_ROLE_KEY`. Optional: `OPENAI_API_KEY` + `OPENAI_MODEL` (without them, AI session summaries fall back to a locally-composed sentence). Map tiles default to the bundled local style; `NEXT_PUBLIC_MAPBOX_*` overrides are optional.

Path alias: `@/*` → repo root.

## Architecture

### Auth gating (two layers)
- **`proxy.ts` (repo root)** is the request middleware — Next.js's newer name for `middleware.ts`. It calls `updateSession` in `lib/supabase/proxy.ts` to refresh the Supabase cookie session on every matched request. Do not insert logic between `createServerClient` and `getUser` there.
- **`app/(app)/layout.tsx`** is the server-rendered shell for the authenticated route group. It re-checks `auth.getUser()` and `redirect("/auth/login")` if absent. All real app pages live under the `(app)` route group; public routes are `/`, `/login`, `/signup`, `/auth/*`.

### Three Supabase clients — pick deliberately
- `createClient()` from `lib/supabase/server.ts` — cookie-bound, **acts as the logged-in user, RLS enforced**. Default for reads/writes in server components and route handlers.
- `createServiceClient()` from `lib/supabase/server.ts` — service role, **bypasses RLS**. Only for privileged writes after you've already authorized the user (e.g. `app/api/session-summary/route.ts` reads-as-user to confirm ownership, then writes the summary via the service client; the spot importer also uses it).
- `createClient()` from `lib/supabase/client.ts` — browser client for `"use client"` components.

Never store any of these in a module-global — create a fresh one per request/function (Fluid compute requirement, noted in the source).

### Data layer
- Postgres types are generated into `types/database.ts`; all clients are typed with `<Database>`. Use the `Tables<"...">` helpers. Core tables: `profiles`, `sessions`, `spots`, `groups`, `group_members`, `friendships`, `likes`, `deadlines`.
- **RLS is on for every table.** Schema changes go through a new file in `supabase/migrations/` — never edit a live DB directly — and every migration must define SELECT/INSERT/UPDATE policies for `authenticated` users.
- API route handlers live in `app/api/**/route.ts` (friends, groups, session-summary).

### Campus spots & maps
- `lib/spots/illini.ts` (`server-only`) reads bundled GeoJSON/building-hours, normalizes coordinates, and upserts spots; `scripts/import-illini-spots.mjs` drives the seed. Keep these in sync with `supabase/seed.sql` when spot data changes.
- Map UI renders from the local style at `public/map/style.json`.
- **`illinispots/`** is a vendored copy of the upstream open-source illiniSpots app (incl. a Python `data-pipeline/`). It is the *source of the campus building/availability data*, not part of Sessio's build — don't edit it as if it were app code.

## Conventions (from agents.md)
- Don't remove or alter existing comments/docstrings unless asked.
- No `any` escape hatches — keep components and server functions strictly typed.
- Product/design context lives in `docs/` (prd, trd, backend_schema, uiux_design_brief, web_app_flow) and the root mirrors.
