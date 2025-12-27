# Landing Page Design

## Overview

The landing page is the first impression. Its purpose: create desire, make visitors feel the stakes before they even sign up.

**Core message:** "Every gameweek is a cup final."

**Primary CTA:** "Enter the Arena" → Sign Up flow

---

## Page Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  NAVIGATION BAR                                                    │
│  Logo + Login                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  HERO SECTION                                                      │
│  Midnight Blue background                                          │
│  Headline + Tagline + CTA                                          │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  VALUE PROPS SECTION                                               │
│  3-column grid                                                     │
│  White/Gray-50 background                                          │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SOCIAL PROOF SECTION                                              │
│  Testimonial quote                                                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component 1: Navigation Bar

```
┌────────────────────────────────────────────────────────────────────┐
│  KNOCKOUT FPL                                           [Login]    │
└────────────────────────────────────────────────────────────────────┘
```

### Specifications

| Element | Specification |
|---------|---------------|
| Background | Midnight Blue (#0D1F3C) |
| Height | 64px |
| Position | Sticky top |
| Container | Max-width 1280px, centered |
| Padding | 16px horizontal |

### Content

| Element | Style | Notes |
|---------|-------|-------|
| Logo | "KNOCKOUT FPL" | text-body-lg (18px), bold, white, caps |
| Login Link | Ghost style | text-body (16px), white, hover: gold |

### Interactions

- **Logo click** → Navigate to `/` (home)
- **Login click** → Navigate to `/login`

---

## Component 2: Hero Section

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                                                                    │
│                                                                    │
│                       KNOCKOUT FPL                                 │
│                                                                    │
│               Every gameweek is a cup final.                       │
│                                                                    │
│                                                                    │
│              ┌─────────────────────────────┐                       │
│              │       Enter the Arena       │                       │
│              └─────────────────────────────┘                       │
│                                                                    │
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Specifications

| Element | Specification |
|---------|---------------|
| Background | Midnight Blue (#0D1F3C) |
| Min-height | 80vh (fills most of viewport) |
| Padding | py-20 (mobile), py-32 (desktop) |
| Content alignment | Center (both axes) |
| Container | Max-width 1280px, centered |

### Content

| Element | Content | Style |
|---------|---------|-------|
| Headline | KNOCKOUT FPL | text-display-xl (64px), bold, white, caps |
| Tagline | Every gameweek is a cup final. | text-body-lg (18px), Light Gold (#E8D5A3) |
| Primary CTA | Enter the Arena | Gold bg (#C9A227), Near Black text, 200px × 56px, radius-md |

### Spacing

- Headline to tagline: 16px (space-4)
- Tagline to CTA: 32px (space-8)

### Interactions

- **"Enter the Arena" click** → Navigate to `/signup`
- **Button hover** → Slight scale (1.02), shadow-gold

### Responsive

| Breakpoint | Headline Size | Padding |
|------------|---------------|---------|
| Mobile (<640px) | text-4xl (36px) | py-16 |
| Tablet (640-1024px) | text-5xl (48px) | py-20 |
| Desktop (>1024px) | text-display-xl (64px) | py-32 |

---

## Component 3: Value Props Section

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                                                                    │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│   │                  │  │                  │  │                  │ │
│   │       ⚔️         │  │       🎯         │  │       🏆         │ │
│   │                  │  │                  │  │                  │ │
│   │   One opponent.  │  │  Your team.      │  │  Turn your       │ │
│   │   One winner.    │  │  Higher stakes.  │  │  league into     │ │
│   │   Every week.    │  │                  │  │  sudden death.   │ │
│   │                  │  │  Bring your FPL  │  │                  │ │
│   │   No more        │  │  squad. No       │  │  32 enter.       │ │
│   │   chasing        │  │  setup. Just     │  │  1 lifts the     │ │
│   │   points.        │  │  glory.          │  │  trophy.         │ │
│   │   Just survive.  │  │                  │  │                  │ │
│   │                  │  │                  │  │                  │ │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Specifications

| Element | Specification |
|---------|---------------|
| Background | White (#FFFFFF) or Gray-50 (#FAFAFA) |
| Padding | py-16 (mobile), py-24 (desktop) |
| Container | Max-width 1280px, centered |
| Grid | 3 columns (desktop), 1 column (mobile) |
| Gap | 32px (space-8) |

### Card Structure

| Element | Style |
|---------|-------|
| Icon | Emoji, 48px font-size |
| Headline | text-heading-3 (20px), semibold, Near Black |
| Body | text-body (16px), Gray-500 (#666666) |
| Card padding | 24px (space-6) |
| Card alignment | Center text |

### Card Content

**Card 1: Stakes**
| Element | Content |
|---------|---------|
| Icon | ⚔️ |
| Headline | One opponent. One winner. Every week. |
| Body | No more chasing points. Just survive. |

**Card 2: Simplicity**
| Element | Content |
|---------|---------|
| Icon | 🎯 |
| Headline | Your team. Higher stakes. |
| Body | Bring your FPL squad. No setup. Just glory. |

**Card 3: Format**
| Element | Content |
|---------|---------|
| Icon | 🏆 |
| Headline | Turn your league into sudden death. |
| Body | 32 enter. 1 lifts the trophy. |

### Responsive

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, stacked |
| Tablet (640-1024px) | 3 columns |
| Desktop (>1024px) | 3 columns |

---

## Component 4: Social Proof Section

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                  "Finally, FPL with actual stakes."                │
│                         — Someone on Reddit, probably              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Specifications

| Element | Specification |
|---------|---------------|
| Background | Gray-50 (#FAFAFA) or subtle border-top |
| Padding | py-16 |
| Container | Max-width 800px, centered |
| Text alignment | Center |

### Content

| Element | Content | Style |
|---------|---------|-------|
| Quote | "Finally, FPL with actual stakes." | text-body-lg (18px), italic, Near Black |
| Attribution | — Someone on Reddit, probably | text-body-sm (14px), Gray-500 |

### Spacing

- Quote to attribution: 8px (space-2)

### Notes

- This is a placeholder quote with self-aware humor
- Replace with real testimonials when available
- The humor fits the brand's confident, not-taking-itself-too-seriously voice

---

## Full Page Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│  KNOCKOUT FPL                                           [Login]    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                                                                    │
│                                                                    │
│                       KNOCKOUT FPL                                 │
│                                                                    │
│               Every gameweek is a cup final.                       │
│                                                                    │
│                                                                    │
│              ┌─────────────────────────────┐                       │
│              │       Enter the Arena       │                       │
│              └─────────────────────────────┘                       │
│                                                                    │
│                                                                    │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                                                                    │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│   │                  │  │                  │  │                  │ │
│   │       ⚔️         │  │       🎯         │  │       🏆         │ │
│   │                  │  │                  │  │                  │ │
│   │   One opponent.  │  │  Your team.      │  │  Turn your       │ │
│   │   One winner.    │  │  Higher stakes.  │  │  league into     │ │
│   │   Every week.    │  │                  │  │  sudden death.   │ │
│   │                  │  │  Bring your FPL  │  │                  │ │
│   │   No more        │  │  squad. No       │  │  32 enter.       │ │
│   │   chasing        │  │  setup. Just     │  │  1 lifts the     │ │
│   │   points.        │  │  glory.          │  │  trophy.         │ │
│   │   Just survive.  │  │                  │  │                  │ │
│   │                  │  │                  │  │                  │ │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                    │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                  "Finally, FPL with actual stakes."                │
│                         — Someone on Reddit, probably              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Brand Foundation
- [ ] Update tailwind.config.js with brand colors
- [ ] Update tailwind.config.js with typography scale
- [ ] Update tailwind.config.js with custom shadows
- [ ] Update index.css with CSS variables
- [ ] Add Inter font

### Components
- [ ] Create Navbar component
- [ ] Update Hero component with new branding
- [ ] Create ValueProps component
- [ ] Create SocialProof component
- [ ] Update LandingPage to compose all sections

### Testing
- [ ] Navbar renders with logo and login link
- [ ] Hero displays headline, tagline, and CTA
- [ ] CTA links to /signup
- [ ] Value props display all 3 cards
- [ ] Social proof displays quote and attribution
- [ ] Responsive behavior works at all breakpoints
- [ ] Colors match brand specification

### Accessibility
- [ ] Color contrast passes WCAG AA (4.5:1 for text)
- [ ] Focus states visible (gold ring)
- [ ] Touch targets 44px+ on mobile
- [ ] Semantic HTML structure

---

## Voice Reference

### Do Say
- "Enter the Arena" (not "Get Started")
- "Every gameweek is a cup final" (not "Knockout tournaments for FPL")
- "Just survive" (stakes-focused)

### Don't Say
- "Welcome to Knockout FPL"
- "Sign up for free"
- Generic software language

---

*Document Version 1.0 | December 2025*
*"Every gameweek is a cup final."*
