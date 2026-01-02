# Fix Minimum Participant Validation Mismatch

## Problem

Inconsistent minimum participant requirements:
- Spec: 2 managers minimum
- UI (`src/constants/tournament.ts`): `MIN_TOURNAMENT_PARTICIPANTS = 2`
- Cloud Function (`functions/src/createTournament.ts`): requires 4 minimum

## Fix Required

**File:** `/Users/owen/work/knockoutfpl/functions/src/createTournament.ts`

**Line 142:** Change validation from 4 to 2:

```typescript
// Before (line 142)
if (count < 4) {
  throw new HttpsError('failed-precondition', 'League must have at least 4 participants');
}

// After
if (count < 2) {
  throw new HttpsError('failed-precondition', 'League must have at least 2 participants');
}
```

## Edge Cases: 2-Person Tournament

Works correctly - it's just a 1-match final:

1. `calculateBracketSize(2)` = 2 (already a power of 2)
2. `calculateTotalRounds(2)` = 1 round
3. `generateSeedPairings(2)` = `[{position: 1, seed1: 1, seed2: 2}]`
4. No byes needed (2 participants = 2 slots)

Result: Single match, seed 1 vs seed 2, winner takes tournament.

## Bracket Generator Verification

`bracketGenerator.ts` handles 2 participants:
- Line 65-67: Base case returns `[1, 2]` for bracketSize of 2
- All math works: `log2(2) = 1` round, `2/2 = 1` match

No changes needed to bracket generation logic.

## Implementation

Single line change in `validateLeagueStandings()` function.
