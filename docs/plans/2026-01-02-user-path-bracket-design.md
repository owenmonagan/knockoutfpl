# User Path Bracket Design

> **Status:** Design complete
> **Context:** Replace position-based pagination with user-centric path view for large tournaments

---

## Problem

The current `PaginatedBracket` shows an arbitrary window of 8-4-2-1 matches based on position. This doesn't tell a meaningful story - users see random matches with no context of how they relate to each other or to the user.

---

## Solution

Show the **focal team's path to the final**, with each opponent's journey shown below.

### Visual Layout

```
YOUR R1 → YOUR R2 → YOUR R3 → YOUR R4 (Final)
          [Op2-R1]  [Op3-R2]  [Op4-R3]
                    [Op3-R1]  [Op4-R2]
                              [Op4-R1]
```

Where:
- **Top row**: Your matches from current round to final
- **Below each future match**: That opponent's match history (how they got there)

### Match Counts

| Rounds | Your path | Opponent histories | Total |
|--------|-----------|-------------------|-------|
| 4 | 4 | 6 | 10 |
| 8 | 8 | 28 | 36 |
| 15 | 15 | 105 | 120 |

Formula: `N + N×(N-1)/2` where N = rounds remaining

---

## Algorithm

### Step 1: Trace your path to the final

```typescript
function tracePathToFinal(
  currentRound: number,
  currentPosition: number,
  totalRounds: number
): { round: number; position: number }[] {
  const path = [];
  let pos = currentPosition;

  for (let round = currentRound; round <= totalRounds; round++) {
    path.push({ round, position: pos });
    pos = Math.ceil(pos / 2);
  }

  return path;
}
```

### Step 2: Get opponent entry IDs from your path

For each match on your path (except current match), the opponent is known from match data or can be calculated from bracket positions.

### Step 3: Fetch opponent match histories

Query all matches played by each opponent entry ID, grouped by opponent.

---

## Data Fetching

**Two-phase approach:**

1. **Fetch user's path** (existing `GetUserTournamentMatches` query)
2. **Fetch opponent histories** (new query)

### New Query: GetOpponentMatchHistories

```graphql
query GetOpponentMatchHistories(
  $tournamentId: UUID!
  $entryIds: [Int!]!
) @auth(level: PUBLIC) {
  matchPicks(
    where: {
      match: { tournamentId: { eq: $tournamentId } }
      entryId: { in: $entryIds }
    }
  ) {
    entryId
    slot
    match {
      matchId
      roundNumber
      positionInRound
      status
      winnerEntryId
      matchPicks_on_match {
        entryId
        slot
        participant { entryId, teamName, managerName, seed }
      }
    }
  }
}
```

### New Query: GetHighestSeedRemaining

```graphql
query GetHighestSeedRemaining(
  $tournamentId: UUID!
) @auth(level: PUBLIC) {
  participants(
    where: {
      tournamentId: { eq: $tournamentId }
      status: { eq: "active" }
    }
    orderBy: { seed: ASC }
    limit: 1
  ) {
    entryId
    teamName
    managerName
    seed
  }
}
```

---

## Component Structure

```
UserPathBracket
├── PathHeader
│   └── Team selector (search) + "Viewing: [Team Name]"
│
├── YourPathRow (horizontal scroll on mobile)
│   └── PathMatchCard × N (your matches, left to right)
│
└── OpponentHistoryGrid
    └── Column per future match
        └── HistoryMatchCard × (round - 1)
```

### Props

```typescript
interface UserPathBracketProps {
  tournament: Tournament;
  focalTeamId: number;
  onTeamSelect: (id: number) => void;
  currentGameweek: number;
}
```

### Match Card Variants

- **PathMatchCard**: Larger, highlighted, shows your score prominently
- **HistoryMatchCard**: Smaller, muted, shows who won

---

## Default Team Selection

| User State | Default Focal Team |
|------------|-------------------|
| Authenticated + participant | Their own team (auto-detected) |
| Authenticated + not participant | Highest seed still remaining |
| Unauthenticated | Highest seed still remaining |
| Tournament complete | The winner |

Team switcher always visible with search input.

---

## Edge Cases

### User is eliminated
- Show their historical path (matches they played)
- Show their conqueror's continuing path
- "Follow your conqueror" to see if they won

### Bye rounds
- Include byes in the path (shows bracket structure)
- Bye matches display as "[Team] - BYE"

### Tournament pending
- Show projected path based on seed position
- All matches show as "upcoming"

### Very early rounds (R1 of 32k)
- 15 rounds = ~120 matches total
- Acceptable density, no special handling needed

---

## Files to Modify

| File | Change |
|------|--------|
| `dataconnect/connector/queries.gql` | Add `GetOpponentMatchHistories`, `GetHighestSeedRemaining` |
| `src/services/tournament.ts` | Add `fetchOpponentHistories()`, `fetchHighestSeedRemaining()` |
| `src/components/tournament/UserPathBracket.tsx` | New component |
| `src/components/tournament/PathMatchCard.tsx` | New component |
| `src/components/tournament/HistoryMatchCard.tsx` | New component |
| `src/components/tournament/BracketView.tsx` | Replace `PaginatedBracket` with `UserPathBracket` |

---

## Migration

`UserPathBracket` replaces `PaginatedBracket` entirely for large tournaments (>64 participants). The threshold check in `BracketView.tsx` stays the same, just swap the component.

Small tournaments (<= 64) continue using `BracketLayout` which shows the full bracket.
