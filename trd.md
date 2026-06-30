1. Overview
Product name: Sessio
Type: Web application (desktop‑first, mobile‑friendly)
Goal: Help students and researchers log deep‑work sessions, visualize weekly effort and study spots, and share sessions within friend groups for accountability.
Core technologies (recommended):
Frontend: Next.js (App Router, TypeScript, Tailwind CSS)
Backend / DB / Auth: Supabase (Postgres, Auth, Row Level Security, Storage)
Deployment: Vercel (Next.js) + Supabase cloud project
Charts: Recharts or Chart.js (client‑side)
Map / spots: Simple map (static or using Leaflet/Mapbox if time permits)
AI (optional): OpenAI or similar via serverless API route
Rationale: Next.js + Supabase is a widely documented, hackathon‑friendly stack with built‑in auth, RLS, and easy hosting.

2. Functional Requirements
2.1 Authentication & user accounts
FR‑1: User sign up / login
Users can sign up and log in using:
Email + password or magic link via Supabase Auth.
After login, users are routed to the Dashboard.
FR‑2: Profile
Each user has:
name
optional avatar_url
optional major / role (student, intern, etc.)
Profile page shows streak, total focused hours, and a list of groups joined.
Tech notes:
Use Supabase Auth client in Next.js, following the with-supabase template.
Enable RLS and policies on all tables; allow access only to authenticated role.

2.2 Focus sessions
FR‑3: Start session
From dashboard, user clicks “Start Session” → sees a form with:
title (text)
category (e.g., CS 225, research, startup)
target_duration_minutes
spot_id (dropdown of campus spots)
optional notes
“Visibility” toggle: public to groups / private
After submit, user is taken to a Session Timer page.
FR‑4: Session timer
Timer displays:
Goal text (title)
Spot name
elapsed or remaining time
End Session button
Cancel Session button
If user refreshes, timer state should survive using DB + local state (simple check of ongoing session).
FR‑5: Complete / cancel session
On End Session:
Calculate actual_duration from timestamps.
Ask “Did you accomplish your goal?” → boolean.
Optional final notes.
On Cancel Session:
Mark status = canceled; do not count toward streak.
After completion, a Session Card is created and appears in the dashboard and relevant feed.
FR‑6: “Time‑lapse” representation (MVP)
MVP: No real video recording; represent as:
Progress ring, static icon, and timestamps.
Stretch: capture 1–3 snapshots via getUserMedia (if supported) and store small images in Supabase Storage; show as tiny GIF or carousel.

2.3 Dashboard & analytics (Insight Engine)
FR‑7: Dashboard overview
After login, the Dashboard shows:
Weekly focus time chart.
Session quality stats.
Top study spots.
FR‑8: Weekly focus time chart
Chart plotting last 7 days:
x‑axis: date
y‑axis: total minutes of completed sessions that day.
Summarize total hours this week.
FR‑9: Session quality stats
Show cards:
Total sessions in last 7 days.
Average duration of completed sessions.
Goal completion rate (% of sessions with goal_completed = true).
FR‑10: Personal spot performance
List Top 3 spots for the user:
Total time studied at each spot.
Goal completion rate at each spot.
Provide “Suggested spot” (the spot with highest completion rate or most time).
These features satisfy Insight Engine and For You in the hackathon’s optional list.

2.4 Study spots & campus map (Where Are You?)
FR‑11: Spot catalog
Each spot has:
id
name (e.g., Grainger Level 2)
description
area (e.g., “Engineering Quad”)
optional lat, lng
tags (quiet, outlets, etc.)
FR‑12: Campus map page
Page shows:
Map or grid of spots.
For each spot: marker or card with basic stats (sessions count in last week).
Implement heat map behavior via:
Color intensity or size proportional to recent session count.
FR‑13: Spot pages
Clicking a spot opens a detail page:
Total sessions all‑time and last week.
Average session duration.
Goal completion rate.
Recent sessions list (user, title, duration).
This meets Where Are You with a meaningful location feature.

2.5 Groups, feed & social (Mob Mentality, Activity Feed)
FR‑14: Friend groups
Users can:
Create a group: name, optional description.
Join via group code.
Groups store:
id, name, owner_id.
FR‑15: Group feed
Each group has an activity feed with events:
Completed sessions (public).
New members joined.
Session cards in the feed show:
User name, title, duration, spot, time, basic stats.
FR‑16: Global feed (optional)
Simple “Recent public sessions” feed across all users.
FR‑17: Kudos (likes)
Users can give “kudos” to sessions.
Kudos count appears on session cards.
FR‑18: Streaks
For each user:
Calculate streak = consecutive days with ≥1 completed session.
Display streak in profile and on dashboard.
These cover Mob Mentality and Activity Feed optional features.

2.6 Suggestions & calendar (Plugged In, For You – light)
FR‑19: Manual deadlines
Users can add deadlines:
course, title, due_at.
Dashboard shows upcoming deadlines and suggests sessions:
“Exam in 3 days – start a session?”
FR‑20: Simple goal suggestions
Dashboard banner suggestions:
“You haven’t studied Course X in 3 days.”
“Most productive spot last week: Spot Y.”
FR‑21: Calendar integration (stretch)
Post‑hackathon, integrate Google Calendar via OAuth to pull events labeled as study or exam.
Not mandatory for MVP due to time and complexity.

2.7 AI summary (Make No Mistakes – minimal)
FR‑22: AI session summary
On session completion:
Send goal + notes to AI via a Next.js API route.
Receive a 1‑sentence summary (e.g., “Reviewed lecture 12 and solved 3 practice problems.”).
Store summary_ai on the session.
Display in session cards and spot pages.
This is enough to claim AI usage in a concrete way.

3. Non‑Functional Requirements
3.1 Security & RLS
NFR‑1: Row Level Security
RLS enabled on all Supabase tables.
Policies:
sessions: user can only SELECT/INSERT/UPDATE/DELETE rows where user_id = auth.uid(), except reading public sessions in groups.
groups: only members can read group info; only owner can change group settings.
spots: read‑only for all authenticated users; writes limited to admin if needed.
NFR‑2: Secret handling
Supabase service key must never be exposed client‑side; only anon key used in browser.
Env vars stored in .env.local (Supabase URL + anon key, AI API key).
3.2 Performance & scalability
NFR‑3: Query performance
Index columns used in RLS and frequent filters:
user_id on sessions and group_members.
spot_id on sessions.
group_id on group_members and sessions.
Keep queries simple; avoid complex joins for v1.
NFR‑4: Real‑time (stretch)
If time allows, use Supabase Realtime to:
Update group feed and dashboard charts live when sessions complete.
3.3 Deployment & DevOps
NFR‑5: Deployment
Deploy Next.js app on Vercel.
Supabase project in US‑based region.
Ensure environment variables set correctly in Vercel and local dev.
NFR‑6: Git & CI
One public GitHub repo with:
README explaining app, stack, and setup.
Basic tests optional due to time.

4. High‑Level Architecture
4.1 Frontend structure (Next.js App Router)
Key routes:
/ – Landing (brief marketing + “Login” button).
/dashboard – Main dashboard (charts, stats, spot suggestions, start session button).
/session/new – Start session form.
/session/[id] – Session timer + details.
/spots – Campus spots overview / map.
/spots/[id] – Spot detail page.
/groups – List groups, create new group.
/groups/[id] – Group feed.
/profile – User profile, streaks, total hours.
Use shared layout components:
Header (Sessio logo, nav links, profile menu).
Sidebar (optional: quick nav for dashboard, spots, groups).
SessionCard, SpotCard, GroupCard, StatCard, Chart components.
4.2 Backend (Supabase)
Core tables (simplified):
profiles
id, name, avatar_url, major, created_at.
spots
id, name, description, area, lat, lng, tags.
groups
id, name, owner_id, created_at.
group_members
group_id, user_id, created_at.
sessions
id, user_id, group_id?, spot_id, title, category, start_time, end_time, status, duration_minutes, goal_completed, notes, summary_ai.
likes
id, session_id, user_id.
deadlines
id, user_id, course, title, due_at.

5. Implementation Priorities for a 12‑Hour Hackathon
Order of work to keep scope realistic:
Supabase setup:
Create project, define tables, enable RLS with simple auth.uid() policies.
Next.js base app:
Use create-next-app -e with-supabase, configure auth and Tailwind.
Sessions flow:
/session/new form, /session/[id] timer, DB writes, completion flow.
Dashboard with charts:
Fetch sessions; compute weekly chart and simple stats client‑side.
Spots list & pages:
Seed spots; /spots and /spots/[id] views.
Groups + feed:
Minimal group creation/join; group sessions feed.
Streak calculation:
Simple function to compute streak from user’s sessions.
AI summary route (if time):
Serverless function, integrate on session completion.
This TRD should give Codex and Cursor everything they need to scaffold Sessio with clear models, routes, and security assumptions while staying within hackathon reality.

