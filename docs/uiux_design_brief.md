1. Brand & Visual Identity

Brand tone:
Calm, modern, focused, social. Sessio should feel like a clear campus productivity dashboard: cinematic in the hero, quiet and scannable in the app.

Keywords:
Deep work, campus, sessions, streaks, community.

2. Color Palette

Primary direction:
Use navy, white, and soft gray as the core brand system. Avoid green as a primary brand color; reserve warm accents such as amber for celebratory details like stars or streak icons.

Core colors:

Navy background:
#0F223A - Primary app canvas, hero fallback, primary buttons, chart bars, timer ring.

White:
#FFFFFF - Cards, form surfaces, high-contrast text on navy.

Soft gray:
#9CA3AF - Muted text on dark navy surfaces.

Accessible gray on light:
#6B7280 - Secondary labels and helper text on white cards.

Light section background:
#F7F9FC - Landing page product preview and subtle page bands.

Border:
#D7DEE8 - Subtle card, input, and divider borders on light surfaces.

Warning / celebration:
#F59E0B - Small celebratory accents only, such as stars or flame fills.

3. Typography System

Use one friendly UI typeface:
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif.

Headings, labels, buttons, and numbers all use Inter. Do not reintroduce decorative display or serif fonts for product UI.

Font sizes:
Base body: 16px.
H1: 48px+ on landing hero, with responsive scaling.
H2: 24px to 36px for section headers.
H3/card titles: 18px to 20px.
Caption/meta: 13px to 14px.
Button text: 14px to 16px, weight 600.

Line height:
Headings: 1.05 to 1.25.
Body: 1.5 to 1.6.

4. Layout & Components

Hero:
The video hero owns the full viewport. Keep the dashboard preview below the hero section, with no negative-margin overlap that hides the video.

App shell:
Use #0F223A as the authenticated app canvas. Header and sidebar sit on navy; cards sit on white.

Cards:
Use white cards with navy text, soft gray labels, 8px radius, and subtle navy-tinted shadows.

Buttons:
Primary buttons use navy fill with white text. Outline buttons stay transparent with subtle borders.

Charts:
Use navy for the main series, slate/blue variants for secondary series, and gray grid lines.

Forms:
Inputs and native selects inside cards should remain white or transparent on white, never navy-filled unless intentionally placed on a dark surface.

5. Iconography & Motion

Icons:
Use lucide-react. Keep icons at 16px to 20px in most controls. Use navy for primary icons and muted gray for passive icons.

Motion:
Motion should be subtle and functional. The SVG follow-scroll card is decorative, compact, and dashboard-scoped; it should not become a full-page scroll feature.

6. Accessibility & UX

Contrast:
Use white text on navy and navy text on white. Use #6B7280 for small muted text on white cards; #9CA3AF is best on dark navy.

Tap targets:
Keep interactive controls at least 40px tall when possible.

Focus:
Use the shared focus-ring utility and the navy ring token.

7. Copy Tone

Voice:
Supportive, straightforward, slightly playful.

Examples:
"This week you showed up for your work."
"Nice focus. Future you will be glad you logged this."
"Streak: 4 days - keep it alive."

8. Design System Update (Strava-inspired dashboard pass)

8.1 Color tokens (Tailwind)
Defined in tailwind.config.ts under theme.extend.colors:
- navy / navy.base: #0F223A - navigation, primary text on light, primary buttons, chart series.
- pageBg: #F3F4F6 - light gray canvas for all authenticated content areas. Only navigation is navy; content is never a full navy block.
- cardBg: #FFFFFF - cards and panels.
- borderSubtle: #D1D5DB - card/divider borders on light surfaces.
- textMutedSoft: #9CA3AF - muted text on dark navy surfaces.
- delta.up #16A34A / delta.down #EF4444 / delta.flat #6B7280 - metric deltas.

8.2 Metric deltas (green/red/gray)
Use lib/utils/delta.ts:
- trendFromValue(value, invert?) -> "up" | "down" | "flat".
- deltaToneClass(trend) -> text-green-600 (improved) / text-red-600 (declined) / text-gray-500 (neutral).
- deltaIcon(trend) -> ArrowUpRight / ArrowDownRight / Minus.
Apply to every week-over-week metric: StatCard KPIs and the Weekly Focus header caption. Positive change is always green with an up arrow; negative is red with a down arrow; neutral is gray.

8.3 Logo usage
The mark is an inline, recolorable SVG (components/brand/SessioMark.tsx) drawn with currentColor and a knockout mask, so the background is always transparent.
SessioLogo accepts variant="navy" | "white":
- variant="white" -> white mark + white wordmark. Use ONLY on navy surfaces (top nav/header).
- variant="navy" (default) -> navy mark + navy wordmark. Use on white/gray surfaces (marketing preview, auth cards, light dashboards).
Never place the navy mark on navy or the white mark on white.

8.4 Layout: navy top nav + gray canvas
- The authenticated shell (components/layout/AppShell.tsx) uses bg-pageBg.
- Navigation lives in a single navy top header (components/layout/Header.tsx) with a centered, active-highlighted nav (components/layout/HeaderNav.tsx). The legacy left sidebar was removed.
- Active nav item = white pill with navy text; inactive = slate text on navy.

8.5 Strava-inspired dashboard (app/(app)/dashboard/page.tsx)
Three-column grid on xl (300px / 1fr / 320px), stacks on smaller screens:
- Left: ProfileSummaryCard (avatar, name, handle, Friends/Sessions/Hours stats, latest session) + WeeklyStreakWidget (weeks streak badge + M-S day dots).
- Center: KPI StatCards, Weekly Focus chart with delta caption, and the StravaFeed activity feed.
- Right: Challenges (10-hour week + 7-day streak progress), Your clubs (groups), Suggested friends (Follow -> friend request).
StravaFeed (components/dashboard/StravaFeed.tsx) is a client component: framer-motion entrance/hover, a metrics row (focus time / goals hit / study spot), and social actions (gold star toggle, comment, share).

8.6 Hero + SVG scroll animation
The opening screen (components/marketing/OpeningHero.tsx) pairs the fullscreen video background with framer-motion entrance (fade-rise) and the Skiper19 scroll-follow stroke (components/ui/svg-follow-scroll.tsx) as the desktop right column. The animation responds to page scroll and is no longer buried in the dashboard.

8.7 Higgsfield asset conventions
Higgsfield MCP is used for IMAGE/VIDEO ASSETS ONLY (never code/layout generation).
- Store generated assets in /public/assets/higgsfield/.
- Keep prompts on-brand: deep navy #0F223A primary, soft gray accents, small amber highlights, clean white background, flat vector, no text.
- Example in use: feed-empty-state.png (FeedEmptyState). Preflight cost with get_cost before generating; poll job_status with sync:true.
