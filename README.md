# Sessio

Sessio is a campus-focused deep work app for study sessions. Users can log focus blocks, complete a timer flow, see weekly analytics, browse UIUC campus study spots, add friends, create groups, and give gold stars in activity feeds.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase Auth, Postgres, Row Level Security
- Recharts for dashboard charts
- lucide-react for icons

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   OPENAI_API_KEY=
   OPENAI_MODEL=gpt-5.5
   ```

   `OPENAI_API_KEY` is optional. Without it, the summary route writes a local fallback sentence.

4. Apply the Supabase schema:

   ```bash
   npx supabase db push
   ```

   If you already have an older Sessio database, apply `supabase/migrations/0002_profiles_friends_illini_upgrade.sql` after the base schema to add onboarding fields, friend relationships, profile insert RLS, and spot upserts.

5. Load campus spots:

   ```bash
   npm run import:illini-spots
   ```

   The importer reads the cloned `illinispots` dataset and upserts UIUC buildings into `spots`. `supabase/seed.sql` remains available as a smaller fallback seed.

6. Run the app:

   ```bash
   npm run dev
   ```

## Core Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login`, `/signup`, `/auth/login`, `/auth/sign-up` | Supabase email/password auth |
| `/onboarding` | Profile setup for major, year, role, and study focus |
| `/dashboard` | Weekly focus chart, stats, prominent fire streak, top spots |
| `/session/new` | Start a focus session with 45/60/90/120 minute presets or a custom duration |
| `/session/[id]` | Active timer |
| `/session/[id]/complete` | Goal outcome, notes, AI summary trigger |
| `/spots`, `/spots/[id]` | Searchable campus spots, heat view, and spot details |
| `/heatmap` | Study heatmap powered by Illini spots plus Sessio session intensity |
| `/friends` | Friend requests, friend list, and friend session feed |
| `/groups`, `/groups/[id]` | Create/join groups and group activity feed |
| `/feed` | Public session feed |
| `/profile` | Profile editing, avatar upload, initials fallback, and focus totals |
| `/api/friends/request`, `/api/friends/[id]` | Friend request and relationship updates |
| `/api/session-summary` | Server-only session summary generation |

## Database

The full MVP schema, RLS policies, grants, indexes, and auth profile trigger live in:

```text
supabase/migrations/0001_init_sessio.sql
```

Incremental upgrades for friends, Illini spot upserts, avatar storage policies,
signup profile metadata, and DND sessions live in:

```text
supabase/migrations/0002_profiles_friends_illini_upgrade.sql
supabase/migrations/20260630192119_avatar_storage_and_branding_profile.sql
```

Campus spot seed data and the Illini importer live in:

```text
supabase/seed.sql
scripts/import-illini-spots.mjs
```
