# Sessio

Web app for logging focused study sessions, visualizing effort, and sharing progress with friend groups.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Deployment:** Vercel + Supabase Cloud

## Project structure

```
app/              Next.js routes (landing, auth, app pages, API)
components/       UI and feature components (stubs)
lib/              Supabase clients, utilities, theme constants
types/            App and database types
supabase/         Migrations, seed data, CLI config
docs/             PRD, TRD, schema, implementation plan
```

## Getting started

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase URL and anon key from [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

3. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Apply database migrations (after filling in SQL stubs):

   ```bash
   npx supabase db push
   ```

## Documentation

See the `docs/` folder:

- `prd.md` — product requirements
- `trd.md` — technical requirements
- `backend_schema.md` — database schema and RLS
- `implementation_plan.md` — phased build plan
- `web_app_flow.md` — UX flows
- `uiux_design_brief.md` — design system

## Routes (scaffold)

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/auth/login`, `/auth/sign-up` | Authentication |
| `/dashboard` | Main dashboard |
| `/session/new` | Start session |
| `/session/[id]` | Session timer |
| `/session/[id]/complete` | Session completion |
| `/spots`, `/spots/[id]` | Campus spots |
| `/groups`, `/groups/[id]` | Groups and feed |
| `/profile` | User profile |
| `/feed` | Global feed (optional) |
| `/api/session-summary` | AI summary (server-only) |
