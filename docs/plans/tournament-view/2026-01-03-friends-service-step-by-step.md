# Friends Service Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a friends service that identifies managers sharing mini-leagues (beyond the tournament league) and surfaces them across Overview, Matches, and Participants tabs.

**Architecture:** Two service functions (`getTournamentFriends`, `getTournamentMatchups`) with composable filtering. ParticipantLeague data is already stored at tournament creation. Runtime queries cross-reference user's FPL leagues with stored participant leagues to compute "friend" relationships.

**Tech Stack:** TypeScript, Vitest, DataConnect (PostgreSQL), React hooks

---

## Task 1: Add DataConnect Query for Participant Leagues

**Files:**
- Modify: `dataconnect/connector/queries.gql`

**Step 1: Add GetParticipantLeaguesForTournament query**

Add this query at the end of the file:

```graphql
# =============================================================================
# PARTICIPANT LEAGUE QUERIES (Friends Feature)
# =============================================================================

# Get all participant league memberships for a tournament
# Used to calculate "friends" - participants sharing leagues with the user
query GetParticipantLeaguesForTournament($tournamentId: UUID!) @auth(level: PUBLIC) {
  participantLeagues(where: { tournamentId: { eq: $tournamentId } }) {
    tournamentId
    entryId
    leagueId
    leagueName
    entryRank
  }
}
```

**Step 2: Regenerate DataConnect SDK**

Run: `npm run dataconnect:sdk`
Expected: Success, updates `dataconnect/dataconnect-generated/` files

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql dataconnect/dataconnect-generated/
git commit -m "feat: add GetParticipantLeaguesForTournament query for friends feature"
```

---

## Task 2: Add getParticipantLeaguesForTournament wrapper in tournament service

**Files:**
- Modify: `src/services/tournament.ts`
- Test: `src/services/tournament.test.ts`

**Step 1: Write the test**

Add to `src/services/tournament.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DataConnect
vi.mock('@knockoutfpl/dataconnect', () => ({
  getParticipantLeaguesForTournament: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  dataConnect: {},
}));

import { getParticipantLeaguesForTournament as getParticipantLeaguesForTournamentQuery } from '@knockoutfpl/dataconnect';
import { getParticipantLeaguesForTournament, ParticipantLeagueRecord } from './tournament';

describe('getParticipantLeaguesForTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns participant leagues from DataConnect', async () => {
    const mockLeagues = [
      { tournamentId: 'abc-123', entryId: 1001, leagueId: 100, leagueName: 'Work League', entryRank: 5 },
      { tournamentId: 'abc-123', entryId: 1001, leagueId: 200, leagueName: 'Friends League', entryRank: 2 },
      { tournamentId: 'abc-123', entryId: 1002, leagueId: 100, leagueName: 'Work League', entryRank: 8 },
    ];

    vi.mocked(getParticipantLeaguesForTournamentQuery).mockResolvedValue({
      data: { participantLeagues: mockLeagues },
    } as any);

    const result = await getParticipantLeaguesForTournament('abc-123');

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      entryId: 1001,
      leagueId: 100,
      leagueName: 'Work League',
    });
  });

  it('returns empty array when no leagues found', async () => {
    vi.mocked(getParticipantLeaguesForTournamentQuery).mockResolvedValue({
      data: { participantLeagues: [] },
    } as any);

    const result = await getParticipantLeaguesForTournament('no-leagues');
    expect(result).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/services/tournament.test.ts`
Expected: FAIL with "getParticipantLeaguesForTournament is not exported"

**Step 3: Add import and type to tournament.ts**

Add to the imports at the top of `src/services/tournament.ts`:

```typescript
import {
  getLeagueTournaments,
  getTournamentWithParticipants,
  getTournamentRounds,
  getRoundMatches,
  getAllTournamentMatchPicks,
  getPicksForEvent,
  getCurrentEvent,
  getUserTournamentMatches,
  getOpponentMatchHistories,
  getHighestSeedRemaining,
  getMatchesInRange,
  getTournamentImportStatus as getTournamentImportStatusQuery,
  getParticipantLeaguesForTournament as getParticipantLeaguesForTournamentQuery,
} from '@knockoutfpl/dataconnect';
```

**Step 4: Add type and function**

Add at the end of `src/services/tournament.ts`:

```typescript
// ============================================================================
// Participant Leagues (for Friends Feature)
// ============================================================================

/**
 * A participant's league membership (excludes tournamentId for client use)
 */
export interface ParticipantLeagueRecord {
  entryId: number;
  leagueId: number;
  leagueName: string;
}

/**
 * Get all participant league memberships for a tournament.
 * Used to calculate "friends" - participants sharing leagues with the user.
 */
export async function getParticipantLeaguesForTournament(
  tournamentId: string
): Promise<ParticipantLeagueRecord[]> {
  const result = await getParticipantLeaguesForTournamentQuery(dataConnect, {
    tournamentId: tournamentId as UUIDString,
  });

  return (result.data.participantLeagues || []).map((pl) => ({
    entryId: pl.entryId,
    leagueId: pl.leagueId,
    leagueName: pl.leagueName,
  }));
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- src/services/tournament.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/services/tournament.ts src/services/tournament.test.ts
git commit -m "feat: add getParticipantLeaguesForTournament wrapper"
```

---

## Task 3: Create friends service with types

**Files:**
- Create: `src/services/friends.ts`
- Create: `src/services/friends.test.ts`

**Step 1: Write the failing test**

Create `src/services/friends.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('./fpl', () => ({
  getUserMiniLeagues: vi.fn(),
}));

vi.mock('./tournament', () => ({
  getParticipantLeaguesForTournament: vi.fn(),
}));

import { getUserMiniLeagues } from './fpl';
import { getParticipantLeaguesForTournament } from './tournament';
import { getTournamentFriends, FriendInTournament } from './friends';
import type { Participant } from '@/types/tournament';

describe('getTournamentFriends', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1001, fplTeamName: 'My Team', managerName: 'Me', seed: 1 },
    { fplTeamId: 1002, fplTeamName: 'Friend Team', managerName: 'Alice', seed: 2 },
    { fplTeamId: 1003, fplTeamName: 'Stranger Team', managerName: 'Bob', seed: 3 },
    { fplTeamId: 1004, fplTeamName: 'Best Friend', managerName: 'Charlie', seed: 4 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies friends who share leagues (excluding tournament league)', async () => {
    // User is in leagues 100 (tournament), 200 (work), 300 (draft)
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
      { id: 200, name: 'Work League', entryRank: 5 },
      { id: 300, name: 'Draft League', entryRank: 2 },
    ]);

    // Participant leagues stored in DB
    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      // User (1001) - should be skipped
      { entryId: 1001, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1001, leagueId: 200, leagueName: 'Work League' },
      // Alice (1002) - shares Work League -> friend
      { entryId: 1002, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1002, leagueId: 200, leagueName: 'Work League' },
      // Bob (1003) - only shares tournament league -> NOT a friend
      { entryId: 1003, leagueId: 100, leagueName: 'Tournament League' },
      // Charlie (1004) - shares Work + Draft -> best friend (2 shared)
      { entryId: 1004, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1004, leagueId: 200, leagueName: 'Work League' },
      { entryId: 1004, leagueId: 300, leagueName: 'Draft League' },
    ]);

    const friends = await getTournamentFriends(
      'tournament-123',
      100, // tournament league ID
      1001, // user's FPL team ID
      mockParticipants
    );

    // Should have 2 friends: Charlie (2 shared) and Alice (1 shared)
    expect(friends).toHaveLength(2);

    // Sorted by sharedLeagueCount desc
    expect(friends[0].fplTeamId).toBe(1004); // Charlie - 2 shared
    expect(friends[0].sharedLeagueCount).toBe(2);
    expect(friends[0].sharedLeagueNames).toEqual(['Work League', 'Draft League']);

    expect(friends[1].fplTeamId).toBe(1002); // Alice - 1 shared
    expect(friends[1].sharedLeagueCount).toBe(1);
  });

  it('returns empty array when user has no friends', async () => {
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
    ]);

    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      { entryId: 1002, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1003, leagueId: 100, leagueName: 'Tournament League' },
    ]);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);
    expect(friends).toEqual([]);
  });

  it('excludes self from friends list', async () => {
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
      { id: 200, name: 'Work League', entryRank: 5 },
    ]);

    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      { entryId: 1001, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1001, leagueId: 200, leagueName: 'Work League' },
    ]);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);
    expect(friends).toEqual([]);
  });

  it('sorts alphabetically when shared count is equal', async () => {
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
      { id: 200, name: 'Work League', entryRank: 5 },
    ]);

    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      { entryId: 1002, leagueId: 200, leagueName: 'Work League' },
      { entryId: 1004, leagueId: 200, leagueName: 'Work League' },
    ]);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);

    // Both have 1 shared league, so sorted alphabetically by team name
    expect(friends[0].teamName).toBe('Best Friend'); // Charlie
    expect(friends[1].teamName).toBe('Friend Team'); // Alice
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/services/friends.test.ts`
Expected: FAIL with "Cannot find module './friends'"

**Step 3: Create friends.ts with types and function**

Create `src/services/friends.ts`:

```typescript
// src/services/friends.ts
import { getUserMiniLeagues } from './fpl';
import { getParticipantLeaguesForTournament } from './tournament';
import type { Participant } from '@/types/tournament';

/**
 * A friend is a manager who shares at least 1 mini-league with the user,
 * EXCLUDING the tournament's league.
 */
export interface FriendInTournament {
  fplTeamId: number;
  teamName: string;
  managerName: string;
  sharedLeagueCount: number; // Excludes tournament league
  sharedLeagueNames: string[]; // For display: "Work League, Draft League"
  status: 'in' | 'eliminated';
  eliminatedRound?: number;
  seed: number;
}

/**
 * Find all participants who share mini-leagues with the user (beyond the tournament league).
 *
 * @param tournamentId - Tournament ID
 * @param tournamentLeagueId - FPL league ID for this tournament (excluded from friend calculation)
 * @param userFplTeamId - User's FPL team ID
 * @param participants - Tournament participants
 * @returns Friends sorted by sharedLeagueCount desc, then alphabetically
 */
export async function getTournamentFriends(
  tournamentId: string,
  tournamentLeagueId: number,
  userFplTeamId: number,
  participants: Participant[]
): Promise<FriendInTournament[]> {
  // 1. Get user's leagues from FPL API
  const userLeagues = await getUserMiniLeagues(userFplTeamId);
  const userLeagueIds = new Set(userLeagues.map((l) => l.id));

  // 2. Query ParticipantLeague table (cached from tournament creation)
  const participantLeagues = await getParticipantLeaguesForTournament(tournamentId);

  // 3. For each participant, find shared leagues (excluding tournament league)
  const friends: FriendInTournament[] = [];

  for (const participant of participants) {
    // Skip self
    if (participant.fplTeamId === userFplTeamId) continue;

    // Get their leagues, excluding the tournament league
    const theirLeagues = participantLeagues
      .filter((pl) => pl.entryId === participant.fplTeamId)
      .filter((pl) => pl.leagueId !== tournamentLeagueId);

    // Find shared leagues
    const sharedLeagues = theirLeagues.filter((pl) => userLeagueIds.has(pl.leagueId));

    // If they share at least 1 league (excluding tournament), they're a friend
    if (sharedLeagues.length >= 1) {
      friends.push({
        fplTeamId: participant.fplTeamId,
        teamName: participant.fplTeamName,
        managerName: participant.managerName,
        sharedLeagueCount: sharedLeagues.length,
        sharedLeagueNames: sharedLeagues.map((l) => l.leagueName),
        seed: participant.seed,
        status: 'in', // TODO: Calculate from tournament data
        eliminatedRound: undefined,
      });
    }
  }

  // 4. Sort by shared count desc, then alphabetically by team name
  return friends.sort((a, b) => {
    if (b.sharedLeagueCount !== a.sharedLeagueCount) {
      return b.sharedLeagueCount - a.sharedLeagueCount;
    }
    return a.teamName.localeCompare(b.teamName);
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/services/friends.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/friends.ts src/services/friends.test.ts
git commit -m "feat: add getTournamentFriends service"
```

---

## Task 4: Create matchups service with types

**Files:**
- Create: `src/services/matchups.ts`
- Create: `src/services/matchups.test.ts`

**Step 1: Write the failing test for buildMatchupsForRound**

Create `src/services/matchups.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tournament, Round, Match, Participant } from '@/types/tournament';
import {
  getTournamentMatchups,
  MatchupOptions,
  MatchupResult,
} from './matchups';

// Mock friends service
vi.mock('./friends', () => ({
  getTournamentFriends: vi.fn(),
}));

import { getTournamentFriends } from './friends';

describe('getTournamentMatchups', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Alice', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Bob', seed: 2 },
    { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Charlie', seed: 3 },
    { fplTeamId: 4, fplTeamName: 'Team D', managerName: 'Diana', seed: 4 },
  ];

  const mockRounds: Round[] = [
    {
      roundNumber: 1,
      name: 'Round 1',
      gameweek: 20,
      isComplete: true,
      matches: [
        {
          id: 'm1',
          players: [
            { fplTeamId: 1, seed: 1, score: 60 },
            { fplTeamId: 2, seed: 2, score: 55 },
          ],
          winnerId: 1,
          isBye: false,
        },
        {
          id: 'm2',
          players: [
            { fplTeamId: 3, seed: 3, score: 70 },
            { fplTeamId: 4, seed: 4, score: 65 },
          ],
          winnerId: 3,
          isBye: false,
        },
      ],
    },
    {
      roundNumber: 2,
      name: 'Final',
      gameweek: 21,
      isComplete: false,
      matches: [
        {
          id: 'm3',
          players: [
            { fplTeamId: 1, seed: 1, score: 45 },
            { fplTeamId: 3, seed: 3, score: 50 },
          ],
          winnerId: null,
          isBye: false,
        },
      ],
    },
  ];

  const mockTournament: Tournament = {
    id: 'tournament-1',
    fplLeagueId: 100,
    fplLeagueName: 'Test League',
    creatorUserId: 'user-1',
    startGameweek: 20,
    currentRound: 2,
    currentGameweek: 21,
    totalRounds: 2,
    status: 'active',
    participants: mockParticipants,
    rounds: mockRounds,
    winnerId: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns matchups for a specific round', async () => {
    const matchups = await getTournamentMatchups(mockTournament, { round: 1 });

    // Round 1 has 2 matches with 2 players each = 4 matchup results
    expect(matchups).toHaveLength(4);

    // All should be 'finished' since round is complete
    expect(matchups.every((m) => m.matchStatus === 'finished')).toBe(true);
  });

  it('returns latest matchups when no round specified', async () => {
    const matchups = await getTournamentMatchups(mockTournament);

    // Each participant's latest match
    // Team A: Final (round 2)
    // Team B: Round 1 (eliminated)
    // Team C: Final (round 2)
    // Team D: Round 1 (eliminated)
    expect(matchups).toHaveLength(4);

    // Verify Team A is in Final
    const teamA = matchups.find((m) => m.participant.fplTeamId === 1);
    expect(teamA?.round?.roundNumber).toBe(2);

    // Verify Team B is in Round 1 (eliminated there)
    const teamB = matchups.find((m) => m.participant.fplTeamId === 2);
    expect(teamB?.round?.roundNumber).toBe(1);
  });

  it('enriches with friend data when userFplTeamId provided', async () => {
    vi.mocked(getTournamentFriends).mockResolvedValue([
      {
        fplTeamId: 2,
        teamName: 'Team B',
        managerName: 'Bob',
        sharedLeagueCount: 2,
        sharedLeagueNames: ['Work', 'Draft'],
        status: 'in',
        seed: 2,
      },
    ]);

    const matchups = await getTournamentMatchups(mockTournament, {
      round: 1,
      userFplTeamId: 1,
      tournamentLeagueId: 100,
    });

    const teamB = matchups.find((m) => m.participant.fplTeamId === 2);
    expect(teamB?.isFriend).toBe(true);
    expect(teamB?.sharedLeagueCount).toBe(2);

    const teamA = matchups.find((m) => m.participant.fplTeamId === 1);
    expect(teamA?.isFriend).toBe(false);
  });

  it('filters to friends only when friendsOnly is true', async () => {
    vi.mocked(getTournamentFriends).mockResolvedValue([
      {
        fplTeamId: 2,
        teamName: 'Team B',
        managerName: 'Bob',
        sharedLeagueCount: 1,
        sharedLeagueNames: ['Work'],
        status: 'in',
        seed: 2,
      },
    ]);

    const matchups = await getTournamentMatchups(mockTournament, {
      round: 1,
      friendsOnly: true,
      userFplTeamId: 1,
      tournamentLeagueId: 100,
    });

    // Only Bob is a friend
    expect(matchups).toHaveLength(1);
    expect(matchups[0].participant.fplTeamId).toBe(2);
  });

  it('returns correct match statuses', async () => {
    const matchups = await getTournamentMatchups(mockTournament, { round: 2 });

    // Round 2 is not complete and gameweek matches current = live
    expect(matchups[0].matchStatus).toBe('live');

    const r1Matchups = await getTournamentMatchups(mockTournament, { round: 1 });
    expect(r1Matchups[0].matchStatus).toBe('finished');
  });

  it('returns correct match results', async () => {
    const matchups = await getTournamentMatchups(mockTournament, { round: 1 });

    const winner = matchups.find((m) => m.participant.fplTeamId === 1);
    expect(winner?.result).toBe('won');

    const loser = matchups.find((m) => m.participant.fplTeamId === 2);
    expect(loser?.result).toBe('lost');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/services/matchups.test.ts`
Expected: FAIL with "Cannot find module './matchups'"

**Step 3: Create matchups.ts**

Create `src/services/matchups.ts`:

```typescript
// src/services/matchups.ts
import { getTournamentFriends, FriendInTournament } from './friends';
import type { Tournament, Match, Round, Participant } from '@/types/tournament';
import { getMatchPlayers } from '@/types/tournament';

export interface MatchupOptions {
  round?: number; // undefined = latest match per participant
  friendsOnly?: boolean; // filter to just friends
  userFplTeamId?: number; // required if friendsOnly or for isFriend flag
  tournamentLeagueId?: number; // required if friendsOnly
}

export interface MatchupResult {
  participant: Participant;
  match: Match | null;
  round: Round | null;
  opponent: Participant | null;
  matchStatus: 'live' | 'upcoming' | 'finished' | 'eliminated';
  result?: 'winning' | 'losing' | 'tied' | 'won' | 'lost';
  isFriend?: boolean; // Always included if userFplTeamId provided
  sharedLeagueCount?: number;
}

/**
 * Get matchups for a tournament with optional filtering.
 *
 * Usage examples:
 * - Overview: friends' latest matches
 *   getTournamentMatchups(tournament, { friendsOnly: true, userFplTeamId, tournamentLeagueId })
 *
 * - Matches tab: all matches in round 3
 *   getTournamentMatchups(tournament, { round: 3 })
 *
 * - Matches tab: all matches with friend highlighting
 *   getTournamentMatchups(tournament, { round: 3, userFplTeamId, tournamentLeagueId })
 */
export async function getTournamentMatchups(
  tournament: Tournament,
  options: MatchupOptions = {}
): Promise<MatchupResult[]> {
  const { round, friendsOnly, userFplTeamId, tournamentLeagueId } = options;

  // 1. Get friends if needed for enrichment or filtering
  let friendIds: Set<number> | null = null;
  let friendsMap: Map<number, FriendInTournament> | null = null;

  if (userFplTeamId && tournamentLeagueId) {
    const friends = await getTournamentFriends(
      tournament.id,
      tournament.fplLeagueId,
      userFplTeamId,
      tournament.participants
    );
    friendIds = new Set(friends.map((f) => f.fplTeamId));
    friendsMap = new Map(friends.map((f) => [f.fplTeamId, f]));
  }

  // 2. Build matchups
  let matchups: MatchupResult[];

  if (round !== undefined) {
    matchups = buildMatchupsForRound(tournament, round);
  } else {
    matchups = buildLatestMatchups(tournament);
  }

  // 3. Enrich with friend data
  if (friendsMap) {
    matchups = matchups.map((m) => ({
      ...m,
      isFriend: friendIds!.has(m.participant.fplTeamId),
      sharedLeagueCount: friendsMap!.get(m.participant.fplTeamId)?.sharedLeagueCount,
    }));
  }

  // 4. Filter if friendsOnly
  if (friendsOnly && friendIds) {
    matchups = matchups.filter((m) => friendIds!.has(m.participant.fplTeamId));
  }

  return matchups;
}

function buildMatchupsForRound(tournament: Tournament, roundNum: number): MatchupResult[] {
  const round = tournament.rounds.find((r) => r.roundNumber === roundNum);
  if (!round) return [];

  const results: MatchupResult[] = [];
  const participantMap = new Map(tournament.participants.map((p) => [p.fplTeamId, p]));

  for (const match of round.matches) {
    const players = getMatchPlayers(match);

    for (const player of players) {
      const participant = participantMap.get(player.fplTeamId);
      if (!participant) continue;

      const opponents = players.filter((p) => p.fplTeamId !== player.fplTeamId);
      const opponent = opponents[0] ? participantMap.get(opponents[0].fplTeamId) : null;

      const matchStatus = getMatchStatus(round, tournament.currentGameweek);
      const result = getMatchResult(match, player.fplTeamId, round.isComplete);

      results.push({
        participant,
        match,
        round,
        opponent: opponent ?? null,
        matchStatus,
        result,
      });
    }
  }

  return results;
}

function buildLatestMatchups(tournament: Tournament): MatchupResult[] {
  const results: MatchupResult[] = [];
  const seen = new Set<number>();

  // Iterate rounds in reverse to find each participant's latest match
  for (let i = tournament.rounds.length - 1; i >= 0; i--) {
    const round = tournament.rounds[i];
    const roundMatchups = buildMatchupsForRound(tournament, round.roundNumber);

    for (const matchup of roundMatchups) {
      if (!seen.has(matchup.participant.fplTeamId)) {
        seen.add(matchup.participant.fplTeamId);
        results.push(matchup);
      }
    }
  }

  return results;
}

function getMatchStatus(
  round: Round,
  currentGameweek: number
): 'live' | 'upcoming' | 'finished' | 'eliminated' {
  if (round.isComplete) return 'finished';
  if (round.gameweek <= currentGameweek) return 'live';
  return 'upcoming';
}

function getMatchResult(
  match: Match,
  fplTeamId: number,
  isComplete: boolean
): 'winning' | 'losing' | 'tied' | 'won' | 'lost' | undefined {
  const players = getMatchPlayers(match);
  const player = players.find((p) => p.fplTeamId === fplTeamId);
  const opponent = players.find((p) => p.fplTeamId !== fplTeamId);

  if (!player || player.score === null) return undefined;
  if (!opponent || opponent.score === null) return undefined;

  const diff = player.score - opponent.score;

  if (isComplete) {
    return match.winnerId === fplTeamId ? 'won' : 'lost';
  }

  if (diff > 0) return 'winning';
  if (diff < 0) return 'losing';
  return 'tied';
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/services/matchups.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/matchups.ts src/services/matchups.test.ts
git commit -m "feat: add getTournamentMatchups service with composable filters"
```

---

## Task 5: Create useTournamentFriends hook

**Files:**
- Create: `src/hooks/useTournamentFriends.ts`

**Step 1: Create the hook**

Create `src/hooks/useTournamentFriends.ts`:

```typescript
// src/hooks/useTournamentFriends.ts
import { useState, useEffect, useMemo } from 'react';
import { getTournamentFriends, FriendInTournament } from '@/services/friends';
import type { Participant } from '@/types/tournament';

interface UseTournamentFriendsOptions {
  tournamentId: string;
  tournamentLeagueId: number;
  userFplTeamId: number | null | undefined;
  participants: Participant[];
  enabled?: boolean;
}

interface UseTournamentFriendsResult {
  friends: FriendInTournament[] | null;
  friendIds: Set<number>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and cache tournament friends.
 * Returns both the full friends array and a Set of friend IDs for efficient lookup.
 */
export function useTournamentFriends({
  tournamentId,
  tournamentLeagueId,
  userFplTeamId,
  participants,
  enabled = true,
}: UseTournamentFriendsOptions): UseTournamentFriendsResult {
  const [friends, setFriends] = useState<FriendInTournament[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !userFplTeamId || !tournamentId || participants.length === 0) {
      setFriends(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getTournamentFriends(tournamentId, tournamentLeagueId, userFplTeamId, participants)
      .then((result) => {
        if (!cancelled) {
          setFriends(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to fetch tournament friends:', err);
          setError(err);
          setFriends(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tournamentId, tournamentLeagueId, userFplTeamId, participants, enabled]);

  const friendIds = useMemo(
    () => new Set(friends?.map((f) => f.fplTeamId) ?? []),
    [friends]
  );

  return { friends, friendIds, isLoading, error };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useTournamentFriends.ts
git commit -m "feat: add useTournamentFriends hook"
```

---

## Task 6: Create FriendsActivity component

**Files:**
- Create: `src/components/tournament/FriendsActivity.tsx`

**Step 1: Create the component**

Create `src/components/tournament/FriendsActivity.tsx`:

```typescript
// src/components/tournament/FriendsActivity.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { FriendInTournament } from '@/services/friends';

interface FriendsActivityProps {
  friends: FriendInTournament[] | null;
  isLoading?: boolean;
  maxDisplay?: number;
}

/**
 * Friends Activity section for the Overview tab.
 * Shows friends in the tournament and their shared league connections.
 */
export function FriendsActivity({
  friends,
  isLoading = false,
  maxDisplay = 5,
}: FriendsActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No friends found in this tournament. Friends are managers you share other mini-leagues with.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedFriends = friends.slice(0, maxDisplay);
  const remainingCount = friends.length - maxDisplay;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Friends Activity
          <Badge variant="secondary" className="ml-auto">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedFriends.map((friend) => (
          <div
            key={friend.fplTeamId}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{friend.teamName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {friend.managerName} • Seed #{friend.seed}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-4">
              <Badge
                variant={friend.status === 'in' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {friend.status === 'in' ? 'Active' : `Out R${friend.eliminatedRound}`}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {friend.sharedLeagueCount} shared league{friend.sharedLeagueCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            +{remainingCount} more friend{remainingCount !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/tournament/FriendsActivity.tsx
git commit -m "feat: add FriendsActivity component for Overview tab"
```

---

## Task 7: Integrate FriendsActivity into OverviewTab

**Files:**
- Modify: `src/components/tournament/tabs/OverviewTab.tsx`

**Step 1: Update imports**

Add these imports at the top of OverviewTab.tsx:

```typescript
import { FriendsActivity } from '../FriendsActivity';
import type { FriendInTournament } from '@/services/friends';
```

**Step 2: Update props interface**

Update the OverviewTabProps interface:

```typescript
interface OverviewTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  userParticipant?: Participant | null;
  userMatches?: MatchSummaryCardProps[];
  friends?: FriendInTournament[] | null;
  friendsLoading?: boolean;
}
```

**Step 3: Update function signature**

Update the function to accept new props:

```typescript
export function OverviewTab({
  tournament,
  userFplTeamId,
  userParticipant,
  userMatches = [],
  friends = null,
  friendsLoading = false,
}: OverviewTabProps) {
```

**Step 4: Replace Friends placeholder with FriendsActivity**

Find and replace the Friends Activity placeholder card:

```typescript
{/* Friends Activity placeholder - 2/3 width */}
<div className="lg:col-span-2">
  <Card>
    <CardHeader>
      <CardTitle>Friends Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Coming in Phase 4...</p>
    </CardContent>
  </Card>
</div>
```

Replace with:

```typescript
{/* Friends Activity - 2/3 width */}
<div className="lg:col-span-2">
  <FriendsActivity friends={friends} isLoading={friendsLoading} />
</div>
```

**Step 5: Run the app and verify**

Run: `npm run dev`
Expected: Overview tab shows FriendsActivity component (empty state if no friends data yet)

**Step 6: Commit**

```bash
git add src/components/tournament/tabs/OverviewTab.tsx
git commit -m "feat: integrate FriendsActivity into OverviewTab"
```

---

## Task 8: Wire up useTournamentFriends in TournamentView

**Files:**
- Modify: `src/components/tournament/TournamentView.tsx`

**Step 1: Add import**

Add at top of TournamentView.tsx:

```typescript
import { useTournamentFriends } from '@/hooks/useTournamentFriends';
```

**Step 2: Add hook call after userParticipant**

Add after the `userParticipant` useMemo:

```typescript
// Fetch friends for the tournament
const { friends, friendIds, isLoading: friendsLoading } = useTournamentFriends({
  tournamentId: tournament.id,
  tournamentLeagueId: tournament.fplLeagueId,
  userFplTeamId: userFplTeamId ?? null,
  participants: tournament.participants,
  enabled: !!userFplTeamId,
});
```

**Step 3: Pass friends to OverviewTab**

Update the OverviewTab component call:

```typescript
<OverviewTab
  tournament={tournament}
  userFplTeamId={userFplTeamId}
  userParticipant={userParticipant}
  userMatches={userMatches}
  friends={friends}
  friendsLoading={friendsLoading}
/>
```

**Step 4: Run the app and verify end-to-end**

Run: `npm run dev`
Expected:
- Navigate to a tournament
- If user has FPL team linked, friends should load
- FriendsActivity shows loading state, then friends or empty state

**Step 5: Commit**

```bash
git add src/components/tournament/TournamentView.tsx
git commit -m "feat: wire up useTournamentFriends hook in TournamentView"
```

---

## Task 9: Add friend indicator to ParticipantsTab

**Files:**
- Modify: `src/components/tournament/tabs/ParticipantsTab.tsx`

**Step 1: Update props interface**

Add friendIds prop:

```typescript
interface ParticipantsTabProps {
  participants: Participant[];
  seedingGameweek: number;
  friendIds?: Set<number>;
}
```

**Step 2: Update function signature**

```typescript
export function ParticipantsTab({
  participants,
  seedingGameweek,
  friendIds = new Set(),
}: ParticipantsTabProps) {
```

**Step 3: Add friend indicator in table row**

Find where participant name is rendered and add friend badge:

```typescript
<TableCell>
  <div className="flex items-center gap-2">
    <span>{participant.fplTeamName}</span>
    {friendIds.has(participant.fplTeamId) && (
      <Badge variant="outline" className="text-xs">
        Friend
      </Badge>
    )}
  </div>
</TableCell>
```

**Step 4: Import Badge if not already imported**

```typescript
import { Badge } from '@/components/ui/badge';
```

**Step 5: Update TournamentView to pass friendIds**

In TournamentView.tsx, update the ParticipantsTab call:

```typescript
<ParticipantsTab
  participants={tournament.participants}
  seedingGameweek={tournament.startGameweek - 1}
  friendIds={friendIds}
/>
```

**Step 6: Commit**

```bash
git add src/components/tournament/tabs/ParticipantsTab.tsx src/components/tournament/TournamentView.tsx
git commit -m "feat: add friend indicator to ParticipantsTab"
```

---

## Task 10: Run all tests and verify

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 2: Run linting**

Run: `npm run lint`
Expected: No errors

**Step 3: Build check**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Manual E2E verification**

Run: `npm run dev`
Verify:
- [ ] Navigate to tournament with linked FPL team
- [ ] Overview tab shows FriendsActivity (loading → content/empty)
- [ ] Participants tab shows "Friend" badges next to friends
- [ ] Console has no errors

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete friends service Phase 4 implementation"
```

---

## Summary

This plan implements the Friends Service with:

1. **DataConnect Query** - GetParticipantLeaguesForTournament
2. **Tournament Service** - getParticipantLeaguesForTournament wrapper
3. **Friends Service** - getTournamentFriends with full test coverage
4. **Matchups Service** - getTournamentMatchups with composable filters
5. **Hook** - useTournamentFriends for React integration
6. **UI Components** - FriendsActivity component
7. **Integration** - OverviewTab and ParticipantsTab friend indicators

All tasks follow TDD with complete test coverage.
