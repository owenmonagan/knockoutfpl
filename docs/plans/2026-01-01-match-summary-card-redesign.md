# Match Summary Card Redesign

## Overview

Redesign the `MatchSummaryCard` component to match the new visual design with team avatars, prominent scores, and clear visual states.

## Props Interface

```typescript
export interface MatchSummaryCardProps {
  type: 'live' | 'upcoming' | 'finished';

  // Team info
  yourTeamName: string;           // NEW - needed for initials
  opponentTeamName?: string;      // Optional (null = TBD)

  // Context
  leagueName: string;
  roundName: string;

  // Scores (live/finished)
  yourScore?: number | null;
  theirScore?: number | null;

  // Finished result
  result?: 'won' | 'lost';

  // Upcoming info
  gameweek?: number;

  // Navigation
  onClick?: () => void;
}
```

### Changes from Current
- Added `yourTeamName` to derive initials
- Made `opponentTeamName` optional to support TBD state
- Removed `startsIn` (gameweek deadline is section-level info)

## Visual Layout

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
│ [● LIVE MATCH]          [League · R1]   │
├─────────────────────────────────────────┤
│ BODY                                    │
│                                         │
│   (HH)      78 - 62      (SL)          │
│   You        +16        Opponent        │
│                                         │
├─────────────────────────────────────────┤
│ FOOTER                                  │
│ Winning by 16 pts              Details →│
└─────────────────────────────────────────┘
```

- **Header:** Status badge (left) + League·Round pill (right)
- **Body:** Two avatar circles with initials, large centered score, point differential badge
- **Footer:** Contextual status text, clickable affordance

## Visual States

### Live Match
- Green border (`border-primary`)
- Pulsing green dot in header badge
- Your avatar: green border/accent
- Opponent avatar: muted gray
- Score prominent, diff badge shows "+X pts" in green
- Footer: "Winning by X" / "Losing by X" / "Tied"

### Finished - Won
- Subtle green left border or accent
- Your avatar: green border (winner highlight)
- Opponent avatar: muted/grayscale
- Diff badge: green "Won"
- Footer: Checkmark or "Advanced"

### Finished - Lost
- Muted overall (slight opacity)
- Your avatar: grayscale
- Opponent avatar: subtle green (they won)
- Diff badge: red "Lost"
- Footer: red "Eliminated" text

### Upcoming - Opponent Known
- Dashed border
- Both avatars neutral gray
- "VS" text instead of score
- Footer: "GW{X}"

### Upcoming - Opponent TBD
- Dashed border
- Your avatar normal
- Opponent avatar: dashed circle with "TBD" or "?"
- Footer: "Opponent TBD after GW{X}"

## Implementation

### Files to Modify
1. `src/components/dashboard/MatchSummaryCard.tsx` - Complete rewrite
2. `src/components/dashboard/MatchSummaryCard.test.tsx` - Update tests
3. `src/components/dashboard/YourMatchesSection.tsx` - Pass `yourTeamName`
4. `src/pages/LeaguesPage.tsx` - Ensure `yourTeamName` available

### Helper Function
```typescript
function getInitials(teamName: string): string {
  // "Haaland's Hairband FC" → "HH"
  // Takes first letter of first two words
}
```

### Dependencies
No new dependencies - uses existing shadcn Card, Badge, and Tailwind.

## Future Enhancements
- Minutes remaining per team (player-minutes left in gameweek)
- Live score animations
- Match detail modal/page

## Reference
Design source: `/Users/owen/Downloads/stitch_knockout_fpl_landing_page_2/`
