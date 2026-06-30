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
