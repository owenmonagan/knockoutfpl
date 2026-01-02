# Deleted/Missing FPL Managers - Implementation Plan

**Date:** 2026-01-02
**Status:** Draft
**Type:** Defensive edge case fix

## Problem

When an FPL manager deletes their team mid-tournament:
1. `fetchEntryPicks()` in `fpl-scores.ts` returns `null` (API 404)
2. `fetchScoresForEntries()` excludes entries with null responses from the returned Map
3. `resolveMatch()` in `match-resolver.ts` returns `null` when any score is missing
4. Match never resolves, tournament stalls indefinitely

## Spec Requirements

- Treat deleted managers as **0 points** for remaining rounds
- Snapshot data preserved (team name, etc.)
- Opponent auto-advances

## Implementation

### Option A: Handle in `fetchScoresForEntries()` (Recommended)

**File:** `/Users/owen/work/knockoutfpl/functions/src/fpl-scores.ts`

Add a fallback mechanism that returns a synthetic 0-point response for missing entries:

```typescript
// New type for synthetic/missing responses
export interface SyntheticPicksResponse {
  entry_history: {
    points: 0;
    total_points: number; // Unknown, use 0
    rank: number; // Unknown, use 0
  };
  active_chip: null;
  _synthetic: true; // Flag to identify synthetic responses
  _reason: 'team_deleted' | 'api_error';
}

export async function fetchScoresForEntries(
  entryIds: number[],
  event: number,
  options?: { treatMissingAsZero?: boolean }
): Promise<Map<number, PicksResponse | SyntheticPicksResponse>> {
  const results = new Map();
  const missingEntryIds: number[] = [];

  // ... existing batch fetch logic ...

  // After fetching, if treatMissingAsZero is true, add synthetic entries
  if (options?.treatMissingAsZero) {
    for (const entryId of entryIds) {
      if (!results.has(entryId)) {
        missingEntryIds.push(entryId);
        results.set(entryId, {
          entry_history: { points: 0, total_points: 0, rank: 0 },
          active_chip: null,
          _synthetic: true,
          _reason: 'team_deleted',
        });
      }
    }
    if (missingEntryIds.length > 0) {
      console.warn(`[fpl-scores] Missing entries treated as 0 points: ${missingEntryIds.join(', ')}`);
    }
  }

  return results;
}
```

**Callers to update:**
- `updateBrackets.ts` line 73: Add `{ treatMissingAsZero: true }`
- `refreshTournament.ts` line 306: Add `{ treatMissingAsZero: true }`

### Option B: Handle in `match-resolver.ts`

Alternative: Modify `resolveMatch()` to treat missing scores as 0 instead of returning null.

```typescript
// In resolveMatch(), change the missing score handling:
const players: PlayerScore[] = picks.map(pick => ({
  entryId: pick.entryId,
  slot: pick.slot,
  seed: pick.participant.seed,
  points: scores.get(pick.entryId) ?? 0, // Default to 0 instead of failing
}));
```

**Pros:** Simpler change
**Cons:** Less visibility into why score is 0 (could be deleted team or actual 0 points)

### Recommendation: Option A

Option A is preferred because:
1. Preserves audit trail (synthetic flag distinguishes real 0 from deleted)
2. Logging at the source (easier to debug)
3. Callers can opt-in to the behavior

## Do We Need to Distinguish "API Down" vs "Team Deleted"?

**Short answer: No, for MVP.**

**Reasoning:**
- If API is temporarily down, entire batch fetch will likely fail (not just one entry)
- The scheduled job runs every 2 hours, so transient failures self-heal
- A permanently deleted team returns 404 consistently across retries

**Optional enhancement (future):**
- Add retry logic in `fetchEntryPicks()` (e.g., 2 retries with backoff)
- If all retries fail for a single entry but others succeed, treat as deleted

## Logging/Visibility

Add structured logging when synthetic scores are used:

```typescript
console.warn(JSON.stringify({
  level: 'warn',
  action: 'synthetic_score_used',
  entryIds: missingEntryIds,
  event,
  reason: 'team_deleted_or_api_error',
}));
```

Optionally send Discord alert if multiple entries are affected:
```typescript
if (missingEntryIds.length >= 2) {
  await sendDiscordAlert(`FPL entries missing/deleted: ${missingEntryIds.join(', ')} in GW${event}`);
}
```

## Test Scenarios

### Unit Tests (`fpl-scores.test.ts`)

1. **Single entry returns 404** - Should return synthetic 0-point response when `treatMissingAsZero: true`
2. **Multiple entries, one 404** - Should return real scores for valid, synthetic for missing
3. **All entries 404** - Should return all synthetic (edge case: entire league deleted)
4. **treatMissingAsZero: false** - Should maintain existing behavior (exclude missing)

### Unit Tests (`match-resolver.test.ts`)

1. **Both players have real scores** - Normal resolution (existing tests)
2. **One player has 0 points (real)** - Other player wins (existing test covers this)
3. **Both players have 0 points** - Tiebreaker by seed (existing test covers this)

### Integration/E2E Scenarios

1. **Deleted manager in active match** - Opponent advances with their real score
2. **Deleted manager already eliminated** - No effect (already out)
3. **Both managers deleted** - Lower seed advances with 0-0 score
4. **Deleted manager in bye match** - Should still advance (bye logic unchanged)

## Files Changed

| File | Change |
|------|--------|
| `functions/src/fpl-scores.ts` | Add `treatMissingAsZero` option, synthetic response type |
| `functions/src/fpl-scores.test.ts` | Add tests for missing entry handling |
| `functions/src/updateBrackets.ts` | Pass `{ treatMissingAsZero: true }` |
| `functions/src/refreshTournament.ts` | Pass `{ treatMissingAsZero: true }` |

## Rollout

1. Deploy with logging only (no behavior change)
2. Monitor for occurrences in production
3. Enable `treatMissingAsZero` after confirming logging works

## Estimated Effort

- Implementation: 1-2 hours
- Testing: 1 hour
- Total: 2-3 hours
