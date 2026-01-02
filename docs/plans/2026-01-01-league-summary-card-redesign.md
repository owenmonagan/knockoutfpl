# League Summary Card Redesign

**Date:** 2026-01-01
**Status:** Approved

## Overview

Redesign the `LeagueSummaryCard` component to match the new dashboard design with gradient headers, status badges, and two-column stats layout.

## Component Structure

```
┌─────────────────────────────────────┐
│ HEADER (h-24)                       │
│ ┌─────────┐              ┌────────┐ │
│ │ Badge   │              │ X mgrs │ │
│ └─────────┘              └────────┘ │
│                                     │
│ League Name                         │
└─────────────────────────────────────┘
│ CONTENT (p-4)                       │
│ ┌───────────────┬─────────────────┐ │
│ │ YOUR RANK     │ STATUS          │ │
│ │ Value         │ Value           │ │
│ └───────────────┴─────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │       Action Button             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Header section:**
- Gradient background (color varies by state)
- Subtle texture overlay (carbon fiber pattern)
- Status badge (top-left)
- Manager count (top-right)
- League name (bottom, bold)

**Content section:**
- Two-column stats grid with labels
- Action button (full width)

## Visual Variants

### Active (user playing in live tournament)
```
Header: bg-gradient-to-br from-[#1a4d38] to-background-dark
Badge:  bg-primary text-background-dark ("Active")
Border: border-primary/50 on hover
Glow:   shadow-[0_0_20px_rgba(0,255,136,0.1)]
```

### Winner (user won the tournament)
```
Header: bg-gradient-to-br from-amber-900/50 to-background-dark
Badge:  bg-amber-500 text-background-dark ("Champion")
Border: border-amber-500/50
Glow:   shadow-[0_0_20px_rgba(245,158,11,0.1)]
```

### No Tournament (classic FPL league, no knockout yet)
```
Header: bg-gradient-to-br from-[#273a31] to-background-dark
Badge:  bg-[#0f231a] text-text-subtle border border-[#3d5248] ("Classic")
Border: border-dashed border-[#273a31]
Effect: grayscale, removes on hover
```

### Eliminated / Completed
```
Header: bg-gradient-to-br from-[#2e1616] to-background-dark
Badge:  bg-[#3d1f1f] text-red-400 ("Eliminated" or "Completed")
Border: border-red-900/50 on hover
Effect: opacity-90
```

All cards get `hover:-translate-y-1` lift effect.

## Props Interface

```typescript
export interface LeagueSummaryCardProps {
  leagueName: string;
  memberCount: number;
  userRank?: number;  // User's position in this league

  tournament?: {
    startGameweek: number;
    endGameweek: number;
    currentRound: number;
    totalRounds: number;
    status: 'active' | 'completed';
  } | null;

  userProgress?: {
    status: 'active' | 'eliminated' | 'winner';
    currentRoundName?: string;
    eliminationRound?: number | null;
  } | null;

  onClick: () => void;
}
```

## Status Column Values

| State | Status Text |
|-------|-------------|
| `active` | Current round name (e.g., "Quarter Final") |
| `winner` | "Champion" |
| `eliminated` | "Eliminated" |
| `completed` (not winner) | "Eliminated" |
| `no-tournament` | "Not Started" |

## Button Variations

| State | Button Style | Label |
|-------|--------------|-------|
| `active` | Solid (`bg-[#273a31]` → `bg-primary` on hover) | "View Tournament" |
| `winner` | Solid with amber accent | "View Tournament" |
| `eliminated` | Muted (`bg-[#273a31] text-text-subtle`) | "View History" |
| `completed` | Muted | "View History" |
| `no-tournament` | Outline (`border-primary text-primary`) | "Create Tournament" |

## Implementation Notes

- Component location: `src/components/dashboard/LeagueSummaryCard.tsx`
- Update existing tests in `LeagueSummaryCard.test.tsx`
- Texture overlay uses transparent PNG pattern (carbon fiber)
- All colors use existing Tailwind config tokens where possible
