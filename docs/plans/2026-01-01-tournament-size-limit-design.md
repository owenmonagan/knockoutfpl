# Tournament Size Limit Design

## Overview

Limit tournaments to leagues with 48 or fewer managers. Leagues exceeding this limit are shown as "locked" - users can still view the league but cannot create a tournament.

## The Rule

- Maximum tournament size: **48 managers**
- Leagues with >48 managers are "locked"
- Locked status is computed client-side from `memberCount` (no database field)

## Constant Definition

```typescript
// src/constants/tournament.ts
export const MAX_TOURNAMENT_PARTICIPANTS = 48;
```

## Changes

### Backend

**File:** `functions/src/createTournament.ts`

Update validation from `count > 50` to `count > 48`:

```typescript
if (count > 48) {
  throw new HttpsError('failed-precondition', 'League exceeds maximum participants');
}
```

### League Card

- Add small lock icon badge when `memberCount > 48`
- Card remains clickable (navigates to league page)
- Badge is subtle - just a `Lock` icon, no text

```tsx
<Card>
  <CardHeader>
    <CardTitle>{league.name}</CardTitle>
    {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
  </CardHeader>
  <CardContent>
    <span>{league.memberCount} managers</span>
  </CardContent>
</Card>
```

### League Page Empty State

**File:** `src/components/leagues/NoTournamentEmptyState.tsx`

Add `isLocked` prop. When true, show locked variant:

```tsx
interface Props {
  leagueId: number;
  leagueName: string;
  isLocked?: boolean;
}

// When locked:
<EmptyState>
  <Lock className="h-12 w-12 text-muted-foreground" />
  <p>This league is too large for a tournament</p>
</EmptyState>
```

**File:** `src/pages/LeaguePage.tsx`

Compute `isLocked` and pass to empty state:

```typescript
const isLocked = leagueInfo.memberCount > MAX_TOURNAMENT_PARTICIPANTS;
```

## Files to Modify

| File | Change |
|------|--------|
| `functions/src/createTournament.ts` | Change validation from 50 to 48 |
| `src/constants/tournament.ts` | Add `MAX_TOURNAMENT_PARTICIPANTS = 48` |
| `src/components/leagues/NoTournamentEmptyState.tsx` | Add `isLocked` prop and locked variant |
| `src/pages/LeaguePage.tsx` | Compute `isLocked`, pass to empty state |
| League card component | Add lock badge for oversized leagues |

## Testing

- Unit test: `NoTournamentEmptyState` renders locked variant when `isLocked={true}`
- Backend: Existing validation tests should be updated for new limit

## Out of Scope

- No database schema changes
- No new API endpoints
- No changes to tournament creation flow beyond validation limit
