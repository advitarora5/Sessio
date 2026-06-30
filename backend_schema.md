1. High‑Level Architecture
Database: Supabase Postgres (single project, public schema).
Auth: Supabase Auth (auth.users), extended with a public.profiles table.
Access control: Row Level Security (RLS) enabled on every table in public.
Client: Next.js (App Router) using Supabase JS client with anon key only in the browser; server routes can use service role key via environment variables.
Guiding principles:
Auth is owned by Supabase (auth schema). You never modify that schema; you create your own tables in public and reference auth.users.id.
All secrets (service role key, AI keys) stay server‑side and in .env.local / platform secrets, never in code or NEXT_PUBLIC_ vars.

2. Auth & Profile Schema
2.1 Supabase Auth (auth.users)
Supabase manages:
auth.users – user id (UUID), email, password hash, last sign‑in, etc.
You do not alter this table; you extend it.
2.2 Profiles table (public.profiles)
Purpose: store Sessio‑specific user metadata and link to auth.users.
Table: public.profiles
id UUID PK
References auth.users(id) ON DELETE CASCADE.
full_name text
username text UNIQUE (optional, for display in feeds).
avatar_url text
major text (e.g., “CS”, “Statistics”).
role text (e.g., “student”, “intern”).
created_at timestamptz default now().
Relationships:
One‑to‑one: profiles.id ↔ auth.users.id.
RLS:
Enable RLS:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
Policies (simplified, recommended pattern):
Users can SELECT/UPDATE their own row:
USING (auth.uid() = id) and WITH CHECK (auth.uid() = id).
Trigger:
On new auth user, auto‑create profile row.

3. Core Domain Tables
3.1 Spots (public.spots)
Stores campus study locations.
Columns:
id bigint PK (serial).
name text NOT NULL.
description text.
area text (e.g., “Engineering Quad”).
lat numeric (optional).
lng numeric (optional).
tags text[] (e.g., {quiet, outlets}).
created_at timestamptz default now().
Relationships:
sessions.spot_id → spots.id.
RLS:
For hackathon, simple: allow all authenticated users to SELECT spots; insert/update optional (admin‑only later).
Policy example:
SELECT for role authenticated and anon (if you want unauth browsing).

3.2 Groups (public.groups)
Represents friend groups / cohorts.
Columns:
id bigint PK.
name text NOT NULL.
owner_id uuid NOT NULL (FK → profiles.id).
invite_code text UNIQUE NOT NULL.
created_at timestamptz default now().
Relationships:
groups.owner_id → profiles.id.
group_members.group_id → groups.id.
sessions.group_id → groups.id (optional membership association).
RLS:
Only group members can SELECT the group.
Only owner can UPDATE/DELETE.
Simplified policies:
SELECT: user can read groups where they are in group_members.
INSERT: allowed for authenticated users; owner_id = auth.uid().
This pattern is similar to multi‑tenant RLS with a tenant_id/group membership.

3.3 Group Members (public.group_members)
Joins users to groups.
Columns:
id bigint PK.
group_id bigint NOT NULL (FK → groups.id).
user_id uuid NOT NULL (FK → profiles.id).
role text DEFAULT 'member' (e.g., member, admin).
joined_at timestamptz default now().
Relationships:
Many‑to‑many: profiles ↔ groups.
sessions.group_id must refer to a group where sessions.user_id is a member.
RLS:
Users can see rows where user_id = auth.uid().
Simplified:
SELECT: USING (user_id = auth.uid()).
INSERT: WITH CHECK (user_id = auth.uid()) (user can only join as themselves).

3.4 Sessions (public.sessions)
Core entity: a focus session.
Columns:
id bigint PK.
user_id uuid NOT NULL (FK → profiles.id).
group_id bigint NULL (FK → groups.id).
spot_id bigint NULL (FK → spots.id).
title text NOT NULL.
category text (course/project).
start_time timestamptz NOT NULL.
end_time timestamptz NULL (until completed).
status text NOT NULL DEFAULT 'active' (enum: active, completed, canceled).
target_duration_minutes int NOT NULL.
duration_minutes int NULL (computed on completion).
goal_completed boolean NULL.
notes text NULL.
summary_ai text NULL (from AI).
visibility text NOT NULL DEFAULT 'group' (enum: private, group, public).
created_at timestamptz default now().
Relationships:
sessions.user_id → profiles.id.
sessions.group_id → groups.id.
sessions.spot_id → spots.id.
RLS:
Base rule: user can always see their own sessions.
Additional rules for visibility:
private: only owner (user_id = auth.uid()).
group: group members can read sessions where group_id IN (groups they belong to).
public: any authenticated user can read.
Policies approach:
SELECT:
`USING (user_id = auth.uid()
OR (visibility = 'group' AND group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()))
OR (visibility = 'public'))`
INSERT:
WITH CHECK (user_id = auth.uid())
UPDATE:
Owner only: USING (user_id = auth.uid()).
Indexes:
Index on sessions.user_id, sessions.group_id, sessions.spot_id, sessions.start_time for analytics.

3.5 Likes / Kudos (public.likes)
Tracks “kudos” on sessions.
Columns:
id bigint PK.
session_id bigint NOT NULL (FK → sessions.id).
user_id uuid NOT NULL (FK → profiles.id).
created_at timestamptz default now().
Relationships:
Many‑to‑many: profiles ↔ sessions.
RLS:
Users can INSERT likes for any session they can see (SELECT allowed by session policies).
Users can DELETE their own likes (user_id = auth.uid()).
SELECT allowed for any authenticated user for sessions they can view.

3.6 Deadlines (public.deadlines) – optional
Manual deadlines for suggestions.
Columns:
id bigint PK.
user_id uuid NOT NULL (FK → profiles.id).
course text.
title text.
due_at timestamptz.
created_at timestamptz default now().
RLS:
Simple: user can access only their own deadlines (user_id = auth.uid()).

4. Auth Flow & Data Flow
4.1 Sign‑up / sign‑in
User signs up with email + password or magic link (Supabase Auth).
Supabase creates row in auth.users.
Trigger public.handle_new_user() runs:
Inserts row into public.profiles with id = NEW.id.
Next.js app:
Uses Supabase client to fetch profiles row for auth.uid() in server components.
Authentication details:
JWT token returned by Supabase stored in browser; used by Supabase client for RLS enforcement.
No custom auth logic in DB; rely on Supabase.

4.2 Creating a session
On /session/new, user submits form; Next.js client calls Supabase:
INSERT INTO sessions with user_id = auth.uid().
RLS policy ensures only the logged‑in user can insert sessions with their user_id.
Session appears as status = 'active', start_time = now().
Ending session:
When user ends session, client sends UPDATE sessions SET end_time, duration_minutes, status='completed', goal_completed, notes.
RLS: only owner can UPDATE their sessions.
Optionally, Next.js API route (server‑side) calls AI provider with goal + notes and updates summary_ai using service role key; this route is protected and not usable from the client without auth.

4.3 Reading data (dashboard, feeds, spots)
Dashboard queries:
sessions filtered by user_id = auth.uid() for personal charts.
Group feed queries:
sessions where group_id IN (groups user belongs to) and visibility != 'private'.
Spots:
All spots are globally readable; stats computed based on sessions user can see (or aggregated via server if you want global stats).
RLS ensures:
Users never see sessions they shouldn’t (private or group they’re not in).
Global stats can be computed server‑side with service role key (carefully) and exposed as aggregated values, not raw rows.

5. Secrets & Environment Strategy
5.1 Environment variables
Browser‑safe:
NEXT_PUBLIC_SUPABASE_URL – project URL.
NEXT_PUBLIC_SUPABASE_ANON_KEY – anon key.
Server‑only:
SUPABASE_SERVICE_ROLE_KEY – never exposed to client; used only in server routes or edge functions.
OPENAI_API_KEY or equivalent AI key.
Best practices:
Store server‑only secrets in .env.local (ignored by git) and Vercel secrets; never commit them.
Never prefix sensitive keys with NEXT_PUBLIC_.
5.2 API routes vs direct client calls
Reads/writes that rely purely on RLS and anon key (like sessions, groups, spots) can go directly via Supabase client.
Operations that require service role (e.g., AI integration updating summary_ai server‑side, global stats) go through Next.js API routes using server‑side Supabase client with service role.

6. Security Checklist
Based on Supabase and Next.js best practices:
RLS enabled on all tables: profiles, spots, groups, group_members, sessions, likes, deadlines.
Simple policies: keep USING and WITH CHECK expressions small, avoid complex joins.
No service role key in client: only in server routes.
Env secrets in .env.local + Vercel secrets, not committed.
Use HTTPS in production and secure headers (CSP, X‑Frame‑Options) via Next.js config or middleware.
Validate all user input on server routes (especially if you build custom APIs).
Indexes on foreign keys and time columns to keep analytics snappy.


