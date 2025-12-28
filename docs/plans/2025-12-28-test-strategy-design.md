# Test Strategy Design

**Date:** 2025-12-28
**Status:** Ready for implementation

---

## Overview

A comprehensive test strategy covering three layers:
1. **Journey E2E Tests** - Complete user flows via Playwright
2. **Integration Tests** - Tournament data flow with Firebase emulators
3. **Unit Tests** - Bracket logic in isolation

---

## Test File Structure

```
knockoutfpl/
├── e2e/
│   ├── journeys/
│   │   ├── onboarding.spec.ts
│   │   ├── new-user-first-tournament.spec.ts
│   │   ├── shared-link-viewer.spec.ts
│   │   └── returning-user.spec.ts
│   └── ... (existing specs)
├── integration/
│   └── tournament-lifecycle.test.ts
└── functions/
    └── src/
        └── match-resolver.test.ts
```

---

## Layer 1: Journey E2E Tests

Location: `e2e/journeys/*.spec.ts`

### onboarding.spec.ts (9 tests)

Tests the complete onboarding flow from landing page to league selection.

| Test | Description |
|------|-------------|
| Landing page display | Enter the Arena CTA visible |
| Team entry navigation | CTA navigates to team entry |
| Team lookup by ID | FPL Team ID resolves to team |
| Team found confirmation | Shows team with auto-advance |
| Existing tournaments | Displays tournaments user is in |
| No tournaments state | Shows "arena awaits" message |
| League display | Shows mini leagues with actions |
| Invalid Team ID | Error message on bad ID |
| Help modal | Team ID help modal works |

### new-user-first-tournament.spec.ts (6 tests)

Tests the creator journey from signup to sharing.

| Test | Description |
|------|-------------|
| Full flow | Landing → signup → connect → create → share |
| Tournament name | Pre-filled from league name |
| Bracket generation | Bracket created on submit |
| Share prompt | Copy link functionality works |
| Participant count | Shows count after creation |
| Duplicate prevention | Can't create second tournament |

### shared-link-viewer.spec.ts (9 tests)

Tests both anonymous and logged-in viewing of shared brackets.

**Anonymous Viewer (5 tests)**

| Test | Description |
|------|-------------|
| Bracket display | Shows without authentication |
| Participants visible | All matchups displayed |
| Round status | Current round and scores shown |
| Claim buttons | Each participant has claim CTA |
| Non-existent tournament | Graceful error handling |

**Logged-in Viewer (4 tests)**

| Test | Description |
|------|-------------|
| Bracket with context | Shows user-specific info |
| User highlighting | Own team highlighted |
| Match status | Current match status shown |
| Dashboard navigation | Can navigate to dashboard |

### returning-user.spec.ts (6 tests)

Tests the returning user experience.

| Test | Description |
|------|-------------|
| Auto-redirect | Authenticated → dashboard |
| League display | All leagues with status |
| Active match | Current scores displayed |
| Eliminated status | Shows when user is out |
| Winner celebration | Shows when tournament complete |
| No tournaments | Graceful empty state |

---

## Layer 2: Integration Tests

Location: `integration/tournament-lifecycle.test.ts`

Uses Firebase emulators to test complete data flow.

### Scenario: 8-player tournament (5 tests)

Power of 2, no byes - the happy path.

| Test | Description |
|------|-------------|
| Tournament creation | 8 participants created |
| Round structure | 3 rounds (4→2→1 matches) |
| Seeding | Seeds 1-8 assigned correctly |
| Match picks | Round 1 picks for all players |
| Round status | Round 1 active, 2-3 pending |

### Scenario: 12-player tournament (5 tests)

Non-power of 2, tests bye handling.

| Test | Description |
|------|-------------|
| Tournament creation | 12 participants created |
| Bye assignment | 4 byes to top seeds (1-4) |
| Real matches | 4 matches in round 1 |
| Bye advancement | Bye recipients in round 2 |
| Match picks | Correct picks after byes |

### Scenario: Tiebreaker resolution (4 tests)

Equal points, seed decides.

| Test | Description |
|------|-------------|
| Seed resolution | Lower seed wins on tie |
| Tiebreaker flag | Match marked as tiebreaker |
| Winner advancement | Lower seed advances |
| Loser elimination | Higher seed eliminated |

### Scenario: Full tournament completion (9 tests)

Complete tournament from start to finish.

| Test | Description |
|------|-------------|
| Round 1 processing | Gameweek complete triggers update |
| Winner updates | Match winners set with scores |
| Elimination tracking | Losers marked with round |
| Round 2 picks | Winners get next round picks |
| Round activation | Round 2 activated |
| Final processing | Tournament completes |
| Tournament status | Status set to completed |
| Winner ID | Tournament winnerId set |
| Champion status | Winner marked as champion |

### Scenario: Mid-tournament state (6 tests)

Verify correct state after partial completion.

| Test | Description |
|------|-------------|
| Participant status | Correct after round 1 |
| Round statuses | R1 complete, R2 active, rest pending |
| Match winners | All R1 matches have winners |
| Next round picks | R2 picks populated |
| Pick finalization | Picks marked isFinal |
| Seed preservation | Seeds preserved through advancement |

---

## Layer 3: Unit Tests

Location: `functions/src/match-resolver.test.ts`

### resolveMatch (8 tests)

| Test | Description |
|------|-------------|
| Higher points wins | Basic point comparison |
| Tied points | Seed tiebreaker |
| Lower seed wins | Tiebreaker logic |
| Tiebreaker flag | decidedByTiebreaker set |
| Bye handling | Single player match |
| Wrong player count | Returns null |
| Missing score | Defaults to 0 |
| Score assignment | Winner/loser scores correct |

### getNextRoundSlot (2 tests)

| Test | Description |
|------|-------------|
| Odd positions | Slot 1 for 1, 3, 5 |
| Even positions | Slot 2 for 2, 4, 6 |

### canPopulateNextMatch (4 tests)

| Test | Description |
|------|-------------|
| Both feeders complete | ready: true |
| One incomplete | ready: false |
| Feeder IDs returned | For tracking |
| No feeders | Round 1 handling |

### Seeding (5 tests)

| Test | Description |
|------|-------------|
| Seed assignment | 1-N by league rank |
| Seed 1 vs N | First round pairing |
| Seed 2 vs N-1 | Second pairing |
| 8-player structure | Correct bracket |
| 16-player structure | Correct bracket |

### Bye assignment (4 tests)

| Test | Description |
|------|-------------|
| Bye count | 4 byes for 12 players |
| Top seeds first | Byes to highest seeds |
| Round 2 placement | Bye recipients placed |
| Power of 2 | No byes needed |

---

## Test Counts

| Layer | File | Tests |
|-------|------|-------|
| Journey E2E | onboarding.spec.ts | 9 |
| Journey E2E | new-user-first-tournament.spec.ts | 6 |
| Journey E2E | shared-link-viewer.spec.ts | 9 |
| Journey E2E | returning-user.spec.ts | 6 |
| Integration | tournament-lifecycle.test.ts | 29 |
| Unit | match-resolver.test.ts | 23 |
| **Total** | | **82** |

---

## Running Tests

```bash
# Journey E2E tests
npm run test:e2e -- --grep @journey

# Integration tests (requires emulators)
npm run test:integration

# Unit tests
npm test

# All tests
npm run test:all
```

---

## Implementation Notes

- All tests start as `test.todo` placeholders
- Integration tests require Firebase emulators running
- E2E tests require dev server on localhost:5173
- Unit tests run in isolation with mocked dependencies

---

## Related Documents

- [User Journeys](../business/product/journeys/CLAUDE.md)
- [Bracket Update Background Job](./2025-12-28-bracket-update-background-job.md)
- [Data Flow](../business/technical/data/data-flow.md)
