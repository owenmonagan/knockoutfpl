# Match Resolution Integrity Design

**Date:** 2025-12-30
**Status:** Ready for implementation

## Problem

Matches are being marked complete without proper validation:
1. Matches complete with missing/fake scores (defaulting to 0)
2. Child matches complete before source matches
3. No visibility into what went wrong

## Solution

### Two Update Paths

| Path | Trigger | Frequency | Scope |
|------|---------|-----------|-------|
| Eager | User views tournament | On demand | All current round matches |
| Lazy | Scheduled | Every 2 hours | One stale match |

### Match Completion Invariants

Three conditions must be true before marking any match complete:

1. **Gameweek finished** - FPL API `gameweek.finished = true`
2. **Feeder matches complete** - Source matches in previous round have `status = 'complete'`
3. **Scores stored** - Both players have picks in DB with `isFinal = true`

### Eager Path: `refreshTournament(tournamentId)`

Triggered when user views a tournament page.

```
1. Get current round matches for tournament
2. For each match with 2 players:
   a. Fetch picks from FPL API for both entry IDs
   b. Store in picks table (isFinal = gameweek.finished)
3. Check gameweek status
4. If finished:
   a. For each match where feeders complete:
      - Resolve match
      - Update winner
      - Set status = 'complete'
5. Return (frontend fetches fresh data)
```

### Lazy Path: `updateBrackets` (scheduled)

Runs every 2 hours, processes one stale match.

```
1. Check if any gameweek is finished
   └─ No → exit early

2. Query for oldest unresolved match where:
   - round.event <= current finished gameweek
   - match.status != 'complete'
   - feeder matches are complete (or round 1)
   ORDER BY updated_at ASC
   LIMIT 1

3. If no match found → exit (all caught up)

4. For that match:
   a. Fetch picks from FPL API for both players
   b. Store picks in DB with isFinal=true
   c. Resolve match (determine winner)
   d. Update match.winner_entry_id, status='complete'
   e. Update match.updated_at = now()
   f. Log success

5. Exit
```

### Schema Changes

Add `updated_at` to matches table (if not present):

```sql
ALTER TABLE matches ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

### Rate Limiting

FPL API calls batched with delays:
- Batch size: 5-10 concurrent requests
- Delay between batches: 200ms
- Existing pattern in `fetchScoresForEntries()`

### Logging

Structured JSON logs for Cloud Console filtering:

```typescript
// Success
console.log(JSON.stringify({
  level: 'info',
  action: 'match_resolved',
  tournamentId,
  matchId,
  event,
  winnerId,
  score: `${winnerScore}-${loserScore}`
}));

// Skip (expected)
console.warn(JSON.stringify({
  level: 'warn',
  action: 'match_skipped',
  reason: 'gameweek_not_finished', // or 'feeder_incomplete'
  tournamentId,
  matchId,
  event
}));

// Error (unexpected)
console.error(JSON.stringify({
  level: 'error',
  action: 'fpl_api_failed',
  tournamentId,
  matchId,
  entryIds: [123, 456],
  error: error.message
}));
```

Discord alerts only for actual errors (API failures, exceptions).

### Files to Modify

1. **`functions/src/match-resolver.ts`**
   - Return `null` if scores missing (don't default to 0)
   - Add `validateFeedersComplete()` function

2. **`functions/src/updateBrackets.ts`**
   - Simplify to process one match per run
   - Add staleness ordering by `updated_at`
   - Add invariant checks before completing

3. **`functions/src/index.ts`**
   - Export new `refreshTournament` callable function

4. **`functions/src/refreshTournament.ts`** (new file)
   - Implement eager update path

5. **`src/services/tournament.ts`**
   - Call `refreshTournament` before fetching tournament data

6. **`dataconnect/schema/schema.gql`**
   - Add `updated_at` to matches if missing

## Frontend Integration

```typescript
// In getTournamentByLeague()
export async function getTournamentByLeague(leagueId: number): Promise<Tournament | null> {
  // First, find tournament ID
  const tournaments = await getLeagueTournaments(...);
  if (!tournaments.length) return null;

  const tournamentId = tournaments[0].id;

  // Trigger refresh (eager update)
  await callRefreshTournament(tournamentId);

  // Then fetch fresh data
  // ... existing fetch logic
}
```

## Benefits

1. **Impossible to corrupt** - Gameweek finished is external source of truth
2. **Self-healing** - Failed matches retry automatically
3. **Real-time when viewed** - Users see latest scores
4. **Efficient when idle** - Background job is lazy
5. **Debuggable** - Structured logs show exactly what happened
