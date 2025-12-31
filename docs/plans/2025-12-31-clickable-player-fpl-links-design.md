# Clickable Player Rows to FPL Team Pages

**Date:** 2025-12-31

## Overview

When viewing a tournament bracket, clicking on a player row opens their FPL team page on the official Fantasy Premier League website in a new tab.

## URL Logic

The URL depends on whether the round's gameweek has started:

- **Gameweek started:** `https://fantasy.premierleague.com/entry/{fplTeamId}/event/{gameweek}`
- **Gameweek not started:** `https://fantasy.premierleague.com/entry/{fplTeamId}/history`

## Implementation

### Changes to BracketMatchCard

1. **Add `gameweek` prop** - Pass the round's gameweek number down from parent components

2. **Make player rows clickable** - Add click handler or anchor tag to player slot div

3. **URL helper function:**
```typescript
function getFplTeamUrl(fplTeamId: number, gameweek: number, roundStarted: boolean): string {
  const base = 'https://fantasy.premierleague.com/entry';
  if (roundStarted) {
    return `${base}/${fplTeamId}/event/${gameweek}`;
  }
  return `${base}/${fplTeamId}/history`;
}
```

### Behavior

- Entire player row is clickable (better touch target)
- Opens in new tab (`target="_blank"` with `rel="noopener noreferrer"`)
- TBD and BYE slots are not clickable
- Hover state shows pointer cursor

### Component Prop Changes

```typescript
interface BracketMatchCardProps {
  match: Match;
  participants: Participant[];
  roundStarted: boolean;
  gameweek: number;  // NEW
}
```

### Files to Modify

1. `src/components/tournament/BracketMatchCard.tsx` - Add gameweek prop, make rows clickable
2. `src/components/tournament/BracketRound.tsx` - Pass gameweek to BracketMatchCard
3. `src/components/tournament/BracketMatchCard.test.tsx` - Update tests
