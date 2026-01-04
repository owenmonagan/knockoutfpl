# Bracket Tab: 5-Round Cap Implementation

> Cap the bracket view at 5 rounds for large tournaments, with a prompt to view earlier rounds in the Matches tab.

**Date:** 2026-01-03
**Status:** Ready for implementation
**Parent design:** [Scalable Cup View Design](./2026-01-03-scalable-cup-view-design.md)

---

## Overview

The current `BracketTab` has two modes:
- Small tournaments (≤64 participants): Shows full bracket via `BracketLayout`
- Large tournaments (>64 participants): Shows user-focused path via `UserPathBracket`

This implementation simplifies to a single mode:
- **Always use `BracketLayout`**, but cap at the final 5 rounds
- Show a prompt linking to the Matches tab for earlier rounds
- Remove `UserPathBracket` entirely

---

## Design

### Round Slicing Logic

```typescript
const MAX_BRACKET_ROUNDS = 5;

function getVisibleRounds(rounds: Round[]): {
  visibleRounds: Round[];
  hiddenCount: number
} {
  if (rounds.length <= MAX_BRACKET_ROUNDS) {
    return { visibleRounds: rounds, hiddenCount: 0 };
  }

  const startIndex = rounds.length - MAX_BRACKET_ROUNDS;
  return {
    visibleRounds: rounds.slice(startIndex),
    hiddenCount: startIndex,
  };
}
```

**Examples:**
| Total Rounds | Visible Rounds | Hidden Count |
|--------------|----------------|--------------|
| 3 | 1-3 | 0 |
| 5 | 1-5 | 0 |
| 10 | 6-10 | 5 |
| 15 | 11-15 | 10 |

### EarlierRoundsPrompt Component

Info banner shown when rounds are hidden:

```
┌────────────────────────────────────────────────────────────┐
│ Showing final 5 rounds. 10 earlier rounds available in     │
│ the Matches tab.                        [View Matches →]   │
└────────────────────────────────────────────────────────────┘
```

```tsx
function EarlierRoundsPrompt({
  hiddenCount,
  onViewMatches
}: {
  hiddenCount: number;
  onViewMatches: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/50 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing final 5 rounds. {hiddenCount} earlier {hiddenCount === 1 ? 'round' : 'rounds'} available in the Matches tab.
      </p>
      <Button variant="outline" size="sm" onClick={onViewMatches}>
        View Matches →
      </Button>
    </div>
  );
}
```

### Updated BracketTab Component

```tsx
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BracketLayout } from '../BracketLayout';
import type { Tournament } from '@/types/tournament';

const MAX_BRACKET_ROUNDS = 5;

interface BracketTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

function getVisibleRounds(rounds: Round[]) {
  if (rounds.length <= MAX_BRACKET_ROUNDS) {
    return { visibleRounds: rounds, hiddenCount: 0 };
  }
  const startIndex = rounds.length - MAX_BRACKET_ROUNDS;
  return {
    visibleRounds: rounds.slice(startIndex),
    hiddenCount: startIndex,
  };
}

export function BracketTab({
  tournament,
  userFplTeamId,
  isAuthenticated,
  onClaimTeam,
}: BracketTabProps) {
  const [, setSearchParams] = useSearchParams();

  if (tournament.rounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Bracket will appear when the tournament starts.
      </p>
    );
  }

  const { visibleRounds, hiddenCount } = getVisibleRounds(tournament.rounds);

  return (
    <div className="space-y-4">
      {hiddenCount > 0 && (
        <EarlierRoundsPrompt
          hiddenCount={hiddenCount}
          onViewMatches={() => setSearchParams({ tab: 'matches' }, { replace: true })}
        />
      )}

      <BracketLayout
        rounds={visibleRounds}
        participants={tournament.participants}
        currentGameweek={tournament.currentGameweek}
        isAuthenticated={isAuthenticated}
        onClaimTeam={onClaimTeam}
      />
    </div>
  );
}
```

---

## Files to Change

| File | Action | Description |
|------|--------|-------------|
| `src/components/tournament/tabs/BracketTab.tsx` | Modify | Add round slicing, remove UserPathBracket, add prompt |
| `src/components/tournament/UserPathBracket.tsx` | Delete | No longer needed |
| `src/components/tournament/tabs/BracketTab.test.tsx` | Modify | Update tests for new behavior |

**No changes needed:**
- `BracketLayout.tsx` - Works as-is with any rounds array
- `BracketRound.tsx` - No changes
- `TournamentView.tsx` - No changes

---

## Test Cases

1. **≤5 rounds**: Shows all rounds, no prompt
2. **>5 rounds**: Shows last 5 rounds, prompt visible with correct count
3. **Empty rounds**: Shows "Bracket will appear when tournament starts"
4. **Click "View Matches"**: Navigates to `?tab=matches`
5. **Prompt grammar**: "1 earlier round" vs "10 earlier rounds"

---

## Implementation Checklist

- [ ] Add `getVisibleRounds` helper function
- [ ] Add `EarlierRoundsPrompt` component
- [ ] Update `BracketTab` to use slicing logic
- [ ] Remove `UserPathBracket` import and conditional
- [ ] Delete `UserPathBracket.tsx` file
- [ ] Update/add unit tests
- [ ] Manual verification with large tournament data
