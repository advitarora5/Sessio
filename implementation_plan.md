Phase 0 – Project & Supabase Setup (1–1.5 hours)
Create Supabase project
In Supabase dashboard, create a new project (US region, free tier is fine).
Copy project URL and anon key for later.
Initialize Next.js app with Supabase
Use the official template:
npx create-next-app -e with-supabase sessio
Confirm:
App Router, TypeScript, Tailwind are configured.
Environment variables
Create .env.local:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
Do not put service role or AI keys in NEXT_PUBLIC_*.
Install additional libraries
Charts: npm install recharts or chart.js react-chartjs-2.
Icons: npm install lucide-react.
Optional maps: npm install react-leaflet (if time).

Phase 1 – Database Schema & RLS (1.5–2 hours)
Create schema via SQL editor
In Supabase SQL editor, create tables:
profiles, spots, groups, group_members, sessions, likes, deadlines as defined in the schema doc (run one SQL migration).
Link profiles to auth.users
profiles.id FK to auth.users.id with ON DELETE CASCADE.
Enable RLS on all tables
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY; for each table.
Create basic policies
profiles: user can read/update only where id = auth.uid().
sessions: user can read/write their own sessions; group/public visibility handled via simple USING clause as in schema doc.
group_members: user can read rows where user_id = auth.uid() and join groups as themselves only.
groups: owner can update/delete; members can read.
spots: allow read to all authenticated users; writes limited (for hackathon seed spots manually).
Seed data
Insert a handful of spots (Grainger, ECEB, BIF, EnterpriseWorks) and optionally 1–2 demo groups.

Phase 2 – Auth & Profiles in Next.js (1–1.5 hours)
Supabase client utilities
Use or adapt lib/supabase/client.ts and lib/supabase/server.ts from the with‑supabase example to create client/server Supabase instances.
Auth flow
Implement sign‑in/sign‑up (email + password or magic link) using Supabase Auth.
Protect app pages by calling supabase.auth.getUser() in server components/middleware; redirect unauthenticated users to /login.
Profile sync
On first login, ensure profiles row is created via DB trigger (already in schema).
Build /profile page that reads profiles for auth.uid() and allows editing name/major.
Security check
Confirm:
No service role key is used in client components.
Anon key only in browser.

Phase 3 – Core Session Flow (MVP Heart) (2–3 hours)
Goal: Make start → run → complete session fully functional before anything else.
Start Session page (/session/new)
Form fields: title, category, target_duration_minutes, spot_id (dropdown), visibility, optional notes.
Fetch spots from Supabase in server component and pass to client form.
On submit:
INSERT INTO sessions with user_id = auth.uid(), status='active', start_time=now().
Session Timer page (/session/[id])
Load session by id for current user; if not active or not owner, redirect.
Implement timer:
Local state for elapsed time, but truth source is start_time.
Buttons:
End → navigate to completion flow.
Cancel → mark status='canceled' in DB.
Completion flow
UI to capture:
goal_completed boolean.
Optional notes.
On save:
Set end_time, compute duration_minutes, set status='completed'.
Redirect to Dashboard.
Streak calculation (client‑side)
On Dashboard, fetch user sessions and compute streak from last N days.
Keep logic in a utility function for reuse.
Verify RLS:
Attempt to access another user’s session; ensure query returns nothing thanks to policies.

Phase 4 – Dashboard & Analytics (1.5–2 hours)
Goal: Show weekly focus chart, stats, and recent sessions.
Dashboard route (/dashboard)
Server component:
Fetch completed sessions for auth.uid() in the last 7–30 days.
Weekly focus time chart
Aggregate sessions by day:
Sum duration_minutes per date.
Render bar/line chart with Recharts/Chart.js.
Session quality stats
Compute:
Total sessions this week.
Average duration.
Goal completion rate (goal_completed true / total completed).
Render stat cards.
Top spots for the user
Group sessions by spot_id:
Total time per spot.
Goal completion % per spot.
Display “Top 3 spots” list + one “Suggested spot”.
Make sure:
Queries are simple and indexed columns are used for performance.

Phase 5 – Spots & Campus Map (1.5 hours)
Goal: Implement Where Are You feature with spot list + detail, basic heat behavior.
Spots overview (/spots)
Fetch all spots.
For each, compute recent session count (last 24h or 7d) using related sessions.
Render cards with intensity (color/size) based on session count.
Spot detail (/spots/[id])
Fetch spot + related completed sessions.
Compute:
Total sessions last week.
Average duration.
Goal completion %.
Display recent session cards.
Integrate with Start Session
In /session/new, use spots data:
Default selection “Suggested spot”.
Map is optional; can start with cards/grid and add a map later if time.

Phase 6 – Groups & Social Feed (1.5–2 hours)
Goal: Implement minimal groups, membership, and activity feed to satisfy Mob Mentality & Activity Feed.
Group creation & join
/groups page:
Create group: inserts into groups with owner_id = auth.uid(), auto‑create group_members row.
Join group: enter invite_code, insert group_members with user_id = auth.uid().
Group feed (/groups/[id])
Fetch sessions where:
group_id = :id
visibility != 'private'
Render session cards with:
User avatar/name, title, duration, spot, AI summary (if present), kudos count.
Kudos
On card, “❤️” button:
Insert row into likes if not yet liked by user.
Delete to unlike.
Display count from likes per session.
Global feed (optional)
Quick /feed route:
Show recent public visibility sessions.
Ensure:
RLS allows group members to read group sessions, but not others.

Phase 7 – AI Summary Integration (0.5–1 hour)
Goal: Minimum AI usage for “Make No Mistakes” in hackathon.
Server API route
Create Next.js route /api/session-summary (server only).
Accept session_id, goal, notes from authenticated user.
Use SUPABASE_SERVICE_ROLE_KEY to:
Verify session ownership server‑side or rely on RLS.
Call AI provider (e.g., OpenAI) with goal + notes and generate summary.
DB update
Update sessions.summary_ai with AI response.
Integrate in completion flow
After user ends session:
Show “Generate summary” button or auto‑trigger call.
Display summary on completion screen and in cards.
Keep keys server‑side only; use environment variables, not hardcoded strings.

Phase 8 – Polish, Security, Deploy (remaining time)
UI & UX polish
Apply Sessio theme (purple/navy, typography) across:
Dashboard, timer, feeds, spots.
Ensure consistent spacing and responsive layout.
Security review
Confirm:
RLS enabled and policies tested for each table.
No service role key or AI key in client bundle.
Only NEXT_PUBLIC_SUPABASE_URL/ANON_KEY in front‑end.
Deployment
Push to GitHub (single repo).
Deploy Next.js app to Vercel:
Set env variables (Supabase URL/anon key + server secrets).
Confirm live URL works with:
Auth
Starting/completing sessions
Dashboard charts
Spots and at least one group feed.
YouTube demo prep
Script: show landing → start session → timer → completion (AI summary) → dashboard charts → spot detail → group feed & streak.


