# Multi-Manager Matches Design

> **Status:** Draft
> **Created:** 2026-01-01
> **Author:** Brainstorming session

## Overview

Extend the knockout tournament format to support N-way matches instead of just 1v1. The highest scorer among N managers advances; all others are eliminated.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Group size scope | Uniform throughout tournament | Simpler to visualize and understand |
| Advancement | Winner takes all (1 advances) | Maximum elimination pressure |
| Imperfect counts | Byes (like current system) | Consistent with existing behavior |
| Tiebreakers | FPL cascade | Aligns with FPL's own ranking system |

## Core Concept

**Multi-Manager Matches** extends the knockout tournament format to support N-way competition.

**Key characteristics:**
- **Group size is tournament-wide** - When creating a tournament, you choose the match size (2, 3, 4, etc.). All matches use that size.
- **Winner takes all** - Only the top scorer in each group advances to the next round.
- **Byes fill gaps** - If participant count isn't a perfect power of N, some early-round groups have fewer real competitors.
- **FPL tiebreakers** - Ties resolved by: transfer cost → bench points → goals scored.

**Example: 20-person tournament with groups of 3**

```
Round 1 (9 groups):
- 7 groups of 3 (21 slots) → but we only have 20 real players
- 2 groups have 2 real players + 1 bye (acts like 1v1)
- Produces 9 winners

Round 2 (3 groups of 3):
- 9 → 3 winners

Round 3 (Final - group of 3):
- 3 → 1 champion
```

**Backward compatible** - Traditional 1v1 knockout is just "group size = 2". Existing tournaments continue working unchanged.

## Data Model Changes

Minimal schema changes required.

### Tournament table

Add one field:

```graphql
type Tournament @table(name: "tournaments") {
  # ... existing fields ...

  matchSize: Int! @col(name: "match_size") @default(value: 2)
  # Number of managers per match. Default 2 = traditional 1v1 knockout.
}
```

### Match & MatchPick tables

No structural changes needed. The existing `MatchPick` junction table already supports N participants per match - we just change the `slot` values from `1, 2` to `1, 2, 3, ... N`.

```graphql
type MatchPick @table(...) {
  matchId: Int!
  entryId: Int!
  slot: Int!  # Now 1 through N instead of just 1-2
  # ...
}
```

**What stays the same:**
- `Round`, `Participant`, `Entry`, `Pick` tables unchanged
- Winner determination still uses `Match.winnerEntryId`
- Bracket navigation via `qualifiesToMatchId` works identically

## Bracket Generation Logic

### Step 1: Calculate structure

```typescript
function calculateBracket(participantCount: number, matchSize: number) {
  // Find how many rounds needed
  // Each round reduces by factor of matchSize (only 1 advances per group)
  let rounds = Math.ceil(Math.log(participantCount) / Math.log(matchSize));

  // Total slots needed (perfect power of matchSize)
  let totalSlots = Math.pow(matchSize, rounds);

  // Byes fill the gap
  let byeCount = totalSlots - participantCount;

  return { rounds, totalSlots, byeCount };
}

// Example: 20 participants, groups of 3
// rounds = ceil(log(20) / log(3)) = ceil(2.73) = 3
// totalSlots = 3^3 = 27
// byeCount = 27 - 20 = 7
```

### Step 2: Distribute byes fairly

- Byes go to top seeds (reward higher league rank)
- Distribute across groups to minimize "auto-advance" situations
- Prefer giving each group 1 bye before any group gets 2

### Step 3: Seed assignment

- Same as current: league rank determines seed
- Seed 1 gets most favorable group (most byes)
- Classic bracket logic: keep top seeds apart until late rounds

## UI & Visualization

### MatchCard updates

```
Current (1v1):
┌─────────────────────────┐
│ Team A          45 pts  │
│ Team B          38 pts  │  ← Winner highlighted
└─────────────────────────┘

New (N-way):
┌─────────────────────────┐
│ 🥇 Team A       52 pts  │  ← Winner
│ 🥈 Team B       48 pts  │
│ 🥉 Team C       41 pts  │
│    Team D (bye)    -    │
└─────────────────────────┘
```

**Key UI changes:**
- Teams listed vertically, sorted by score (descending)
- Winner indicated with highlight/icon, not just position
- Byes shown grayed out with "-" for score
- Card height scales with participant count

### BracketView updates

- `RoundSection` already renders a list of matches - no change needed
- Connector lines between rounds still work (1 winner flows to next match)
- May need horizontal scrolling for very wide brackets on mobile

### Tournament creation

- Add "Match Size" selector (dropdown: 2, 3, 4, or custom input)
- Show preview: "This creates a X-round tournament"
- Warn if participant count creates many byes

## Score Processing & Winner Determination

### Score fetching

No changes. We already fetch `Pick` data per entry per gameweek. The raw JSON contains all tiebreaker data.

### Winner determination

```typescript
interface MatchScore {
  entryId: number;
  points: number;
  transferCost: number;   // From pick.eventTransfersCost
  benchPoints: number;    // Calculated from raw pick data
  goalsScored: number;    // Calculated from player stats
}

function determineWinner(scores: MatchScore[]): number {
  // Filter out byes
  const realScores = scores.filter(s => !s.isBye);

  // Sort by tiebreaker cascade
  realScores.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.transferCost !== b.transferCost) return a.transferCost - b.transferCost;  // Lower is better
    if (b.benchPoints !== a.benchPoints) return b.benchPoints - a.benchPoints;
    return b.goalsScored - a.goalsScored;
  });

  return realScores[0].entryId;
}
```

### Edge cases

- All-bye match (shouldn't happen with proper bracket generation)
- Single real participant = auto-advance
- Perfect tie after all tiebreakers = first by seed (extremely rare)

## Migration & Compatibility

### Database migration

- Add `match_size` column to `tournaments` table with default `2`
- All existing tournaments automatically become "traditional 1v1" - no data changes needed

### Code changes summary

1. **Schema** - Add `matchSize` field to Tournament type
2. **Bracket generation** - Update algorithm for N-way groups and bye distribution
3. **MatchCard component** - Render N participants with ranking display
4. **CreateTournament form** - Add match size selector
5. **Score processing** - Implement tiebreaker cascade logic
6. **Queries** - Update any queries that assume exactly 2 MatchPicks per match

### Testing considerations

- Unit tests for bracket math with various participant counts and group sizes
- Edge cases: match size equals participant count (one-round tournament)
- Edge cases: match size larger than participant count (everyone in one group)
- UI tests for MatchCard with 2, 3, 4+ participants
- Tiebreaker ordering tests

## Out of Scope (YAGNI)

- Variable group sizes per round
- Multiple advancers per group
- Custom tiebreaker rules
- Group stage + knockout hybrid formats

## Next Steps

1. Review and approve this design
2. Create implementation plan with `superpowers:writing-plans`
3. Set up isolated workspace with `superpowers:using-git-worktrees`
4. Implement in phases: schema → bracket logic → UI → scoring
