# The List Design System

## Brand Personality
Warm, inviting, curated, trustworthy. A cozy corner of the internet where only the best things live. Think: autumn afternoon in a well-loved library, warm amber light, wooden shelves, soft wool blankets.

## Color Palette

### Primary Colors
- **Amber (Primary):** `#D97706` — Buttons, links, active states, rating badges
- **Amber Dark:** `#B45309` — Hover states, focus rings
- **Amber Light:** `#F59E0B` — Accent highlights

### Background Colors
- **Cream (Page BG):** `#FAF5E9` — Main page background, warm paper feel
- **White (Card BG):** `#FFFFFF` — Cards, modals, interactive elements
- **Amber Glow:** `#FFFBEB` — Hero sections, highlighted areas

### Text Colors
- **Stone 900:** `#1C1917` — Headings, primary text
- **Stone 700:** `#44403C` — Body text
- **Olive:** `#78716C` — Secondary text, metadata
- **Olive Light:** `#A8A29E` — Tertiary text, timestamps

### Border & Accent
- **Stone 200:** `#E7E5E4` — Card borders, dividers
- **Rust:** `#9A3412` — Danger states, warnings, decorative accents
- **Olive Medium:** `#57534E` — Active borders, subtle accents

### Semantic Colors
- **Success:** `#059669` (Emerald) — Added/confirmed states
- **Error:** `#DC2626` (Red) — Error messages, blocked ratings
- **Warning:** `#D97706` (Amber) — Warnings, below-threshold indicators

## Typography

### Font Stack
- **Headings:** `Playfair Display` (serif) — All titles, hero text, section headers
- **Body:** `Inter` (sans-serif) — All body text, labels, metadata

### Type Scale
- **Hero:** 48px/56px (3rem/3.5rem) — Page title, serif, bold, tracking-tight
- **H1:** 36px/40px (2.25rem/2.5rem) — Section headers, serif, bold
- **H2:** 30px/36px (1.875rem/2.25rem) — Card titles, serif, semibold
- **H3:** 20px/28px (1.25rem/1.75rem) — Subsection headers, serif, semibold
- **Body Large:** 16px/24px (1rem/1.5rem) — Hero subtitle, inter
- **Body:** 14px/20px (0.875rem/1.25rem) — Default body, inter
- **Small:** 12px/16px (0.75rem/1rem) — Metadata, timestamps, badges
- **XSmall:** 11px/14px — Overlines, legal text

### Font Weights
- Headings: 700 (bold)
- Subheadings: 600 (semibold)
- Body: 400 (regular)
- Labels: 500 (medium)

## Spacing System

Use a 4px baseline. Common values:
- **xs:** 4px (1) — Tiny gaps
- **sm:** 8px (2) — Tight spacing
- **md:** 12px (3) — Default gap
- **lg:** 16px (4) — Card padding
- **xl:** 24px (6) — Section spacing
- **2xl:** 32px (8) — Large section gaps
- **3xl:** 48px (12) — Page padding

## Border Radius
- **sm:** 6px — Badges, small tags
- **md:** 8px — Buttons, inputs
- **lg:** 12px — Cards, modals
- **xl:** 16px — Large containers
- **full:** 9999px — Pills, avatars

## Shadows
- **sm:** `0 1px 2px rgb(0 0 0 / 0.05)` — Subtle card shadow
- **md:** `0 4px 6px -1px rgb(0 0 0 / 0.1)` — Elevated cards
- **lg:** `0 10px 15px -3px rgb(0 0 0 / 0.1)` — Modals, dropdowns

## Component Styles

### Cards
- Background: white
- Border: 1px solid stone-200
- Border radius: 12px
- Padding: 16px
- Shadow: sm
- Hover: slightly elevated shadow, subtle border tint to amber
- Transition: 150ms ease

### Buttons
- **Primary:** Amber background, white text, rounded-xl (12px), py-3 px-6, font-medium, text-sm
- **Hover:** Amber-dark background, subtle lift shadow
- **Secondary:** White background, stone-200 border, stone-600 text
- **Ghost:** No background, olive text, hover: stone-50 bg
- **Danger:** Rust/red background, white text

### Navigation
- **Mobile:** Bottom tab bar — fixed, cream background, stone border top, icons + labels
- **Desktop:** Top bar — fixed, cream background, inline links, subtle divide
- **Active tab:** Amber text, icon filled
- **Inactive tab:** Olive light text

### Input Fields
- Background: white
- Border: 1px solid stone-200, rounded-xl
- Focus: ring-2 amber/30, border amber
- Padding: 12px 16px
- Placeholder: olive-light

### Rating Badge
- Gold/silver pill badge
- 8.0+: Amber background (`#D97706`), white text
- Under 8.0: Stone-200 background, stone-500 text
- Star icon (filled, amber) + rating number

### Type Badge
- Small pill showing item type (Movie/Book/Food)
- Movie: blue gradient bg, white text
- Book: emerald gradient bg, white text
- Food: orange gradient bg, white text

## Layout Patterns

### Page Structure
- Top padding: 80px (for fixed nav)
- Bottom padding on mobile: 80px (for bottom nav)
- Max content width: 1200px (5xl)
- Centered with auto margins

### Grid System
- **Mobile:** 2 columns
- **Tablet:** 3-4 columns
- **Desktop:** 5-6 columns
- Gap: 12-16px

### Card Layout
- Aspect ratio: 3:4 (portrait, poster-style)
- Image fills top, full bleed
- Info below: title, creator, rating badge overlay on image top-right
- Hover: slight lift, shadow increase

### Hero Section
- Centered text, amber gradient background overlay
- Serif heading, subtitle in olive
- CTA button (amber primary) centered below

## Motion & Animation
- **Hover:** 150ms ease — color shifts, shadow changes
- **Transitions:** 200ms ease — page transitions, tab switches
- **No load animations** — keep it snappy, no splash screens
- **Scroll:** Subtle fade-in on scroll for card grids (optional)

## Iconography
- Use Lucide icons
- Size: 16-20px for inline, 24-28px for decorative
- Stroke width: 1.5-2
- Color: inherit from text or amber accent

## Empty States
- Centered, minimal
- Soft SVG illustration inline
- Text: olive, small, friendly
- CTA: ghost or secondary button to add first item

## Tone in UI Copy
- Friendly but not casual
- Warm but not cloying
- "Where the good things live."
- Short, weighty sentences. No filler.
