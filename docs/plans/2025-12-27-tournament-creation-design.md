# Tournament Creation Design

> **Status:** Approved
> **Date:** 2025-12-27

---

## Overview

Cloud Function that creates a knockout tournament from an FPL classic league. Handles FPL API fetch, bracket generation, and database writes in a single atomic operation.

---

## Interface

```typescript
// functions/src/createTournament.ts

interface CreateTournamentRequest {
  fplLeagueId: number;  // FPL classic league ID
}

interface CreateTournamentResponse {
  tournamentId: string;  // UUID
  participantCount: number;
  totalRounds: number;
  startEvent: number;
}
```

**Constraints:**
- User must be authenticated
- League must have 4-50 participants (single FPL page)
- One tournament per league

---

## Flow

1. Validate user is authenticated
2. Check no tournament exists for this league
3. Fetch league standings from FPL API (single page)
4. Fetch current gameweek from bootstrap data
5. Calculate bracket structure (rounds, byes)
6. Write to database in order:
   - `entries[]` - Cache all standings (FPL Records)
   - `leagues` - Cache league metadata
   - `tournaments` - Create tournament
   - `rounds[]` - Create all rounds (R1 active, rest pending)
   - `participants[]` - Create from standings with seeds
   - `matches[]` - Create with `qualifies_to` links
   - `match_picks[]` - Assign players to round 1
7. Resolve bye matches immediately
8. Return tournament ID

---

## Bracket Generation

### Math Functions

```typescript
function calculateBracketSize(participantCount: number): number {
  return Math.pow(2, Math.ceil(Math.log2(participantCount)));
}

function calculateTotalRounds(bracketSize: number): number {
  return Math.log2(bracketSize);
}

function calculateByeCount(bracketSize: number, participantCount: number): number {
  return bracketSize - participantCount;
}

function getMatchCountPerRound(bracketSize: number, roundNumber: number): number {
  return bracketSize / Math.pow(2, roundNumber);
}
```

### Example: 12 Participants

```
Bracket size: 16
Total rounds: 4
Byes: 4 (seeds 1-4)
Round 1: 8 matches (4 byes + 4 real)
Round 2: 4 matches
Round 3: 2 matches (semis)
Round 4: 1 match (final)
```

### Seeding (Standard Bracket)

For position `p` in round 1 (1-indexed):
- Slot 1: `seed = p`
- Slot 2: `seed = bracketSize + 1 - p`

Example (16-bracket): position 1 → seeds 1 vs 16

### Match ID Assignment

Sequential across all rounds:
```
Round 1: matches 1-8 (for 16-bracket)
Round 2: matches 9-12
Round 3: matches 13-14
Round 4: match 15 (final)
```

### qualifies_to Linking

```typescript
// Match at position p in round r qualifies to:
const nextMatchId = firstMatchIdOfRound(r + 1) + Math.floor((p - 1) / 2);
```

---

## Bye Handling

Top seeds get byes. Resolved immediately at tournament creation:

1. Identify bye matches (only 1 player in `match_picks`)
2. For each bye match:
   - Set `status: 'complete'`, `winnerEntryId`, `isBye: true`
   - Create `match_pick` for winner in round 2

**Slot assignment for advanced players:**
- Odd positions → slot 1
- Even positions → slot 2

---

## Error Handling

### Validation Errors

| Error | Condition |
|-------|-----------|
| `already-exists` | Tournament exists for this league |
| `not-found` | League not found or empty |
| `failed-precondition` | < 4 participants |
| `failed-precondition` | > 50 participants |

### Write Failures

No rollback for MVP. If writes fail mid-sequence:
- Tournament won't be complete/usable
- Future cleanup job can remove orphans
- Transaction support can be added later

---

## Start Event

Tournament starts from **current gameweek + 1**.

- Simplest logic
- Avoids edge cases mid-gameweek
- Current GW from `getFPLBootstrapData`

---

## Files to Create

```
functions/src/
├── createTournament.ts      # Main Cloud Function
├── bracketGenerator.ts      # Pure bracket math functions
├── bracketGenerator.test.ts # Unit tests for bracket logic
└── index.ts                 # Add export
```

### Dependencies

- Add `fetchFPLLeagueStandings` to `fplApi.ts`
- Use existing Data Connect mutations
- Use existing `getFPLBootstrapData` for current gameweek

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trigger | Cloud Function (hybrid) | FPL needs proxy, bracket logic complex |
| Max size | 50 | Single FPL page, MVP scope |
| Start event | Current GW + 1 | Simple, avoids mid-GW edge cases |
| Seeding | Standard bracket | Rewards higher seeds, matches real tournaments |
| Byes | Top seeds | Standard practice, documented in data-dictionary |
| Database | Data Connect mutations | Type-safe, consistent, already defined |
| Atomicity | Best-effort | Simpler for MVP, add transactions later |

---

## Related

- [../business/technical/data/data-flow.md](../business/technical/data/data-flow.md) - Full data flow documentation
- [../business/technical/data/data-dictionary.md](../business/technical/data/data-dictionary.md) - Schema reference
- [../business/strategy/mvp-scope.md](../business/strategy/mvp-scope.md) - MVP constraints
