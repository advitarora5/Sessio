1. Brand & Visual Identity
Brand tone
Calm, modern, focused, social.
Feels like a hybrid of an aesthetic productivity dashboard and a Strava‑style progress app.
Keywords: deep work, campus, sessions, streaks, community.

2. Color Palette
Use one dark theme with purple accents and a light variant with navy/white.
Core dark theme (Dashboard / focus screens)
Background:
#050814 – Deep navy‑black (main app background, page canvas).
Surface (cards, modals):
#101529 – Slightly lighter navy for cards and panels.
Primary accent (Sessio purple):
#7C3AED – Vibrant violet/purple (primary buttons, active timer ring, links).
Secondary accent:
#4C51BF – Indigo for secondary buttons, chart highlights.
Text (primary):
#F9FAFB – Almost white for titles and main content.
Text (muted):
#9CA3AF – Gray for labels, timestamps, helper text.
Borders/dividers:
#1F2937 – Subtle lines between cards/sections.
Success / streak highlights:
#22C55E – Soft green for completed goals, streak badges.
Warning:
#F97316 – Orange for session cancellation, breaks.
Light theme (optional / marketing pages)
Background: #F9FAFF – Very light blue‑white.
Surface: #FFFFFF – Pure white cards.
Primary accent: #1F3A8A – Navy blue (buttons, links).
Secondary accent: #7C3AED – Same Sessio purple to keep brand consistent.
Text primary: #111827 – Dark gray/near‑black.
Muted text: #6B7280.
Contrast guidelines:
Ensure text contrast meets WCAG (dark text on light, light text on dark).

3. Typography System
Follow best practices: 2–3 typefaces max, high legibility, clear hierarchy.
Typefaces
Headings & brand:
Poppins or Satoshi (or similar geometric sans) – modern, friendly, high readability.
Body & UI text:
Inter or System UI – highly legible, widely available, great for dashboards.
Keep to these two families:
Heading font: Poppins (weight 500–700).
Body/UI font: Inter (weight 400–600).
Font sizes (web)
Base size: 16px (1rem) for body text.
H1: 32px, weight 700 (landing page headline, major section titles).
H2: 24px, weight 600 (dashboard section headers like “This Week’s Focus”).
H3: 20px, weight 600 (card titles, feed block titles).
Body: 16px, weight 400 (standard copy).
Caption / meta: 13–14px, weight 400 (timestamps, chip labels).
Button text: 14–16px, weight 600 (uppercase optional, but avoid shouting everywhere).
Line height:
Headings: 1.2–1.3.
Body: 1.5–1.6 for readability.
Hierarchy:
Use size + weight + color to create clear layers:
Title (H2) in bright text color.
Stat labels in muted gray.
Numbers in bold and purple accent.

4. Layout & Components
Global layout
Header:
Left: Sessio wordmark;
Center/Right: nav items (Dashboard, Spots, Groups, Profile), user avatar.
Content:
Desktop: Centered column with max width ~1200px; subtle side margin.
Sidebar optional for dashboard: left nav with icons (home, sessions, spots).
Spacing:
Use 8px grid (multiple of 8 for paddings/margins).
Card padding: 16–24px.
Section spacing: 32–48px between major blocks.
Key components
Primary button:
Fill: #7C3AED (purple), text white, rounded 9999px, subtle shadow.
Hover: slightly brighter/lighter purple; scale 1.01.
Secondary button:
Outline with purple border; text purple; transparent or card surface background.
Cards:
Rounded corners (12–16px).
Background #101529 (dark theme) or white (light).
Shadow: subtle (e.g., 0 10px 30px rgba(15,23,42,0.5)).
Input fields:
Understated borders (#1F2937), focus ring in purple.
Label above, helper text below in muted gray.
Charts:
Bars and rings using accent purple + indigo.
Background grid lines in #1F2937.
Timers:
Circular progress ring, stroke in purple gradient (e.g., from #7C3AED to #4C51BF).

5. Iconography & Motion
Icons
Use linear icons (Lucide/Feather style) for:
Timer / clock
Spot / map pin
Group / users
Streak / flame
Kudos / heart
Color:
Default in muted gray, highlight in purple when active.
Motion
Keep motion subtle, functional, not flashy.
On start session:
Timer circle scales up slightly, background gradient shifts.
On end session:
Progress ring completes with a smooth ease‑out; streak badge pulses once.
On kudos:
Heart scales up and fills with purple, then settles back.
Avoid long animations; keep them under 250ms.

6. Theming for Contexts
Dashboard theme
Dark navy background, purple accents.
Charts and cards floated visually above canvas (depth via shadow).
Session timer theme
Even darker background (#020617), attention on timer ring.
Only timer, goal, spot, and buttons visible; header minimized or hidden.
Landing / marketing
Light theme with navy + white, purple accent.
Big hero text, one illustration showing dashboard with purple theme.

7. Accessibility & UX Considerations
Contrast: ensure buttons and text pass contrast standards (test purple on dark backgrounds).
Tap targets: minimum 40x40px for interactive elements.
Avoid using color alone for key states (include icons/labels).
Provide clear focus styles (outline in purple) for keyboard navigation.

8. Copy & Tone Guidelines
Voice: supportive, straightforward, slightly playful.
Examples:
Dashboard: “This week you showed up for your work.”
Session complete: “Nice focus. Future you will be glad you logged this.”
Streak: “Streak: 4 days – keep it alive.”
Avoid jargon; emphasize benefits (clarity, progress, accountability) rather than features.

