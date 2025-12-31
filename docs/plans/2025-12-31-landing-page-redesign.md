# Landing Page Redesign

**Date:** 2025-12-31
**Status:** Draft
**Source:** Stitch design export (`/Users/owen/Downloads/stitch_knockout_fpl_landing_page`)

## Overview

Complete redesign of the landing page using the new Stitch design system. This includes:
1. App-wide theming system update (dark green palette, Lexend font)
2. Full landing page rebuild with new component structure
3. Theme documentation for future reference

## Design Goals

- Modern dark theme with FPL green (`#00FF87`) accent
- Clean, professional marketing page
- Mobile-responsive layout
- Foundation for consistent theming across the app

---

## Part 1: Theming System

### Color Palette

| Token | CSS Variable | Hex | HSL | Usage |
|-------|--------------|-----|-----|-------|
| `background` | `--background` | `#0B1210` | `160 18% 4%` | Page background |
| `foreground` | `--foreground` | `#FFFFFF` | `0 0% 100%` | Primary text |
| `card` | `--card` | `#131C18` | `160 16% 9%` | Elevated surfaces |
| `card-foreground` | `--card-foreground` | `#FFFFFF` | `0 0% 100%` | Card text |
| `primary` | `--primary` | `#00FF87` | `153 100% 50%` | CTAs, accents |
| `primary-foreground` | `--primary-foreground` | `#0B1210` | `160 18% 4%` | Text on primary |
| `muted` | `--muted` | `#18241F` | `150 18% 12%` | Subtle backgrounds |
| `muted-foreground` | `--muted-foreground` | `#9ABCAC` | `158 22% 64%` | Secondary text |
| `border` | `--border` | `#20332A` | `157 18% 15%` | Borders, dividers |
| `ring` | `--ring` | `#00FF87` | `153 100% 50%` | Focus rings |

### Extended Colors (Tailwind only)

| Name | Hex | Usage |
|------|-----|-------|
| `primary-hover` | `#00CC6A` | Primary button hover state |
| `surface-card` | `#18241F` | Card backgrounds (alias) |
| `text-dim` | `#6B8A7A` | Tertiary text, placeholders |

### Typography

**Font Family:** Lexend (Google Fonts)
- Weights: 300 (light), 400 (regular), 500 (medium), 700 (bold), 900 (black)

**Scale:** Keep existing Tailwind config scale (`display-xl`, `heading-1`, etc.)

### Special Effects

```css
/* Green text glow */
.text-glow {
  text-shadow: 0 0 30px rgba(0, 255, 135, 0.2);
}

/* Button glow */
.btn-glow {
  box-shadow: 0 0 20px rgba(0, 255, 135, 0.25);
}
.btn-glow:hover {
  box-shadow: 0 0 30px rgba(0, 255, 135, 0.4);
}
```

---

## Part 2: Landing Page Structure

### Component Hierarchy

```
LandingPage
├── LandingHeader (sticky)
│   ├── Logo (icon + text)
│   ├── Login link
│   └── CTA Button
├── Hero
│   ├── Content (left)
│   │   ├── Headline (with green glow text)
│   │   ├── Subtext
│   │   ├── CTA Buttons (primary + secondary)
│   │   └── Trust Badges
│   └── BracketPreview (right)
│       ├── Seed Cards (Team A, Team B)
│       ├── Connector Lines
│       └── Winner Card + Trophy
├── Features
│   ├── Section Header
│   └── FeatureCard x3
├── Testimonials
│   ├── Section Header
│   └── TestimonialCard x3
└── Footer
    ├── Logo + Tagline
    └── Copyright
```

### Page Layout

```
┌─────────────────────────────────────────┐
│  LandingHeader (sticky, blur backdrop)  │
├─────────────────────────────────────────┤
│  Hero                                   │
│  ┌─────────────────┬───────────────────┐│
│  │ Headline        │ Bracket Preview   ││
│  │ Subtext         │ [animated later]  ││
│  │ [CTA] [CTA]     │                   ││
│  │ ✓ Free ✓ Sync   │                   ││
│  └─────────────────┴───────────────────┘│
├─────────────────────────────────────────┤
│  Features                               │
│  "Everything You Need to Run a Cup"     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Instant │ │ Auto-   │ │Share-   │   │
│  │ Brackets│ │ Scoring │ │able     │   │
│  └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│  Testimonials                           │
│  "What Managers Are Saying"             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Quote 1 │ │ Quote 2 │ │ Quote 3 │   │
│  └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│  Footer                                 │
│  Logo + Tagline | Copyright             │
└─────────────────────────────────────────┘
```

---

## Part 3: Component Specifications

### LandingHeader

**Purpose:** Sticky navigation for landing page only (not authenticated app)

**Elements:**
- Logo: Material Symbol `emoji_events` (gold/primary) + "Knockout FPL" text
- Login link: Plain text, navigates to `/login`
- CTA Button: "Create Tournament", navigates to `/signup`

**Styling:**
- `position: sticky`, `top: 0`, `z-index: 50`
- Background: `bg-background/90` with `backdrop-blur-md`
- Border: `border-b border-border`
- Height: `h-20`

### Hero

**Layout:** 2-column grid (`lg:grid-cols-2`), stacked on mobile

**Left Column:**
- Headline: "Turn Your FPL League Into a" + "Knockout Cup" (green with glow)
- Subtext: "Head-to-head battles. One survives. Automatic scoring from FPL. No spreadsheets required."
- Primary CTA: "Create Your Tournament" (green filled, glow effect)
- Secondary CTA: "View Demo" (outlined)
- Trust badges: "Free to start", "Official FPL Sync" with checkmark icons

**Right Column:**
- BracketPreview component (see below)

**Styling:**
- Subtle radial gradient glow behind content
- Padding: `py-20 md:py-28`

### BracketPreview

**Purpose:** Visual representation of a knockout bracket in the hero

**Elements:**
- Two seed cards (Team A as Seed #1, Team B as Seed #8)
- Connector lines (CSS borders with rounded corners)
- Winner card with "Winner" label
- Trophy icon (pulsing)
- Grid background pattern (subtle)

**Styling:**
- Container: `bg-card border border-border rounded-3xl`
- Seed cards: `bg-muted border border-border rounded-lg p-4`
- Winner card: `border-primary` with subtle glow
- Trophy: `bg-primary rounded-full` with pulse animation

**Future Animation Notes:**
- Cards could fade in sequentially on page load
- Connector lines could draw in with CSS animation
- Trophy could have a subtle bounce or glow pulse
- Consider using Framer Motion for orchestrated animations

### Features

**Layout:** Section with 3-column card grid

**Section Header:**
- Title: "Everything You Need to Run a Cup"
- Subtitle: "Ditch the spreadsheets. We handle the math so you can focus on the banter."

**Feature Cards (x3):**

| Icon | Title | Description |
|------|-------|-------------|
| `account_tree` | Instant Brackets | Automatically seeds players based on current rank or completely random draw. Supports double elimination. |
| `bolt` | Auto-Scoring | Scores sync directly from the official FPL API after every gameweek. Live bonus point updates included. |
| `share` | Shareable Links | Send a single public link to your league mates to track the live bracket on any device. No login required for viewing. |

**Card Styling:**
- Use shadcn `Card` component
- Icon container: `bg-primary/10 text-primary` rounded square
- Hover: `hover:border-primary/30` transition

### Testimonials

**Layout:** Section with 3-column card grid

**Section Header:**
- Title: "What Managers Are Saying"
- Subtitle: "Trusted by over 5,000 mini-leagues worldwide"

**Testimonial Cards (x3):**

| Name | Handle | Quote |
|------|--------|-------|
| Alex Johnson | @FPL_AlexJ | "Made our office league 10x more interesting. The live updates during the games make the group chat explode. Best addition to the season." |
| Sarah Miller | @SoccerSarah99 | "Finally, a way to settle the H2H debate without manual tracking. It handles all the bench boosts and chip calculations perfectly." |
| Mike Davies | @LeagueAdminMike | "Set it up in 5 minutes for our mini-league of 20 people. The bracket generation was instant and fair. Highly recommended." |

**Card Elements:**
- Avatar (circular, placeholder image)
- Name (bold white)
- Handle (primary color)
- Quote (italic, muted text)
- 5 stars (primary color)

**Card Styling:**
- Use shadcn `Card` component
- Avatar: `h-12 w-12 rounded-full border-2 border-primary/20`
- Hover: `hover:border-primary/20` transition

### Footer

**Layout:** Simple centered layout (expandable later)

**Elements:**
- Logo: Same as header
- Tagline: "The ultimate companion tool for your Fantasy Premier League season. Create cups, track scores, and crown a champion."
- Copyright: "© 2025 Knockout FPL. Not affiliated with the Premier League or Fantasy Premier League."

**Styling:**
- Background: `bg-background`
- Border: `border-t border-border`
- Padding: `py-16`
- Text: `text-muted-foreground` for tagline/copyright

---

## Part 4: File Changes

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/landing/LandingHeader.tsx` | Sticky nav for landing page |
| `src/components/landing/BracketPreview.tsx` | Animated bracket in hero |
| `src/components/landing/Features.tsx` | Features section with cards |
| `src/components/landing/Testimonials.tsx` | Testimonials section |
| `src/components/landing/Footer.tsx` | Page footer |
| `docs/theme.md` | Theme documentation |

### Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add new CSS variables for theme |
| `tailwind.config.js` | Update colors (remove legacy), add Lexend font |
| `index.html` | Add Lexend font import |
| `src/pages/LandingPage.tsx` | Update to use new components |
| `src/components/landing/Hero.tsx` | Complete rewrite |

### Files to Delete

| File | Reason |
|------|--------|
| `src/components/landing/ValueProps.tsx` | Replaced by Features |
| `src/components/landing/ValueProps.test.tsx` | Test for deleted component |
| `src/components/landing/SocialProof.tsx` | Replaced by Testimonials |
| `src/components/landing/SocialProof.test.tsx` | Test for deleted component |
| `src/components/landing/BracketMotif.tsx` | Replaced by BracketPreview |
| `src/components/landing/BracketMotif.test.tsx` | Test for deleted component |
| `src/components/landing/TrophyAnimation.tsx` | No longer needed |
| `src/components/landing/TrophyAnimation.test.tsx` | Test for deleted component |
| `src/components/landing/ShineEffect.tsx` | No longer needed |
| `src/components/landing/ShineEffect.test.tsx` | Test for deleted component |

---

## Part 5: shadcn/ui Usage

### Components Used

| Element | shadcn Component | Customization |
|---------|------------------|---------------|
| CTA buttons | `Button` | `variant="default"` for primary, `variant="outline"` for secondary |
| Feature cards | `Card`, `CardContent` | Custom icon layout, hover border |
| Testimonial cards | `Card`, `CardContent` | Custom avatar + quote layout |
| Trust badges | `Badge` | Custom with checkmark icon |

### No Additional Components Needed

Current shadcn components (`Button`, `Card`, `Badge`) are sufficient.

---

## Part 6: Implementation Order

1. **Theme foundation**
   - Update `index.html` with Lexend font
   - Update `src/index.css` with CSS variables
   - Update `tailwind.config.js`
   - Create `docs/theme.md`

2. **Landing page structure**
   - Create `LandingHeader.tsx`
   - Create `Footer.tsx`
   - Update `LandingPage.tsx` shell

3. **Hero section**
   - Rewrite `Hero.tsx`
   - Create `BracketPreview.tsx`

4. **Content sections**
   - Create `Features.tsx`
   - Create `Testimonials.tsx`

5. **Cleanup**
   - Delete old components
   - Delete old tests
   - Update/create new tests

---

## Appendix: Source Reference

The Stitch design files are located at:
```
/Users/owen/Downloads/stitch_knockout_fpl_landing_page/
├── knockout_fpl_landing_page/
│   ├── screen.png
│   └── code.html
├── dashboard_/_league_browser/
├── empty_state_-_no_tournaments_yet/
├── fpl_connection_/_onboarding/
├── tournament_bracket_view/
└── match_detail_view/
```

The landing page design is in `knockout_fpl_landing_page/code.html`.
