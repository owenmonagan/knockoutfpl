# Gameweek Selection for Tournament Creation

## Overview

Allow users to select which gameweek a tournament starts on, rather than defaulting to the next gameweek. This enables testing with past gameweeks and gives users flexibility.

## UI Design

A dropdown selector appears above the "Create Tournament" button:

```
┌─────────────────────────────────────────┐
│  Starting Gameweek                      │
│  ┌─────────────────────────────────┐    │
│  │ GW 20                       ▼   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  🏆  Create Tournament          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

- Dropdown shows GW 1 through GW 38
- Default: next gameweek (current + 1)
- Current gameweek indicated: "GW 20 (current)"
- Uses shadcn/ui `Select` component

## API Changes

### Frontend

**`CreateTournamentButton`**
- Add `selectedGameweek` state
- Fetch current gameweek on mount to set default
- Pass selection to `onCreate` callback

**`callCreateTournament(fplLeagueId, startEvent?)`**
- Add optional `startEvent` parameter
- Type: `number | undefined`

**`LeaguePage`**
- Update `handleCreateTournament` to accept and pass `startEvent`

### Backend

**`CreateTournamentRequest`**
```typescript
interface CreateTournamentRequest {
  fplLeagueId: number;
  startEvent?: number;  // Optional, defaults to currentGW + 1
}
```

**Validation:**
- If provided: must be 1-38
- If not provided: use `currentGW + 1` (current behavior)
- No restriction on past gameweeks (intentional for testing)

## Files to Modify

1. `src/components/tournament/CreateTournamentButton.tsx` - Add dropdown UI
2. `src/services/tournament.ts` - Update `callCreateTournament` signature
3. `src/pages/LeaguePage.tsx` - Pass startEvent to service
4. `functions/src/createTournament.ts` - Accept optional startEvent parameter

## Edge Cases

- Bootstrap fetch fails: default to GW 1, show all options
- Dropdown disabled during creation
- Past gameweeks allowed (testing use case)
