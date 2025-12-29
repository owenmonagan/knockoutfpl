# Production Confidence Testing Design

**Date:** 2025-12-29
**Status:** Ready for implementation

---

## Overview

A daily automated test system that creates tournaments in the dev environment and validates they complete successfully using real FPL data. Provides confidence that the `updateBrackets` scheduled function works correctly in production-like conditions.

---

## Components

### 1. Daily Tournament Creator

A scheduled Cloud Function that creates test tournaments daily.

**Schedule:** Once daily at midnight (Europe/London)

**Behavior:**
1. Fetch current gameweek from FPL API
2. Generate 20 random league IDs (range: 134,129 to 634,129)
3. For each league ID:
   - Fetch league from FPL API
   - Skip if 404 or < 8 participants
   - Pick random `startGameweek` between 1 and `currentGameweek`
   - Create tournament with `isTest: true` flag
4. Max 50 attempts to find 20 valid leagues (avoid infinite loop)

**Configuration:**
```typescript
{
  count: 20,
  leagueIdMin: 134129,
  leagueIdMax: 634129,
  minParticipants: 8,
  maxParticipants: 64,
  maxAttempts: 50,
}
```

### 2. Enhanced updateBrackets (Catch-up Mode)

Modified scheduled function that processes historical gameweeks, not just the current one.

**Current behavior:** Only processes rounds where `event = currentGameweek`

**New behavior:** Processes rounds for any finished gameweek, completing all pending rounds in one run.

**Algorithm:**
```
1. Fetch current gameweek status
2. Loop (max 10 iterations):
   a. Query active rounds WHERE event <= currentGameweek
   b. Filter to rounds where that gameweek is finished
   c. If none found, exit loop
   d. Sort by event (ascending) - process oldest first
   e. Process each round (fetch scores, resolve matches, advance winners)
3. Log completion
```

**Safety limits:**
- Max 10 loop iterations per function run
- Existing rate limiting on FPL API calls (10 concurrent)

### 3. Discord Error Bot

Webhook-based alerting for failures.

**Alert triggers:**

| Trigger | Condition | Message Format |
|---------|-----------|----------------|
| Tournament stuck | `isTest: true` AND `status != 'completed'` AND `createdAt < 24h ago` | `⚠️ Tournament {id} stuck - created {time} ago, still {status}` |
| Function crash | Unhandled exception in updateBrackets | `🔴 updateBrackets crashed: {error}` |
| FPL API failure | Can't fetch scores after retries | `⚠️ FPL API failed for entry {id}: {status}` |

**Stuck tournament detection:** Separate scheduled function `checkStuckTournaments` runs every 6 hours.

---

## Schema Changes

Add `isTest` flag to Tournament:

```graphql
type Tournament {
  # ... existing fields
  isTest: Boolean @default(false)
}
```

This enables:
- Filtering test tournaments from production queries
- Periodic cleanup of old test data
- Separate monitoring/metrics

---

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `functions/src/createTestTournaments.ts` | Daily scheduled function to create 20 test tournaments |
| `functions/src/checkStuckTournaments.ts` | 6-hourly check for stuck tournaments |
| `functions/src/discord.ts` | Discord webhook helper |

### Modified Files

| File | Change |
|------|--------|
| `functions/src/updateBrackets.ts` | Add catch-up mode for past gameweeks |
| `functions/src/dataconnect-mutations.ts` | Add query for active rounds with `event <= X` |
| `functions/src/index.ts` | Export new functions |
| `dataconnect/schema.gql` | Add `isTest: Boolean` to Tournament |

---

## Discord Webhook

**Channel:** `#knockout-alerts`

**Webhook URL:** Store in Firebase environment config:
```bash
firebase functions:config:set discord.webhook_url="<webhook_url>"
```

**Usage:**
```typescript
import { sendDiscordAlert } from './discord';

// In error handlers
await sendDiscordAlert(`🔴 updateBrackets crashed: ${error.message}`);
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Daily (midnight)                         │
├─────────────────────────────────────────────────────────────────┤
│  createTestTournaments                                          │
│  ├─ Fetch current GW                                            │
│  ├─ Generate 20 random league IDs (134129-634129)               │
│  ├─ For each: fetch league, validate size                       │
│  ├─ Pick random startGameweek (1 to currentGW)                  │
│  └─ Create tournament with isTest: true                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Every 2 hours                             │
├─────────────────────────────────────────────────────────────────┤
│  updateBrackets (with catch-up mode)                            │
│  ├─ Fetch current GW                                            │
│  ├─ Loop: find active rounds for finished GWs (event <= current)│
│  ├─ Process each round:                                         │
│  │   ├─ Fetch scores from FPL API                               │
│  │   ├─ Resolve matches (points + seed tiebreaker)              │
│  │   ├─ Advance winners to next round                           │
│  │   └─ Mark tournament complete if final                       │
│  └─ On error: sendDiscordAlert()                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Every 6 hours                             │
├─────────────────────────────────────────────────────────────────┤
│  checkStuckTournaments                                          │
│  ├─ Query: isTest=true AND status!='completed' AND age>24h      │
│  └─ For each: sendDiscordAlert()                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment

**Dev only.** The `createTestTournaments` function should only be deployed to the dev/staging environment, never production.

Use environment check:
```typescript
if (process.env.ENVIRONMENT !== 'dev') {
  console.log('Test tournament creation disabled in production');
  return;
}
```

---

## Success Criteria

- 20 test tournaments created daily
- All tournaments complete within 24 hours (typically within one updateBrackets run)
- Discord alerts fire for any failures
- No manual intervention required

---

## Future Enhancements (Not in Scope)

- **Metrics bot:** Daily summary of created/completed/failed counts
- **Cleanup job:** Delete test tournaments older than 7 days
- **Load testing:** Increase to 100+ tournaments to stress test

---

## Related Documents

- [Test Strategy Design](./2025-12-28-test-strategy-design.md)
- [Bracket Update Background Job](./2025-12-28-bracket-update-background-job.md)
