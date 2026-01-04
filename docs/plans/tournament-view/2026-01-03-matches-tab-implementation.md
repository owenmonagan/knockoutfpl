# Matches Tab Implementation

> Implementation spec for the Matches tab in TournamentView

**Date:** 2026-01-03
**Status:** Ready for implementation
**Parent:** [Scalable Cup View Design](./2026-01-03-scalable-cup-view-design.md)

---

## Overview

Implement the Matches tab to browse all matches for any round, with the user's match highlighted at the top.

### Scope

**In scope:**
- Round selector dropdown
- Two sections: You, Everyone Else
- Reuse existing card component (renamed)

**Out of scope (future):**
- Friends section
- Who's Next? section
- Pagination / Load More
- Deep linking to specific match

---

## Component Changes

### 1. Rename BracketMatchCard → CompactMatchCard

**File:** `src/components/tournament/BracketMatchCard.tsx` → `CompactMatchCard.tsx`

**Changes:**
- Rename file and component
- Remove fixed `w-44` width from Card
- Accept `className` prop for width control
- Update all imports in:
  - `BracketLayout.tsx`
  - `BracketRound.tsx`
  - `MatchesTab.tsx` (new usage)

**Usage:**
```tsx
// In BracketRound (existing behavior)
<CompactMatchCard className="w-44" ... />

// In MatchesTab (full width)
<CompactMatchCard className="w-full" ... />
```

### 2. MatchesTab Component

**File:** `src/components/tournament/tabs/MatchesTab.tsx`

**Props:**
```typescript
interface MatchesTabProps {
  tournament: Tournament;
  participants: Participant[];
  userFplTeamId?: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}
```

**State:**
```typescript
const [selectedRound, setSelectedRound] = useState(tournament.currentRound);
```

**Layout:**
```
┌─────────────────────────────────┐
│  [Round Selector Dropdown]      │
│  GW28 • Live                    │  ← Round status line
│                                 │
│  YOU                            │  ← Only if user has match
│  ┌─────────────────────────────┐│
│  │ CompactMatchCard (accent)   ││
│  └─────────────────────────────┘│
│                                 │
│  EVERYONE ELSE                  │
│  ┌─────────────────────────────┐│
│  │ CompactMatchCard            ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ CompactMatchCard            ││
│  └─────────────────────────────┘│
│  │ ...                         ││
└─────────────────────────────────┘
```

---

## Round Selector

**Component:** shadcn `Select`

**Options:** All rounds from `tournament.rounds[]`
- Display: `round.name` (e.g., "Quarter-Finals")
- Value: `round.roundNumber`
- Current round indicator (dot or badge)

**Default:** `tournament.currentRound`

---

## Round Status Line

Below the dropdown, show:

| Condition | Display |
|-----------|---------|
| Gameweek in progress | `GW28 • Live` |
| Gameweek complete | `GW27 • Complete` |
| Gameweek upcoming | `GW29 • Upcoming` |

**Logic:**
- Get `round.gameweek` for selected round
- Compare against current FPL gameweek (from tournament or separate fetch)
- Check `round.isComplete` flag

---

## Section Logic

### "You" Section

**Visibility:** Only when:
- `userFplTeamId` is defined
- User has a match in the selected round

**Finding user's match:**
```typescript
const userMatch = matches.find(match =>
  match.player1?.fplTeamId === userFplTeamId ||
  match.player2?.fplTeamId === userFplTeamId
);
```

**Styling:** Accent border on the card (consistent with existing `isUserMatch` pattern)

### "Everyone Else" Section

**Content:** All matches in round except user's match

**Order:** As returned from data (by match position/bracket order)

**No pagination:** Render all matches for now

---

## Section Headers

Muted uppercase style matching existing patterns:

```tsx
<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
  You
</h3>
```

---

## Data Flow

```
TournamentView
  └── MatchesTab
        ├── props: tournament, participants, userFplTeamId, isAuthenticated, onClaimTeam
        ├── state: selectedRound
        └── renders:
              ├── Select (round dropdown)
              ├── Round status line
              ├── "You" section (conditional)
              │     └── CompactMatchCard
              └── "Everyone Else" section
                    └── CompactMatchCard (multiple)
```

---

## Future Enhancements

Not in this implementation:

1. **Friends section** - Group friend matches between You and Everyone Else
2. **Who's Next? section** - Show potential next opponent match
3. **Pagination** - Load More button for large tournaments
4. **Deep linking** - URL param to highlight specific match
5. **Search/filter** - Find specific team in matches

---

## Files to Change

| File | Change |
|------|--------|
| `BracketMatchCard.tsx` | Rename to `CompactMatchCard.tsx`, add className prop |
| `BracketLayout.tsx` | Update import |
| `BracketRound.tsx` | Update import |
| `MatchesTab.tsx` | Full implementation |
| `TournamentView.tsx` | Pass required props to MatchesTab |
