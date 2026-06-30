Product Vision
A web app named Sessio for students and researchers to log focused study/work sessions, visualize their effort (time, streaks, spots), and share their progress with friends for accountability and motivation.
The app replaces “battery‑draining time‑lapse no one watches” with lightweight session cards, analytics, and campus heat maps.

Target Users & Primary Use Cases
Users
Primary: UIUC students and Research Park interns/researchers who want to track deep work.
Secondary (stretch): Tutors and study group leaders who want to host focus sessions.
Core Use Cases (MVP)
Start a focus session with a goal and study spot, run the session, and complete it.
See a personal dashboard: weekly focus time, session quality stats, and favorite spots.
Browse a campus map with a heat map of where people are studying.
Scroll a simple activity feed showing friends’ recent sessions.

MVP Feature Set (12‑hour build)
Focus on one clean core flow and 3–5 optional features from the deck: Insight Engine, Where Are You, Mob Mentality, Memory Lane, Activity Feed.
1. Sessions (Core)
User story: As a student, I want to start a timed focus session with a specific goal so I can track my deep work.
Requirements:
Start Session form:
Fields: title (e.g., “CS 225 MP3”), category (Course/Project), duration target (minutes), spot (select from list), optional notes.
Optional: toggle “public to my groups” vs “private”.
Session timer page:
Shows countdown or elapsed time, goal text, spot, and a simple progress indicator.
“End Session” and “Cancel Session” buttons.
On session completion:
Save start_time, end_time, actual_duration, goal_completed? (checkbox), spot, notes.
Generate a session card for dashboard/feed (no full video; just stats and optional tiny visual).
Timelapse approach (web‑friendly, hackathon‑safe):
MVP: No real video recording.
Represent “time‑lapse” as a progress ring + static thumbnail (e.g., generic study illustration or shot user uploads once).
Stretch (if time): use getUserMedia to take 1–3 snapshots during session and stitch into a low‑FPS GIF client‑side.
This keeps it strictly a web app, avoids heavy recording/storage, and is still demo‑able.

2. Study Spots & Campus Map (Core)
User story: As a student, I want to see where people are studying on campus and which spots are best for deep work.
Requirements:
Spot model:
Fields: name, description, building/campus area, optional tags (quiet, outlets, crowded), lat/lng.
Seed with a few UIUC spots (Grainger, ECEB, BIF, EnterpriseWorks, etc.).
Spot selection:
When starting a session, user picks a spot from a dropdown or search.
Campus map page:
Simple map (e.g., using a lightweight map library or a static map with clickable cards).
Heat map visualization:
Represent intensity by spot card styling (size or color) based on number of sessions in the last X hours/days.
Spot detail page:
Shows stats: total sessions, average session duration, % goals completed.
Shows a list of recent sessions at that spot (titles + durations).
This hits “Where Are You? Add a meaningful, location‑based feature.”

3. Analytics Dashboard – Insight Engine (Core)
User story: As a user, I want to see how much focused time I’m putting in each week and which spots work best for me.
Requirements:
Weekly focus time chart:
Bar or line chart: total focused minutes/hours per day in the last 7 days.
Session quality stats:
Cards showing:
Total sessions this week
Average duration
% goals completed
Spot performance for the user:
“Top 3 spots” ranked by:
Total time studied there.
Average goal completion rate.
All charts are client‑side using data from Supabase (no heavy BI stack).
This satisfies Insight Engine: charts/maps/dashboards from data.

4. Suggestions & Calendar (Light MVP)
User story: As a user, I want simple nudges on what to study and where, based on my past behavior.
MVP (low complexity):
Spot suggestion:
On start session form, show “Suggested spot” based on most frequently used spot or highest completion rate.
Goal suggestion:
On dashboard, a banner:
“You haven’t studied Course X in 3 days – start a 45‑min session?”
Calendar sync:
MVP: user can enter upcoming deadlines manually (course, deadline date).
Stretch: very basic ICS import or Google Calendar integration if you have time.
This loosely covers For You and begins Plugged In without over‑engineering.

5. Social & Accountability (Core but simple)
User story: As a student, I want to see my friends’ sessions and feel accountable to keep up.
Requirements:
Regular users (students):
Auth: simple email + password or magic link via Supabase.
Can create sessions, join friend groups, view feeds.
Friend groups:
Users can create a group (e.g., “CS 225 Grind Squad”).
Join by invite code.
Activity feed (per group + global):
Shows recent completed sessions:
User name, session title, duration, spot, time.
Basic interactions: “Kudos” (like) count.
Streaks:
For each user: number of consecutive days with ≥1 completed session.
Display streak on profile and session cards.
This covers Mob Mentality (shared data), Activity Feed, and builds social accountability.

6. Tutors & Discovery (Stretch)
Given 12 hours, keep tutors light or mark as post‑hackathon:
MVP: simple “Tutor” badge users can toggle in profile and optionally list “subjects”.
Stretch:
Search page for tutors by subject.
Ability to follow or message tutors.
Mention in your pitch as a clear roadmap, but don’t sink hackathon time into full marketplace features.

7. AI (Minimal MVP)
To satisfy Make No Mistakes (AI/LLM) without heavy infra:
On session completion, send goal + notes to an LLM (e.g., OpenAI) and:
Generate a 1‑sentence “session summary”.
Show this summary on the session card in dashboard/feed.
One simple API call per session is enough to say you’re using AI meaningfully.

Non‑Functional & Hackathon Constraints
12‑hour build:
Prioritize:
Session flow (start → timer → complete).
Dashboard with basic charts.
Spot selection + spot pages.
Simple feed and streaks.
Defer heavy integrations (full calendar sync, tutors marketplace, complex AI features).
Web app only:
Next.js (or simple React/Vite) + Supabase backend.
No browser extension or native app in hackathon scope.
Judging criteria alignment:
Shipped live URL (Vercel + Supabase) with a clear core flow.
Data security:
Env vars hidden.
Row‑level security in Supabase per user.
No secret leaks in client.
Execution & demo clarity:
One narrative: “Students log deep work, see their stats and spots, and share progress with groups.”

Data Model (MVP)
High‑level tables:
users
id, name, email, avatar_url, is_tutor (bool).
groups
id, name, owner_id, invite_code.
group_members
group_id, user_id, role (member/admin).
spots
id, name, description, lat, lng, tags.
sessions
id, user_id, group_id?, spot_id, title, category, start_time, end_time, duration, goal_completed (bool), notes, summary_ai.
likes (kudos)
id, session_id, user_id.
deadlines (stretch)
id, user_id, course, title, due_at.

Core UX Flows
Onboarding:
Sign up → choose name → optionally join/create a group → land on dashboard.
Start session:
Click “Start Focus Session” → fill goal & spot → start timer.
Complete session:
End session → mark goal complete? → optional notes → AI summary → see session card.
Dashboard:
Weekly chart, stats, spots list, streak, “suggested spot/goal”.
Map & spots:
View campus map → click spot → see stats and recent sessions.
Feed:




