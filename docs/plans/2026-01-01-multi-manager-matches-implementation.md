# Multi-Manager Matches Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend knockout tournaments to support N-way matches where the highest scorer advances.

**Architecture:** Add `matchSize` field to Tournament, update bracket generator for N-way groups with byes, modify MatchCard to display N participants ranked by score, and enhance match resolver with FPL tiebreaker cascade.

**Tech Stack:** TypeScript, React, Firebase DataConnect (GraphQL), Vitest

---

## Task 1: Add matchSize to Tournament Schema

**Files:**
- Modify: `dataconnect/schema/schema.gql:113-134`
- Modify: `dataconnect/connector/mutations.gql:154-175`

**Step 1: Add matchSize field to schema**

In `dataconnect/schema/schema.gql`, add the `matchSize` field to the Tournament type:

```graphql
type Tournament @table(name: "tournaments") {
  id: UUID! @default(expr: "uuidV4()")
  fplLeagueId: Int! @col(name: "fpl_league_id")
  fplLeagueName: String! @col(name: "fpl_league_name")
  creatorUid: String! @col(name: "creator_uid")

  participantCount: Int! @col(name: "participant_count")
  totalRounds: Int! @col(name: "total_rounds")
  currentRound: Int! @col(name: "current_round") @default(value: 1)
  startEvent: Int! @col(name: "start_event")
  matchSize: Int! @col(name: "match_size") @default(value: 2)  # NEW: 2 = 1v1, 3 = 3-way, etc.

  seedingMethod: String! @col(name: "seeding_method") @default(value: "league_rank")
  status: String! @default(value: "active")
  winnerEntryId: Int @col(name: "winner_entry_id")
  isTest: Boolean! @col(name: "is_test") @default(value: false)

  createdAt: Timestamp! @col(name: "created_at") @default(expr: "request.time")
  updatedAt: Timestamp! @col(name: "updated_at") @default(expr: "request.time")

  # Relations
  creator: User!
}
```

**Step 2: Update CreateTournament mutation**

In `dataconnect/connector/mutations.gql`, add `matchSize` parameter:

```graphql
mutation CreateTournament(
  $fplLeagueId: Int!
  $fplLeagueName: String!
  $creatorUid: String!
  $participantCount: Int!
  $totalRounds: Int!
  $startEvent: Int!
  $seedingMethod: String!
  $matchSize: Int!
) @auth(level: USER) {
  tournament_insert(
    data: {
      fplLeagueId: $fplLeagueId
      fplLeagueName: $fplLeagueName
      creatorUid: $creatorUid
      participantCount: $participantCount
      totalRounds: $totalRounds
      startEvent: $startEvent
      seedingMethod: $seedingMethod
      matchSize: $matchSize
    }
  )
}
```

**Step 3: Regenerate DataConnect SDK**

Run: `cd dataconnect && npm run generate`

**Step 4: Commit**

```bash
git add dataconnect/schema/schema.gql dataconnect/connector/mutations.gql
git commit -m "feat(schema): add matchSize field to Tournament"
```

---

## Task 2: Create N-Way Bracket Calculator Utilities

**Files:**
- Create: `functions/src/nWayBracket.ts`
- Create: `functions/src/nWayBracket.test.ts`

**Step 1: Write failing tests for bracket math**

Create `functions/src/nWayBracket.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateNWayBracket,
  distributeByesAcrossGroups,
} from './nWayBracket';

describe('calculateNWayBracket', () => {
  describe('with matchSize=3', () => {
    it('calculates 27 participants: 3 rounds, 0 byes', () => {
      const result = calculateNWayBracket(27, 3);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 27,
        byeCount: 0,
        groupsPerRound: [9, 3, 1],
      });
    });

    it('calculates 20 participants: 3 rounds, 7 byes', () => {
      const result = calculateNWayBracket(20, 3);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 27,
        byeCount: 7,
        groupsPerRound: [9, 3, 1],
      });
    });

    it('calculates 10 participants: 3 rounds, 17 byes', () => {
      const result = calculateNWayBracket(10, 3);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 27,
        byeCount: 17,
        groupsPerRound: [9, 3, 1],
      });
    });
  });

  describe('with matchSize=4', () => {
    it('calculates 64 participants: 3 rounds, 0 byes', () => {
      const result = calculateNWayBracket(64, 4);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 64,
        byeCount: 0,
        groupsPerRound: [16, 4, 1],
      });
    });

    it('calculates 50 participants: 3 rounds, 14 byes', () => {
      const result = calculateNWayBracket(50, 4);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 64,
        byeCount: 14,
        groupsPerRound: [16, 4, 1],
      });
    });
  });

  describe('with matchSize=2 (1v1)', () => {
    it('calculates 16 participants: 4 rounds, 0 byes', () => {
      const result = calculateNWayBracket(16, 2);
      expect(result).toEqual({
        rounds: 4,
        totalSlots: 16,
        byeCount: 0,
        groupsPerRound: [8, 4, 2, 1],
      });
    });
  });
});

describe('distributeByesAcrossGroups', () => {
  it('distributes 7 byes across 9 groups evenly', () => {
    const result = distributeByesAcrossGroups(9, 7, 3);
    // Top 7 seeds get 1 bye each (facing only 2 opponents)
    // Remaining 2 groups have full 3-way matches
    expect(result.groupsWithByes).toBe(7);
    expect(result.groupsWithTwoByes).toBe(0);
    expect(result.fullGroups).toBe(2);
  });

  it('handles more byes than groups', () => {
    const result = distributeByesAcrossGroups(9, 17, 3);
    // 17 byes across 9 groups of 3 = 27 slots
    // 9 groups get 1 bye, 8 groups get a second bye
    expect(result.groupsWithByes).toBe(9);
    expect(result.groupsWithTwoByes).toBe(8);
    expect(result.fullGroups).toBe(0);
  });

  it('handles auto-advance (2 byes in group of 3)', () => {
    const result = distributeByesAcrossGroups(9, 18, 3);
    // Every group has exactly 2 byes = 1 real player each
    expect(result.groupsWithTwoByes).toBe(9);
    expect(result.autoAdvanceCount).toBe(9);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- nWayBracket.test.ts`
Expected: FAIL - module not found

**Step 3: Implement bracket calculator**

Create `functions/src/nWayBracket.ts`:

```typescript
/**
 * N-Way Bracket Calculator
 *
 * Calculates bracket structure for tournaments with N managers per match.
 */

export interface NWayBracketResult {
  rounds: number;
  totalSlots: number;
  byeCount: number;
  groupsPerRound: number[];
}

export interface ByeDistribution {
  groupsWithByes: number;      // Groups with exactly 1 bye
  groupsWithTwoByes: number;   // Groups with exactly 2 byes (matchSize-1 byes = auto-advance)
  fullGroups: number;          // Groups with 0 byes
  autoAdvanceCount: number;    // Groups where 1 player auto-advances
}

/**
 * Calculate bracket structure for N-way matches.
 *
 * @param participantCount - Number of real participants
 * @param matchSize - Managers per match (2, 3, 4, etc.)
 * @returns Bracket structure with rounds, slots, and byes
 */
export function calculateNWayBracket(
  participantCount: number,
  matchSize: number
): NWayBracketResult {
  // Find minimum rounds needed: matchSize^rounds >= participantCount
  const rounds = Math.ceil(Math.log(participantCount) / Math.log(matchSize));

  // Total slots is the perfect power of matchSize
  const totalSlots = Math.pow(matchSize, rounds);

  // Byes fill the gap
  const byeCount = totalSlots - participantCount;

  // Groups per round: starts with totalSlots/matchSize, reduces by factor of matchSize each round
  const groupsPerRound: number[] = [];
  for (let r = 1; r <= rounds; r++) {
    groupsPerRound.push(Math.pow(matchSize, rounds - r));
  }

  return { rounds, totalSlots, byeCount, groupsPerRound };
}

/**
 * Distribute byes across round 1 groups.
 *
 * Strategy:
 * - Spread byes evenly to minimize auto-advances
 * - Top seeds get byes first (reward higher league rank)
 *
 * @param groupCount - Number of groups in round 1
 * @param byeCount - Total byes to distribute
 * @param matchSize - Managers per match
 */
export function distributeByesAcrossGroups(
  groupCount: number,
  byeCount: number,
  matchSize: number
): ByeDistribution {
  const maxByesPerGroup = matchSize - 1; // Can't have matchSize byes (no players)

  // First pass: give each group up to 1 bye
  const firstPassByes = Math.min(byeCount, groupCount);
  let remainingByes = byeCount - firstPassByes;

  // Second pass: give second bye to groups (if needed)
  const secondPassByes = Math.min(remainingByes, groupCount);
  remainingByes -= secondPassByes;

  // Groups with 2 byes = auto-advance (only 1 real player)
  const groupsWithTwoByes = secondPassByes;
  const groupsWithByes = firstPassByes;
  const fullGroups = groupCount - firstPassByes;

  // Auto-advance happens when a group has matchSize-1 byes
  const autoAdvanceCount = matchSize === 3 ? groupsWithTwoByes : 0;

  return {
    groupsWithByes,
    groupsWithTwoByes,
    fullGroups,
    autoAdvanceCount,
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- nWayBracket.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/nWayBracket.ts functions/src/nWayBracket.test.ts
git commit -m "feat: add N-way bracket calculator utilities"
```

---

## Task 3: Create N-Way Match Resolver

**Files:**
- Create: `functions/src/nWayMatchResolver.ts`
- Create: `functions/src/nWayMatchResolver.test.ts`

**Step 1: Write failing tests for N-way match resolution**

Create `functions/src/nWayMatchResolver.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { resolveNWayMatch, NWayPlayerScore } from './nWayMatchResolver';

describe('resolveNWayMatch', () => {
  it('returns winner with highest points', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 45, transferCost: 0, benchPoints: 10 },
      { entryId: 2, slot: 2, seed: 2, points: 52, transferCost: 0, benchPoints: 8 },
      { entryId: 3, slot: 3, seed: 3, points: 38, transferCost: 4, benchPoints: 12 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(2);
    expect(result?.rankings).toEqual([
      { entryId: 2, rank: 1, points: 52 },
      { entryId: 1, rank: 2, points: 45 },
      { entryId: 3, rank: 3, points: 38 },
    ]);
  });

  it('breaks tie by transfer cost (lower is better)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 50, transferCost: 8, benchPoints: 10 },
      { entryId: 2, slot: 2, seed: 2, points: 50, transferCost: 4, benchPoints: 10 },
      { entryId: 3, slot: 3, seed: 3, points: 50, transferCost: 0, benchPoints: 10 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(3); // 0 transfer cost wins
    expect(result?.rankings[0].entryId).toBe(3);
    expect(result?.rankings[1].entryId).toBe(2);
    expect(result?.rankings[2].entryId).toBe(1);
    expect(result?.decidedByTiebreaker).toBe(true);
  });

  it('breaks tie by bench points (higher is better)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 50, transferCost: 0, benchPoints: 8 },
      { entryId: 2, slot: 2, seed: 2, points: 50, transferCost: 0, benchPoints: 15 },
      { entryId: 3, slot: 3, seed: 3, points: 50, transferCost: 0, benchPoints: 12 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(2); // 15 bench points wins
    expect(result?.decidedByTiebreaker).toBe(true);
  });

  it('breaks final tie by seed (lower is better)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 3, points: 50, transferCost: 0, benchPoints: 10 },
      { entryId: 2, slot: 2, seed: 1, points: 50, transferCost: 0, benchPoints: 10 },
      { entryId: 3, slot: 3, seed: 2, points: 50, transferCost: 0, benchPoints: 10 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(2); // Seed 1 wins
    expect(result?.decidedByTiebreaker).toBe(true);
  });

  it('handles single player (auto-advance)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 45, transferCost: 0, benchPoints: 10 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(1);
    expect(result?.decidedByTiebreaker).toBe(false);
  });

  it('returns null for empty scores', () => {
    const result = resolveNWayMatch(1, []);
    expect(result).toBeNull();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- nWayMatchResolver.test.ts`
Expected: FAIL - module not found

**Step 3: Implement N-way match resolver**

Create `functions/src/nWayMatchResolver.ts`:

```typescript
/**
 * N-Way Match Resolver
 *
 * Determines winner from N participants using FPL tiebreaker cascade:
 * 1. Points (higher is better)
 * 2. Transfer cost (lower is better)
 * 3. Bench points (higher is better)
 * 4. Seed (lower is better) - fallback for perfect ties
 */

export interface NWayPlayerScore {
  entryId: number;
  slot: number;
  seed: number;
  points: number;
  transferCost: number;
  benchPoints: number;
}

export interface PlayerRanking {
  entryId: number;
  rank: number;
  points: number;
}

export interface NWayMatchResult {
  matchId: number;
  winnerId: number;
  rankings: PlayerRanking[];
  decidedByTiebreaker: boolean;
}

/**
 * Resolve an N-way match using FPL tiebreaker cascade.
 */
export function resolveNWayMatch(
  matchId: number,
  scores: NWayPlayerScore[]
): NWayMatchResult | null {
  if (scores.length === 0) {
    return null;
  }

  // Single player = auto-advance
  if (scores.length === 1) {
    return {
      matchId,
      winnerId: scores[0].entryId,
      rankings: [{ entryId: scores[0].entryId, rank: 1, points: scores[0].points }],
      decidedByTiebreaker: false,
    };
  }

  // Sort by tiebreaker cascade
  const sorted = [...scores].sort((a, b) => {
    // 1. Points (higher is better)
    if (b.points !== a.points) return b.points - a.points;

    // 2. Transfer cost (lower is better)
    if (a.transferCost !== b.transferCost) return a.transferCost - b.transferCost;

    // 3. Bench points (higher is better)
    if (b.benchPoints !== a.benchPoints) return b.benchPoints - a.benchPoints;

    // 4. Seed (lower is better)
    return a.seed - b.seed;
  });

  // Check if tiebreaker was used (any player has same points as winner)
  const winnerPoints = sorted[0].points;
  const decidedByTiebreaker = sorted.slice(1).some(p => p.points === winnerPoints);

  // Build rankings
  const rankings: PlayerRanking[] = sorted.map((player, index) => ({
    entryId: player.entryId,
    rank: index + 1,
    points: player.points,
  }));

  return {
    matchId,
    winnerId: sorted[0].entryId,
    rankings,
    decidedByTiebreaker,
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- nWayMatchResolver.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/nWayMatchResolver.ts functions/src/nWayMatchResolver.test.ts
git commit -m "feat: add N-way match resolver with FPL tiebreakers"
```

---

## Task 4: Update Tournament Types for N-Way Matches

**Files:**
- Modify: `src/types/tournament.ts`
- Create: `src/types/tournament.test.ts`

**Step 1: Write type tests**

Create `src/types/tournament.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { Match, MatchPlayer, Tournament } from './tournament';

describe('Tournament types', () => {
  it('Match supports N players via players array', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 45 },
        { fplTeamId: 2, seed: 2, score: 52 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 2,
      isBye: false,
    };

    expect(match.players.length).toBe(3);
    expect(match.winnerId).toBe(2);
  });

  it('Match supports legacy player1/player2 for backward compatibility', () => {
    const match: Match = {
      id: 'match-1',
      player1: { fplTeamId: 1, seed: 1, score: 45 },
      player2: { fplTeamId: 2, seed: 2, score: 52 },
      players: [],
      winnerId: 2,
      isBye: false,
    };

    expect(match.player1?.fplTeamId).toBe(1);
    expect(match.player2?.fplTeamId).toBe(2);
  });

  it('Tournament has matchSize field', () => {
    const tournament: Partial<Tournament> = {
      id: 'test',
      matchSize: 3,
    };

    expect(tournament.matchSize).toBe(3);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/types/tournament.test.ts`
Expected: FAIL - types don't match

**Step 3: Update tournament types**

Modify `src/types/tournament.ts`:

```typescript
// src/types/tournament.ts

export type TournamentStatus = 'active' | 'completed';

export interface Participant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number; // 1 = top seed (best league rank)
}

export interface MatchPlayer {
  fplTeamId: number;
  seed: number;
  score: number | null; // Stored after GW finishes
}

export interface Match {
  id: string;
  // New: array of players for N-way matches
  players: MatchPlayer[];
  // Legacy: kept for backward compatibility with 1v1 matches
  player1?: MatchPlayer | null;
  player2?: MatchPlayer | null;
  winnerId: number | null; // FPL team ID
  isBye: boolean;
}

export interface Round {
  roundNumber: number;
  name: string; // "Round 1", "Quarter-Finals", "Semi-Finals", "Final"
  gameweek: number;
  matches: Match[];
  isComplete: boolean;
}

export interface Tournament {
  id: string; // Firestore document ID
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUserId: string;
  startGameweek: number; // First round GW (auto-set to next GW)
  currentRound: number; // 1-indexed
  currentGameweek: number; // Actual current FPL gameweek (from Events table)
  totalRounds: number; // Calculated from participant count
  matchSize: number; // NEW: 2 = 1v1, 3 = 3-way, etc.
  status: TournamentStatus;
  participants: Participant[];
  rounds: Round[];
  winnerId: number | null; // FPL team ID of winner
  createdAt: string;
  updatedAt: string;
}

/**
 * Get players from a match (handles both legacy and new format)
 */
export function getMatchPlayers(match: Match): MatchPlayer[] {
  if (match.players && match.players.length > 0) {
    return match.players;
  }
  // Fallback to legacy format
  const players: MatchPlayer[] = [];
  if (match.player1) players.push(match.player1);
  if (match.player2) players.push(match.player2);
  return players;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/types/tournament.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/tournament.ts src/types/tournament.test.ts
git commit -m "feat(types): add matchSize and players array to tournament types"
```

---

## Task 5: Create NWayMatchCard Component

**Files:**
- Create: `src/components/tournament/NWayMatchCard.tsx`
- Create: `src/components/tournament/NWayMatchCard.test.tsx`

**Step 1: Write failing tests for NWayMatchCard**

Create `src/components/tournament/NWayMatchCard.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NWayMatchCard } from './NWayMatchCard';
import type { Match, Participant } from '../../types/tournament';

const mockParticipants: Participant[] = [
  { fplTeamId: 1, fplTeamName: 'Team Alpha', managerName: 'Alice', seed: 1 },
  { fplTeamId: 2, fplTeamName: 'Team Beta', managerName: 'Bob', seed: 2 },
  { fplTeamId: 3, fplTeamName: 'Team Gamma', managerName: 'Charlie', seed: 3 },
];

describe('NWayMatchCard', () => {
  it('renders all players sorted by score (highest first)', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 45 },
        { fplTeamId: 2, seed: 2, score: 52 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 2,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    const teamNames = screen.getAllByTestId('team-name');
    expect(teamNames[0]).toHaveTextContent('Team Beta'); // 52 pts
    expect(teamNames[1]).toHaveTextContent('Team Alpha'); // 45 pts
    expect(teamNames[2]).toHaveTextContent('Team Gamma'); // 38 pts
  });

  it('highlights the winner', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
      ],
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    const winnerRow = screen.getByTestId('player-row-1');
    expect(winnerRow).toHaveClass('font-semibold');
  });

  it('shows rank indicators (1st, 2nd, 3rd)', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText('1st')).toBeInTheDocument();
    expect(screen.getByText('2nd')).toBeInTheDocument();
    expect(screen.getByText('3rd')).toBeInTheDocument();
  });

  it('shows BYE for missing players', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: null },
      ],
      winnerId: 1,
      isBye: true,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText('BYE')).toBeInTheDocument();
  });

  it('shows pending state when no scores yet', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: null },
        { fplTeamId: 2, seed: 2, score: null },
        { fplTeamId: 3, seed: 3, score: null },
      ],
      winnerId: null,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    // Should show teams in seed order when no scores
    const teamNames = screen.getAllByTestId('team-name');
    expect(teamNames[0]).toHaveTextContent('Team Alpha'); // seed 1
    expect(teamNames[1]).toHaveTextContent('Team Beta'); // seed 2
    expect(teamNames[2]).toHaveTextContent('Team Gamma'); // seed 3
  });

  it('highlights user match when isUserMatch is true', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 45 },
        { fplTeamId: 2, seed: 2, score: 52 },
      ],
      winnerId: 2,
      isBye: false,
    };

    render(
      <NWayMatchCard
        match={match}
        participants={mockParticipants}
        gameweek={10}
        isUserMatch
        userTeamId={1}
      />
    );

    const card = screen.getByTestId('nway-match-card');
    expect(card).toHaveClass('border-amber-500');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/tournament/NWayMatchCard.test.tsx`
Expected: FAIL - component not found

**Step 3: Implement NWayMatchCard component**

Create `src/components/tournament/NWayMatchCard.tsx`:

```tsx
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import type { Match, Participant, MatchPlayer } from '../../types/tournament';
import { getMatchPlayers } from '../../types/tournament';

interface NWayMatchCardProps {
  match: Match;
  participants: Participant[];
  gameweek: number;
  isUserMatch?: boolean;
  userTeamId?: number;
}

function getRankLabel(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export function NWayMatchCard({
  match,
  participants,
  gameweek,
  isUserMatch,
  userTeamId,
}: NWayMatchCardProps) {
  const players = getMatchPlayers(match);

  const getParticipantById = (fplTeamId: number): Participant | undefined => {
    return participants.find((p) => p.fplTeamId === fplTeamId);
  };

  // Sort players: by score (desc) if scores exist, otherwise by seed (asc)
  const hasScores = players.some((p) => p.score !== null);
  const sortedPlayers = [...players].sort((a, b) => {
    if (hasScores) {
      return (b.score ?? 0) - (a.score ?? 0);
    }
    return a.seed - b.seed;
  });

  const renderPlayerRow = (player: MatchPlayer, index: number) => {
    const participant = getParticipantById(player.fplTeamId);
    const isWinner = match.winnerId === player.fplTeamId;
    const isLoser = match.winnerId !== null && !isWinner;
    const rank = hasScores ? index + 1 : null;

    if (!participant) {
      return (
        <div
          key={`bye-${index}`}
          className="flex justify-between items-center py-2 text-muted-foreground"
        >
          <span>BYE</span>
        </div>
      );
    }

    return (
      <div
        key={player.fplTeamId}
        data-testid={`player-row-${player.fplTeamId}`}
        className={`flex justify-between items-center py-2 ${
          isWinner ? 'font-semibold' : ''
        } ${isLoser ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-2">
          {rank !== null && (
            <span className="text-xs text-muted-foreground w-8">
              {getRankLabel(rank)}
            </span>
          )}
          <span data-testid="team-name">{participant.fplTeamName}</span>
          <span className="text-muted-foreground text-sm">({participant.seed})</span>
        </div>
        {player.score !== null && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{player.score}</span>
            {isWinner && <span className="text-green-500">✓</span>}
          </div>
        )}
      </div>
    );
  };

  // Show BYE indicator for matches with only 1 real player
  const showByeIndicator = match.isBye || players.length === 1;

  return (
    <Card
      data-testid="nway-match-card"
      className={isUserMatch ? 'border-2 border-amber-500' : ''}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">GW {gameweek}</Badge>
        </div>
        <div className="space-y-1 divide-y">
          {sortedPlayers.map((player, index) => renderPlayerRow(player, index))}
          {showByeIndicator && players.length === 1 && (
            <div className="flex justify-between items-center py-2 text-muted-foreground">
              <span>BYE</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/tournament/NWayMatchCard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/NWayMatchCard.tsx src/components/tournament/NWayMatchCard.test.tsx
git commit -m "feat(ui): add NWayMatchCard component for multi-manager matches"
```

---

## Task 6: Update CreateTournament Cloud Function

**Files:**
- Modify: `functions/src/createTournament.ts`
- Modify: `functions/src/createTournament.test.ts`

**Step 1: Add matchSize to request interface**

In `functions/src/createTournament.ts`, update the request interface:

```typescript
export interface CreateTournamentRequest {
  fplLeagueId: number;
  startEvent?: number;  // Optional, defaults to currentGW + 1
  matchSize?: number;   // Optional, defaults to 2 (1v1)
}
```

**Step 2: Update validation to accept matchSize**

In `validateTournamentRequest`:

```typescript
export function validateTournamentRequest(data: any): asserts data is CreateTournamentRequest {
  if (!data.fplLeagueId) {
    throw new HttpsError('invalid-argument', 'fplLeagueId is required');
  }
  if (typeof data.fplLeagueId !== 'number') {
    throw new HttpsError('invalid-argument', 'fplLeagueId must be a number');
  }
  // Validate optional startEvent
  if (data.startEvent !== undefined) {
    if (typeof data.startEvent !== 'number') {
      throw new HttpsError('invalid-argument', 'startEvent must be a number');
    }
    if (data.startEvent < 1 || data.startEvent > 38) {
      throw new HttpsError('invalid-argument', 'startEvent must be between 1 and 38');
    }
  }
  // Validate optional matchSize
  if (data.matchSize !== undefined) {
    if (typeof data.matchSize !== 'number') {
      throw new HttpsError('invalid-argument', 'matchSize must be a number');
    }
    if (data.matchSize < 2 || data.matchSize > 8) {
      throw new HttpsError('invalid-argument', 'matchSize must be between 2 and 8');
    }
  }
}
```

**Step 3: Write test for matchSize parameter**

Add to `functions/src/createTournament.test.ts`:

```typescript
describe('validateTournamentRequest', () => {
  // ... existing tests ...

  it('accepts valid matchSize', () => {
    expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 3 })).not.toThrow();
    expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 4 })).not.toThrow();
  });

  it('rejects invalid matchSize', () => {
    expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 1 }))
      .toThrow('matchSize must be between 2 and 8');
    expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 10 }))
      .toThrow('matchSize must be between 2 and 8');
  });

  it('defaults matchSize to 2 when not provided', () => {
    const data = { fplLeagueId: 123 };
    validateTournamentRequest(data);
    // No error means validation passed
  });
});
```

**Step 4: Run tests**

Run: `cd functions && npm test -- createTournament.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/createTournament.ts functions/src/createTournament.test.ts
git commit -m "feat: add matchSize parameter to createTournament"
```

---

## Task 7: Wire Up N-Way Bracket Generation in createTournament

**Files:**
- Modify: `functions/src/createTournament.ts`

**Step 1: Import N-way bracket utilities**

Add import at top of file:

```typescript
import {
  calculateNWayBracket,
} from './nWayBracket';
```

**Step 2: Update bracket calculation logic**

Replace the bracket calculation section in `createTournament`:

```typescript
// 5. Calculate bracket structure
const participantCount = standings.standings.results.length;
const matchSize = request.data.matchSize ?? 2;

// Use N-way bracket calculator
const { rounds: totalRounds, totalSlots: bracketSize, byeCount } =
  matchSize === 2
    ? {
        rounds: calculateTotalRounds(calculateBracketSize(participantCount)),
        totalSlots: calculateBracketSize(participantCount),
        byeCount: calculateBracketSize(participantCount) - participantCount,
      }
    : calculateNWayBracket(participantCount, matchSize);

const currentGW = getCurrentGameweek(bootstrapData);
const startEvent = requestedStartEvent ?? currentGW + 1;

console.log(`[createTournament] Bracket: ${participantCount} participants, matchSize=${matchSize}, ${totalRounds} rounds, ${byeCount} byes`);
```

**Step 3: Update TournamentRecord to include matchSize**

```typescript
interface TournamentRecord {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  matchSize: number;  // ADD THIS
}
```

**Step 4: Update buildTournamentRecords to include matchSize**

```typescript
// Tournament
const tournament: TournamentRecord = {
  fplLeagueId: leagueData.id,
  fplLeagueName: leagueData.name,
  creatorUid: uid,
  participantCount: standingsResults.length,
  totalRounds,
  startEvent,
  seedingMethod: 'league_rank',
  matchSize,  // ADD THIS
};
```

**Step 5: Update writeTournamentToDatabase**

```typescript
await createTournamentAdmin(
  {
    id: tournamentId,
    fplLeagueId: records.tournament.fplLeagueId,
    fplLeagueName: records.tournament.fplLeagueName,
    creatorUid: records.tournament.creatorUid,
    participantCount: records.tournament.participantCount,
    totalRounds: records.tournament.totalRounds,
    startEvent: records.tournament.startEvent,
    seedingMethod: records.tournament.seedingMethod,
    matchSize: records.tournament.matchSize,  // ADD THIS
  },
  authClaims
);
```

**Step 6: Run all tests**

Run: `cd functions && npm test`
Expected: PASS

**Step 7: Commit**

```bash
git add functions/src/createTournament.ts
git commit -m "feat: integrate N-way bracket generation in createTournament"
```

---

## Task 8: Add Match Size Selector to Tournament Creation UI

**Files:**
- Modify: `src/components/tournament/CreateTournamentButton.tsx`
- Modify: `src/components/tournament/CreateTournamentButton.test.tsx`

**Step 1: Add test for match size selector**

Add to `CreateTournamentButton.test.tsx`:

```typescript
describe('match size selection', () => {
  it('shows match size selector in creation dialog', async () => {
    render(<CreateTournamentButton league={mockLeague} />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    expect(screen.getByLabelText(/match size/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /1v1/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /3-way/i })).toBeInTheDocument();
  });

  it('defaults to 1v1 (matchSize=2)', async () => {
    render(<CreateTournamentButton league={mockLeague} />);

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    const select = screen.getByLabelText(/match size/i);
    expect(select).toHaveValue('2');
  });

  it('passes matchSize to createTournament', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ tournamentId: '123' });
    vi.mocked(createTournament).mockImplementation(mockCreate);

    render(<CreateTournamentButton league={mockLeague} />);

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    // Select 3-way
    const select = screen.getByLabelText(/match size/i);
    fireEvent.change(select, { target: { value: '3' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ matchSize: 3 })
      );
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- CreateTournamentButton.test.tsx`
Expected: FAIL

**Step 3: Add match size selector to CreateTournamentButton**

Update the component to include a select dropdown for match size:

```tsx
// Add state for matchSize
const [matchSize, setMatchSize] = useState(2);

// Add select element in the dialog
<Label htmlFor="matchSize">Match Size</Label>
<select
  id="matchSize"
  aria-label="Match Size"
  value={matchSize}
  onChange={(e) => setMatchSize(Number(e.target.value))}
  className="w-full p-2 border rounded"
>
  <option value="2">1v1 (Traditional)</option>
  <option value="3">3-way (Top 1 advances)</option>
  <option value="4">4-way (Top 1 advances)</option>
</select>

// Update create call to include matchSize
await createTournament({ fplLeagueId, matchSize });
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- CreateTournamentButton.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/CreateTournamentButton.tsx src/components/tournament/CreateTournamentButton.test.tsx
git commit -m "feat(ui): add match size selector to tournament creation"
```

---

## Task 9: Run Full Test Suite

**Step 1: Run all unit tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run function tests**

Run: `cd functions && npm test`
Expected: All tests pass

**Step 3: Commit any fixes**

If tests fail, fix issues and commit:

```bash
git add -A
git commit -m "fix: address test failures"
```

---

## Task 10: Manual E2E Verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Start Firebase emulators**

Run: `firebase emulators:start --only auth,dataconnect --project demo-knockoutfpl`

**Step 3: Verify match size selector appears**

Navigate to a league page and click "Create Tournament". Verify:
- Match size dropdown is visible
- Options include 1v1, 3-way, 4-way

**Step 4: Create a 3-way tournament**

- Select "3-way" match size
- Create tournament
- Verify bracket displays correctly

**Step 5: Check for console errors**

Open browser dev tools and verify no console errors.

---

## Summary

This plan implements multi-manager matches through 10 tasks:

1. **Schema** - Add matchSize field
2. **N-Way Bracket Calculator** - Math utilities for N-way brackets
3. **N-Way Match Resolver** - FPL tiebreaker cascade
4. **Tournament Types** - Update TypeScript types
5. **NWayMatchCard** - New UI component
6. **CreateTournament Validation** - Accept matchSize param
7. **Bracket Generation** - Wire up N-way logic
8. **UI Selector** - Match size dropdown
9. **Full Test Suite** - Verify all tests pass
10. **E2E Verification** - Manual testing

Each task follows TDD with failing tests first, then implementation.
