# Landing Page & Branding Design

**Date:** 2025-12-16
**Status:** Ready for implementation
**Scope:** Full landing page with brand system overhaul

---

## Summary

Transform the current generic landing page into the full Knockout FPL branded experience. This includes updating the entire app's color system, typography, and implementing the complete landing page with hero, value props, and social proof sections.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Full landing page (Hero + Value Props + Social Proof) | Complete brand experience for first impression |
| Color approach | Replace shadcn defaults | Consistency across entire app |
| Typography | Custom type scale tokens | Matches design system, self-documenting code |
| Value prop icons | Emoji (⚔️, 🎯, 🏆) | Personality, matches docs |
| Social proof | Placeholder with humor | On-brand, replaceable later |

---

## Part 1: Brand Foundation

### 1.1 Color System

Update `tailwind.config.js` and `src/index.css` with brand colors.

**Brand Colors (CSS Variables):**

```css
--midnight: #0D1F3C;      /* Primary backgrounds, hero */
--navy: #1A3A5C;          /* Secondary backgrounds */
--gold: #C9A227;          /* CTAs, winners, glory */
--gold-light: #E8D5A3;    /* Hover states, taglines */
```

**Interface Colors:**

```css
--white: #FFFFFF;
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #E5E5E5;
--silver: #C0C0C0;
--gray-500: #666666;
--near-black: #1A1A1A;
```

**Semantic Colors:**

```css
--success: #28A745;       /* Victory green */
--error: #DC3545;         /* Elimination red */
--warning: #FFC107;       /* Deadlines, tension */
--info: #17A2B8;          /* Tips, neutral info */
```

**Tailwind Mapping:**

| shadcn Variable | New Value | Usage |
|-----------------|-----------|-------|
| `--primary` | Gold (#C9A227) | Primary buttons, CTAs |
| `--primary-foreground` | Near Black (#1A1A1A) | Text on gold |
| `--secondary` | Navy (#1A3A5C) | Secondary buttons |
| `--secondary-foreground` | White (#FFFFFF) | Text on navy |
| `--background` | White (#FFFFFF) | Page backgrounds |
| `--foreground` | Near Black (#1A1A1A) | Default text |
| `--muted` | Gray-100 (#F5F5F5) | Muted backgrounds |
| `--muted-foreground` | Gray-500 (#666666) | Secondary text |
| `--accent` | Gold-light (#E8D5A3) | Accent highlights |
| `--destructive` | Error red (#DC3545) | Destructive actions |

### 1.2 Typography

**Font:** Inter (via Google Fonts or @fontsource/inter)

**Custom Type Scale (Tailwind extend):**

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-xl` | 64px | 72px | 700 | Hero headline |
| `display-lg` | 48px | 56px | 700 | Section headlines |
| `heading-1` | 32px | 40px | 600 | Page titles |
| `heading-2` | 24px | 32px | 600 | Card headers |
| `heading-3` | 20px | 28px | 600 | Subsections |
| `body-lg` | 18px | 28px | 400 | Lead paragraphs, taglines |
| `body` | 16px | 24px | 400 | Default body |
| `body-sm` | 14px | 20px | 400 | Secondary info |
| `caption` | 12px | 16px | 400 | Labels, timestamps |
| `score` | 28px | 32px | 700 | Match scores |

### 1.3 Custom Shadows

```js
// tailwind.config.js extend
boxShadow: {
  'gold': '0 4px 14px rgba(201, 162, 39, 0.3)',
}
```

### 1.4 Animation Tokens

```js
// tailwind.config.js extend
transitionTimingFunction: {
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}
```

---

## Part 2: Landing Page Components

### 2.1 Navbar Component

**File:** `src/components/landing/Navbar.tsx`

**Structure:**
```
┌────────────────────────────────────────────────────────────────────┐
│  KNOCKOUT FPL                                           [Login]    │
└────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Background: Midnight Blue (`bg-midnight`)
- Height: 64px
- Position: Sticky top
- Max-width: 1280px, centered
- Logo: "KNOCKOUT FPL" — text-body-lg, bold, white, uppercase
- Login: Ghost link, white text, hover: gold

**Behaviors:**
- Logo click → `/`
- Login click → `/login`

**Test cases:**
1. Renders without crashing
2. Displays "KNOCKOUT FPL" logo text
3. Displays "Login" link
4. Logo links to home (/)
5. Login links to /login
6. Has midnight blue background

### 2.2 Hero Component (Update)

**File:** `src/components/landing/Hero.tsx`

**Structure:**
```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                       KNOCKOUT FPL                                 │
│               Every gameweek is a cup final.                       │
│              ┌─────────────────────────────┐                       │
│              │       Enter the Arena       │                       │
│              └─────────────────────────────┘                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Background: Midnight Blue (`bg-midnight`)
- Min-height: 80vh
- Content: Centered both axes
- Headline: "KNOCKOUT FPL" — text-display-xl, white, bold, uppercase
- Tagline: "Every gameweek is a cup final." — text-body-lg, light gold
- CTA: "Enter the Arena" — Gold bg, near-black text, ~200px × 56px

**Responsive:**
| Breakpoint | Headline | Padding |
|------------|----------|---------|
| Mobile | text-4xl | py-16 |
| Tablet | text-5xl | py-20 |
| Desktop | text-display-xl | py-32 |

**Behaviors:**
- "Enter the Arena" → `/signup`

**Test cases:**
1. Renders without crashing
2. Displays "KNOCKOUT FPL" headline
3. Displays tagline "Every gameweek is a cup final."
4. Displays "Enter the Arena" button
5. CTA links to /signup
6. Has midnight blue background
7. Headline is uppercase

### 2.3 ValueProps Component

**File:** `src/components/landing/ValueProps.tsx`

**Structure:**
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│       ⚔️         │  │       🎯         │  │       🏆         │
│  One opponent.   │  │  Your team.      │  │  Turn your       │
│  One winner.     │  │  Higher stakes.  │  │  league into     │
│  Every week.     │  │                  │  │  sudden death.   │
│  No more chasing │  │  Bring your FPL  │  │  32 enter.       │
│  points.         │  │  squad. No       │  │  1 lifts the     │
│  Just survive.   │  │  setup. Just     │  │  trophy.         │
│                  │  │  glory.          │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Specifications:**
- Background: White or Gray-50
- Padding: py-16 (mobile), py-24 (desktop)
- Layout: 3-column grid (desktop), stacked (mobile)
- Gap: 32px

**Card content:**

| Card | Icon | Headline | Body |
|------|------|----------|------|
| 1 | ⚔️ | One opponent. One winner. Every week. | No more chasing points. Just survive. |
| 2 | 🎯 | Your team. Higher stakes. | Bring your FPL squad. No setup. Just glory. |
| 3 | 🏆 | Turn your league into sudden death. | 32 enter. 1 lifts the trophy. |

**Card styling:**
- Icon: 48px emoji
- Headline: text-heading-3, semibold, near-black
- Body: text-body, gray-500
- Padding: 24px
- Text align: center

**Test cases:**
1. Renders without crashing
2. Displays 3 value prop cards
3. Card 1: displays ⚔️ icon
4. Card 1: displays "One opponent. One winner. Every week." headline
5. Card 1: displays "No more chasing points. Just survive." body
6. Card 2: displays 🎯 icon
7. Card 2: displays "Your team. Higher stakes." headline
8. Card 3: displays 🏆 icon
9. Card 3: displays "Turn your league into sudden death." headline
10. Responsive: stacks on mobile

### 2.4 SocialProof Component

**File:** `src/components/landing/SocialProof.tsx`

**Structure:**
```
┌────────────────────────────────────────────────────────────────────┐
│                  "Finally, FPL with actual stakes."                │
│                         — Someone on Reddit, probably              │
└────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Background: Gray-50 or subtle border-top
- Padding: py-16
- Max-width: 800px, centered
- Quote: text-body-lg, italic, near-black
- Attribution: text-body-sm, gray-500
- Text align: center

**Test cases:**
1. Renders without crashing
2. Displays quote text "Finally, FPL with actual stakes."
3. Displays attribution "— Someone on Reddit, probably"
4. Quote is styled as italic

### 2.5 LandingPage Composition

**File:** `src/pages/LandingPage.tsx`

**Structure:**
```tsx
<main>
  <Navbar />
  <Hero />
  <ValueProps />
  <SocialProof />
</main>
```

**Test cases:**
1. Renders Navbar
2. Renders Hero
3. Renders ValueProps
4. Renders SocialProof

---

## Part 3: File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `tailwind.config.js` | Update | Add brand colors, typography, shadows |
| `src/index.css` | Update | Update CSS variables, add Inter font |
| `src/components/landing/Navbar.tsx` | Create | New navigation component |
| `src/components/landing/Navbar.test.tsx` | Create | Tests for Navbar |
| `src/components/landing/Hero.tsx` | Update | New branding |
| `src/components/landing/Hero.test.tsx` | Update | Update tests for new content |
| `src/components/landing/ValueProps.tsx` | Create | New component |
| `src/components/landing/ValueProps.test.tsx` | Create | Tests for ValueProps |
| `src/components/landing/SocialProof.tsx` | Create | New component |
| `src/components/landing/SocialProof.test.tsx` | Create | Tests for SocialProof |
| `src/pages/LandingPage.tsx` | Update | Compose all sections |
| `src/pages/LandingPage.test.tsx` | Update | Update tests |

---

## Part 4: Implementation Order

### Phase 1: Brand Foundation
1. Install Inter font
2. Update tailwind.config.js with colors
3. Update tailwind.config.js with typography scale
4. Update tailwind.config.js with shadows
5. Update index.css with CSS variables

### Phase 2: Navbar Component (TDD)
1. Create test file with first test (renders)
2. Create minimal component to pass
3. Add test for logo text
4. Update component to pass
5. Add test for login link
6. Update component to pass
7. Add test for logo link destination
8. Add test for login link destination
9. Add test for background color
10. Refactor/style

### Phase 3: Hero Component Update (TDD)
1. Update tests for new headline text
2. Update component to pass
3. Update tests for new tagline
4. Update component to pass
5. Update tests for new CTA text
6. Update component to pass
7. Update tests for CTA destination
8. Update component to pass
9. Update tests for styling (background, uppercase)
10. Style and refactor

### Phase 4: ValueProps Component (TDD)
1. Create test file with first test (renders)
2. Create minimal component
3. Add test for 3 cards
4. Add tests for Card 1 content
5. Add tests for Card 2 content
6. Add tests for Card 3 content
7. Implement and style

### Phase 5: SocialProof Component (TDD)
1. Create test file with first test (renders)
2. Create minimal component
3. Add test for quote text
4. Add test for attribution
5. Style component

### Phase 6: LandingPage Composition
1. Update LandingPage to include all components
2. Update tests to verify composition
3. Visual verification with Playwright MCP

---

## Acceptance Criteria

### Functional
- [ ] Navbar displays logo and login link
- [ ] Hero displays headline, tagline, and CTA
- [ ] "Enter the Arena" navigates to /signup
- [ ] "Login" navigates to /login
- [ ] Value props display all 3 cards with correct content
- [ ] Social proof displays quote and attribution

### Visual
- [ ] Midnight Blue hero background
- [ ] Gold CTA button
- [ ] Light Gold tagline
- [ ] Inter font loaded and applied
- [ ] Responsive at all breakpoints

### Technical
- [ ] All unit tests pass
- [ ] No console errors
- [ ] WCAG AA color contrast
- [ ] E2E verification with Playwright MCP

---

## Notes

- Remove the purple/blue gradient from current Hero
- Remove the Badge component from current Hero (not in new design)
- The brand colors will affect other pages too (buttons, etc.) — this is intentional
- Future: Add subtle background animation to hero (bracket lines or starfield) — not MVP

---

*Design validated: 2025-12-16*
