# Hero Animation Redesign

## Overview

Redesign the landing page hero section to create more visual impact and "cup final energy." An animated trophy rises to crown a stylized tournament bracket, triggering a holographic shine burst - visually telling the story of winning.

## The Problem

The current hero is clean but flat:
- Static midnight blue background
- No movement or visual drama
- Feels like a SaaS product, not a championship

## The Solution

### Animation Concept

**START state (page load):**
```
            _
         ┌─┴─┐
      ┌──┘   └──┐
     [ ]       [ ]      ← Empty bracket, waiting for champion

     KNOCKOUT FPL
Every gameweek is a cup final.
   [ Enter the Arena ]
```

**END state (after animation):**
```
          🏆              ← Trophy rises into position
          _               ← Shine burst triggers here
       ┌─┴─┐
    ┌──┘   └──┐
   [ ]       [ ]         ← Bracket now has its champion

   KNOCKOUT FPL
Every gameweek is a cup final.
 [ Enter the Arena ]
```

**The Story:** You're not just looking at a landing page. You're watching someone win. And that someone could be you.

### Animation Sequence

1. Page loads with empty bracket structure visible
2. Trophy rises from below (0.8s, ease-out)
3. Trophy settles at the top of the bracket
4. Shine/shimmer burst radiates outward (holographic flash)
5. Subtle ambient shimmer continues on trophy

## Visual Styling

### The Bracket Motif
- SVG lines in gold (#C9A227) with subtle glow
- Line weight: 2-3px
- 80% opacity so it doesn't overpower
- Stylized tournament bracket shape (not literal 32-team bracket)

### The Trophy
- SVG trophy icon, gold fill (#C9A227)
- Size: ~80-120px tall
- Subtle gold shadow underneath as it rises
- Final position sits just above the bracket's apex

### The Shine Effect (Pokemon Shiny Flash)
- Radial gradient expanding outward from trophy center
- Colors: White core → Gold (#C9A227) → Transparent
- Quick burst (0.3s) triggered when trophy lands
- Diagonal light streak sweeps across trophy (holographic card effect)
- After burst: Gentle ambient shimmer (slow, looping, subtle)

### Background Enhancement
- Keep midnight blue (#0D1F3C) base
- Add subtle radial gradient: lighter center, darker edges
- Creates natural "spotlight" effect

## Technical Implementation

### File Structure
```
src/components/landing/
├── HeroSection.tsx        ← Modify existing
├── TrophyAnimation.tsx    ← New: SVG trophy + rise animation
├── BracketMotif.tsx       ← New: SVG bracket lines
└── ShineEffect.tsx        ← New: Radial shine burst + ambient shimmer
```

### Animation Approach
- All CSS keyframe animations (no libraries)
- Trophy rise: `transform: translateY(100px) → translateY(0)`
- Shine burst: `scale(0) opacity(1) → scale(3) opacity(0)` on radial gradient
- Ambient shimmer: Looping diagonal gradient position shift

### CSS Variables
```css
--animation-trophy-rise: 0.8s ease-out;
--animation-shine-burst: 0.4s ease-out;
--animation-shimmer: 3s ease-in-out infinite;
--shine-delay: 0.6s;
```

### Performance
- Use `transform` and `opacity` only (GPU-accelerated)
- `will-change: transform` on animated elements
- `animation-fill-mode: forwards` for one-time animations
- Respect `prefers-reduced-motion` - show static end state

### SVG Assets
- Trophy: Custom SVG or Lucide trophy converted to path
- Bracket: Hand-drawn SVG paths for clean scaling

## Scope

### In Scope
- Hero section animation and styling
- New animation components
- CSS keyframe animations
- Accessibility (reduced motion support)

### Out of Scope
- Navbar changes
- Feature cards section
- Social proof section
- Any content below the fold

## Deliverables

1. `TrophyAnimation.tsx` - SVG trophy with rise animation
2. `BracketMotif.tsx` - SVG bracket frame lines
3. `ShineEffect.tsx` - Radial burst + ambient shimmer
4. Updated `HeroSection.tsx` - Composed with new components
5. CSS keyframe animations in `index.css`
6. `prefers-reduced-motion` fallback

## Success Criteria

- [ ] Trophy animates on page load
- [ ] Bracket motif frames the hero content
- [ ] Shine burst triggers when trophy lands
- [ ] Ambient shimmer continues after burst
- [ ] Reduced motion users see static end state
- [ ] No performance issues (60fps animation)
- [ ] Feels like a cup final, not a SaaS product

---

*Created: December 16, 2025*
