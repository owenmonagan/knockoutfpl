# Large Tournament Scaling (30k Participants)

> **Status:** Design complete
> **Context:** Supporting Reddit Fantasy PL tournament with ~30,000 participants

---

## Problem

Current architecture supports max 48 participants. The Reddit FPL community wants to run a 30,000+ participant knockout tournament. Four key concerns:

1. Displaying all matches at once is overwhelming
2. Importing 30k participants with FPL API rate limiting
3. Updating ~16k round 1 matches efficiently
4. User-triggered refresh will timeout/fail at scale

---

## Solution Overview

- **Background processing** for import and updates
- **Paginated bracket view** (15 matches at a time)
- **Scoped refresh** (only visible matches, not whole round)
- **Incremental advancement** (winners advance immediately)
- **Resilient retry** with exponential backoff

---

## Tournament Size Tiers

| Tier | Participants | Creation | Access |
|------|--------------|----------|--------|
| Standard | 2-48 | Synchronous | All users |
| Large | 49-1,000 | Background (~1-2 min) | Creators |
| Mega | 1,001-50,000 | Background (5-30 min) | Admin/Creators |

---

## Background Import

### Flow

1. User submits FPL league ID
2. System validates league exists
3. Binary search to find total participant count (avoids fetching all pages)
4. User confirms: "This league has 30,247 participants. Create tournament?"
5. Tournament created with `status: 'creating'`
6. Background job starts, updates progress
7. User sees progress bar, can navigate away
8. On completion: `status: 'active'`, notification sent

### Binary Search for Count

FPL standings are paginated (50 per page). To find total count without fetching all pages:

1. Fetch page 1, check `has_next`
2. Binary search: try page 100, 1000, 10000... until overshoot
3. Narrow down to find last valid page
4. Total = (last_page - 1) × 50 + entries_on_last_page

~10-15 requests to find total, not 735.

### Job Structure

- Chunked into batches of 100 participants
- Each batch: fetch FPL data → create Entry → create Participant
- Exponential backoff on failure (1s → 2s → 4s → 8s... max 5 min)
- Failed items queued for retry at end of job
- Job is idempotent - can restart safely
- Match creation deferred until all participants imported

---

## Bracket Display

### Primary View: "Your Matches"

- Works as designed in Team Search & Claim Flow
- Shows user's journey: past matches, current match, future path
- No changes needed - already filters to user's matches

### Bracket View: Paginated Window

- Shows 15 matches centered on the focused team
- Pagination controls: Previous / Next
- Position indicator: "Showing matches 1,201-1,215 of 16,384"
- Only fetches the 15 visible matches (not full bracket)

### Team Selector Dropdown

- Search input with autocomplete
- Results ordered by:
  1. Teams you share mini-leagues with (most shared first)
  2. Alphabetical for others
- Selecting a team re-centers the 15-match window on them
- Shows team name + manager name for disambiguation

---

## Refresh & Score Updates

### Background Job

- Runs every **15 minutes** (increased from 2 hours)
- Short-circuits when no matches ready to finalize
- Priority order for large tournaments:
  1. Matches where both participants are claimed
  2. Matches where one participant is claimed
  3. Unclaimed matches
- Batches of 100 matches per chunk
- Exponential backoff on FPL API failures

### User-Triggered Refresh

- Only refreshes the visible 15 matches
- New function: `refreshVisibleMatches(tournamentId, matchIds[])`
- Rate limited: once per 30 seconds per user

### "My Match" Refresh

- User can refresh just their own match
- No rate limit (only 1-2 API calls)
- Shows "Refreshing..." spinner on match card

### Staleness Indicator

- Each match shows "Updated X minutes ago"
- Subtle warning for matches >30 min old during active gameweek

---

## Incremental Round Advancement

### Current Behavior

Wait for entire round to complete → advance all winners → activate next round.

### New Behavior

As each match completes:

1. Determine winner
2. Update match status to `complete`
3. Mark loser as `eliminated`
4. Find winner's next-round match
5. Create MatchPick linking winner to that match
6. If opponent's feeder match also complete → set next match to `active`
7. If opponent TBD → next match shows "You vs TBD"

### Match States

- `pending` - Round not started yet
- `waiting` - Round active, awaiting participants from feeder matches
- `active` - Both participants known, gameweek in progress
- `complete` - Winner determined

### UI for "waiting" Matches

- Shows confirmed participant on one side
- Shows "Awaiting winner of Match #X" on other side
- Clicking reference navigates to that feeder match

---

## Data Model Changes

### Tournament Table Additions

```graphql
type Tournament {
  # ... existing fields ...
  size: String!          # 'standard' | 'large' | 'mega'
  importStatus: String   # 'pending' | 'importing' | 'complete' | 'failed'
  importProgress: Int    # 0-100 percentage
  importedCount: Int     # Actual count imported so far
  totalCount: Int        # Total participants to import
}
```

### Match Table Additions

```graphql
type Match {
  # ... existing fields ...
  status: String!        # 'pending' | 'waiting' | 'active' | 'complete'
  lastUpdated: Timestamp # When scores were last fetched
  feederMatch1Id: UUID   # Reference to feeder match
  feederMatch2Id: UUID   # Reference to feeder match
}
```

### New Tables

```graphql
type ParticipantLeague @table {
  participant: Participant!
  leagueId: Int!           # FPL mini-league ID
  leagueName: String!
}

type ImportRetryQueue @table {
  id: UUID!
  tournamentId: UUID!
  itemType: String!        # 'participant' | 'match' | 'score'
  itemId: String!
  attempts: Int!
  lastAttempt: Timestamp!
  lastError: String
  nextRetryAt: Timestamp!
}
```

### New Queries

```graphql
# Paginated bracket view
getMatchesInRange(tournamentId, roundNumber, startPosition, count)

# Team search with mini-league ordering
searchParticipants(tournamentId, searchTerm, userId)

# Shared mini-leagues count
getSharedMiniLeagueCounts(tournamentId, userId)
```

### Indexes Needed

- `Match(tournamentId, roundNumber, positionInRound)` - paginated fetching
- `Participant(tournamentId, teamName)` - team search
- `MatchPick(entryId)` - finding user's matches

---

## Shared Mini-Leagues (Friend Proximity)

### Purpose

In a 30k tournament, help users find people they know by ordering the team selector by shared mini-league memberships.

### Data Source

FPL API: `https://fantasy.premierleague.com/api/entry/{teamId}/`
Returns `leagues.classic[]` with all mini-leagues the team belongs to.

### Import

During participant import, also fetch and store mini-league memberships in `ParticipantLeague` table.

### Calculation

For logged-in user with claimed team:

```sql
SELECT p.*, COUNT(pl.leagueId) as sharedCount
FROM Participant p
JOIN ParticipantLeague pl ON p.id = pl.participantId
WHERE pl.leagueId IN (user's league IDs)
GROUP BY p.id
ORDER BY sharedCount DESC
```

### Caching

- Computed once per session, stored client-side
- Refreshed on page reload
- Leagues don't change mid-tournament

---

## Failure Handling

### Retry Configuration

```typescript
const RETRY_CONFIG = {
  baseDelay: 1000,      // 1 second
  maxDelay: 300000,     // 5 minutes cap
  backoffMultiplier: 2, // 1s → 2s → 4s → 8s → 16s...
};
```

### Failure Types

| Failure | Cause | Max Retries | Response |
|---------|-------|-------------|----------|
| 429 Too Many Requests | FPL rate limit | Unlimited | Exponential backoff |
| 5xx Server Error | FPL API down | Unlimited | Exponential backoff |
| 404 Not Found | Deleted team | 0 | `treatMissingAsZero`, mark deleted |
| Network timeout | Transient | Unlimited | Exponential backoff |
| 4xx (non-404/429) | Bad request | 3 | Log, flag for review |
| Validation error | Bad data | 0 | Log, skip, flag |

### Monitoring

- Dashboard: queue depth, failure rate, oldest retry
- Alert if queue depth > 1000 or success rate < 90%

---

## Implementation Priority

### Phase 1: Core Scaling (MVP for 30k)

1. Background import job with progress tracking
2. Binary search for participant count
3. Paginated bracket view (15 matches)
4. Scoped refresh (visible matches only)
5. Update job frequency to 15 minutes

### Phase 2: Better UX

6. Incremental round advancement ("You vs TBD")
7. Match staleness indicators
8. Import retry queue with exponential backoff

### Phase 3: Social Features

9. Mini-league membership import
10. Team selector with friend proximity ordering

---

## Processing Time Estimates

**30k participant import:**
- ~32,768 FPL API calls (participant data + mini-leagues)
- At ~50 requests/second with backoff: ~11 minutes
- Plus DB writes: ~5 minutes
- **Total: ~15-20 minutes**

**Round 1 score update:**
- ~32,768 score fetches (2 per match)
- At ~50 requests/second: ~11 minutes
- Plus DB updates: ~5 minutes
- **Total: ~15-20 minutes per full pass**

Background job runs every 15 minutes, giving buffer between passes.

---

## Out of Scope

- Real-time live scores (using final GW scores only)
- Push notifications for match results
- Tournament editing after creation
- Partial tournament creation (must complete fully)
