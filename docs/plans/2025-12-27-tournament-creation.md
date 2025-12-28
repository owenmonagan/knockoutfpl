# Tournament Creation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cloud Function that creates knockout tournaments from FPL classic leagues with full bracket generation.

**Architecture:** Single `onCall` Cloud Function fetches FPL league standings, generates bracket structure (seeding, byes, match links), and writes to PostgreSQL via Data Connect mutations. Pure bracket math extracted to testable module.

**Tech Stack:** Firebase Cloud Functions v2, Data Connect GraphQL mutations, Vitest for testing

---

## Task 1: Add FPL League Standings Fetcher

**Files:**
- Modify: `functions/src/fplApi.ts`
- Modify: `functions/src/fplApi.test.ts`

**Step 1: Write the failing test**

Add to `functions/src/fplApi.test.ts`:

```typescript
describe('fetchFPLLeagueStandings', () => {
  it('fetches league standings from FPL API', async () => {
    const mockResponse = {
      league: { id: 12345, name: 'Test League' },
      standings: {
        results: [
          { entry: 100, entry_name: 'Team A', player_name: 'Player A', rank: 1, total: 500 },
          { entry: 101, entry_name: 'Team B', player_name: 'Player B', rank: 2, total: 450 },
        ]
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await fetchFPLLeagueStandings(12345);

    expect(fetch).toHaveBeenCalledWith(
      'https://fantasy.premierleague.com/api/leagues-classic/12345/standings/'
    );
    expect(result.league.name).toBe('Test League');
    expect(result.standings.results).toHaveLength(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run -t "fetchFPLLeagueStandings"`
Expected: FAIL with "fetchFPLLeagueStandings is not defined"

**Step 3: Write minimal implementation**

Add to `functions/src/fplApi.ts`:

```typescript
export async function fetchFPLLeagueStandings(leagueId: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/leagues-classic/${leagueId}/standings/`);
  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }
  const data = await response.json();
  return data;
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run -t "fetchFPLLeagueStandings"`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/fplApi.ts functions/src/fplApi.test.ts
git commit -m "feat(functions): add fetchFPLLeagueStandings"
```

---

## Task 2: Create Bracket Generator - Core Math

**Files:**
- Create: `functions/src/bracketGenerator.ts`
- Create: `functions/src/bracketGenerator.test.ts`

**Step 1: Write failing tests for bracket math**

Create `functions/src/bracketGenerator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateBracketSize,
  calculateTotalRounds,
  calculateByeCount,
  getMatchCountForRound,
} from './bracketGenerator';

describe('bracketGenerator', () => {
  describe('calculateBracketSize', () => {
    it('returns next power of 2', () => {
      expect(calculateBracketSize(4)).toBe(4);
      expect(calculateBracketSize(5)).toBe(8);
      expect(calculateBracketSize(8)).toBe(8);
      expect(calculateBracketSize(12)).toBe(16);
      expect(calculateBracketSize(50)).toBe(64);
    });
  });

  describe('calculateTotalRounds', () => {
    it('returns log2 of bracket size', () => {
      expect(calculateTotalRounds(4)).toBe(2);
      expect(calculateTotalRounds(8)).toBe(3);
      expect(calculateTotalRounds(16)).toBe(4);
      expect(calculateTotalRounds(32)).toBe(5);
      expect(calculateTotalRounds(64)).toBe(6);
    });
  });

  describe('calculateByeCount', () => {
    it('returns difference between bracket size and participants', () => {
      expect(calculateByeCount(8, 8)).toBe(0);
      expect(calculateByeCount(8, 6)).toBe(2);
      expect(calculateByeCount(16, 12)).toBe(4);
      expect(calculateByeCount(64, 50)).toBe(14);
    });
  });

  describe('getMatchCountForRound', () => {
    it('returns correct match count per round', () => {
      // 16-bracket
      expect(getMatchCountForRound(16, 1)).toBe(8);
      expect(getMatchCountForRound(16, 2)).toBe(4);
      expect(getMatchCountForRound(16, 3)).toBe(2);
      expect(getMatchCountForRound(16, 4)).toBe(1);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- --run bracketGenerator`
Expected: FAIL with "Cannot find module './bracketGenerator'"

**Step 3: Write minimal implementation**

Create `functions/src/bracketGenerator.ts`:

```typescript
/**
 * Calculate the bracket size (next power of 2)
 */
export function calculateBracketSize(participantCount: number): number {
  return Math.pow(2, Math.ceil(Math.log2(participantCount)));
}

/**
 * Calculate total rounds needed
 */
export function calculateTotalRounds(bracketSize: number): number {
  return Math.log2(bracketSize);
}

/**
 * Calculate how many byes are needed
 */
export function calculateByeCount(bracketSize: number, participantCount: number): number {
  return bracketSize - participantCount;
}

/**
 * Get number of matches in a specific round
 */
export function getMatchCountForRound(bracketSize: number, roundNumber: number): number {
  return bracketSize / Math.pow(2, roundNumber);
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- --run bracketGenerator`
Expected: PASS (4 test suites)

**Step 5: Commit**

```bash
git add functions/src/bracketGenerator.ts functions/src/bracketGenerator.test.ts
git commit -m "feat(functions): add bracket math utilities"
```

---

## Task 3: Bracket Generator - Seeding Logic

**Files:**
- Modify: `functions/src/bracketGenerator.ts`
- Modify: `functions/src/bracketGenerator.test.ts`

**Step 1: Write failing tests for seeding**

Add to `functions/src/bracketGenerator.test.ts`:

```typescript
import {
  // ... existing imports
  generateSeedPairings,
} from './bracketGenerator';

describe('generateSeedPairings', () => {
  it('generates standard bracket pairings for 8 seeds', () => {
    const pairings = generateSeedPairings(8);
    // Standard bracket: 1v8, 4v5, 2v7, 3v6
    expect(pairings).toEqual([
      { position: 1, seed1: 1, seed2: 8 },
      { position: 2, seed1: 4, seed2: 5 },
      { position: 3, seed1: 2, seed2: 7 },
      { position: 4, seed1: 3, seed2: 6 },
    ]);
  });

  it('generates standard bracket pairings for 16 seeds', () => {
    const pairings = generateSeedPairings(16);
    expect(pairings).toHaveLength(8);
    // First match: 1 vs 16
    expect(pairings[0]).toEqual({ position: 1, seed1: 1, seed2: 16 });
    // Last match: 8 vs 9
    expect(pairings[7]).toEqual({ position: 8, seed1: 8, seed2: 9 });
  });

  it('generates pairings for 4 seeds', () => {
    const pairings = generateSeedPairings(4);
    expect(pairings).toEqual([
      { position: 1, seed1: 1, seed2: 4 },
      { position: 2, seed1: 2, seed2: 3 },
    ]);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- --run -t "generateSeedPairings"`
Expected: FAIL with "generateSeedPairings is not defined"

**Step 3: Write implementation**

Add to `functions/src/bracketGenerator.ts`:

```typescript
export interface SeedPairing {
  position: number;  // 1-indexed position in round 1
  seed1: number;     // Higher seed (slot 1)
  seed2: number;     // Lower seed (slot 2)
}

/**
 * Generate standard bracket seed pairings.
 * Uses recursive algorithm: in each region, top seed plays bottom seed.
 * Result: 1v16, 8v9, 4v13, 5v12, 2v15, 7v10, 3v14, 6v11 (for 16)
 */
export function generateSeedPairings(bracketSize: number): SeedPairing[] {
  const pairings: SeedPairing[] = [];
  const matchCount = bracketSize / 2;

  // Generate seed order using recursive splitting
  const seedOrder = generateSeedOrder(bracketSize);

  for (let i = 0; i < matchCount; i++) {
    const seed1 = seedOrder[i * 2];
    const seed2 = seedOrder[i * 2 + 1];
    pairings.push({
      position: i + 1,
      seed1: Math.min(seed1, seed2),
      seed2: Math.max(seed1, seed2),
    });
  }

  return pairings;
}

/**
 * Generate seed order for standard bracket.
 * For 8: [1,8,4,5,2,7,3,6] - ensures 1v8 winner meets 4v5 winner, etc.
 */
function generateSeedOrder(bracketSize: number): number[] {
  if (bracketSize === 2) {
    return [1, 2];
  }

  const halfSize = bracketSize / 2;
  const topHalf = generateSeedOrder(halfSize);
  const bottomHalf = topHalf.map(seed => bracketSize + 1 - seed);

  // Interleave: [top[0], bottom[0], top[1], bottom[1], ...]
  const result: number[] = [];
  for (let i = 0; i < halfSize; i++) {
    result.push(topHalf[i], bottomHalf[i]);
  }

  return result;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- --run -t "generateSeedPairings"`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/bracketGenerator.ts functions/src/bracketGenerator.test.ts
git commit -m "feat(functions): add standard bracket seeding"
```

---

## Task 4: Bracket Generator - Match Structure

**Files:**
- Modify: `functions/src/bracketGenerator.ts`
- Modify: `functions/src/bracketGenerator.test.ts`

**Step 1: Write failing tests for match generation**

Add to `functions/src/bracketGenerator.test.ts`:

```typescript
import {
  // ... existing imports
  generateBracketStructure,
  BracketMatch,
} from './bracketGenerator';

describe('generateBracketStructure', () => {
  it('generates all matches with correct qualifies_to links for 8 participants', () => {
    const matches = generateBracketStructure(8);

    // 8 participants = 7 matches total (4 + 2 + 1)
    expect(matches).toHaveLength(7);

    // Round 1: matches 1-4
    expect(matches.filter(m => m.roundNumber === 1)).toHaveLength(4);
    // Round 2: matches 5-6
    expect(matches.filter(m => m.roundNumber === 2)).toHaveLength(2);
    // Round 3 (final): match 7
    expect(matches.filter(m => m.roundNumber === 3)).toHaveLength(1);

    // Check qualifies_to links
    // Match 1 (R1, pos 1) -> Match 5 (R2, pos 1)
    expect(matches[0].qualifiesToMatchId).toBe(5);
    // Match 2 (R1, pos 2) -> Match 5 (R2, pos 1)
    expect(matches[1].qualifiesToMatchId).toBe(5);
    // Match 3 (R1, pos 3) -> Match 6 (R2, pos 2)
    expect(matches[2].qualifiesToMatchId).toBe(6);
    // Match 4 (R1, pos 4) -> Match 6 (R2, pos 2)
    expect(matches[3].qualifiesToMatchId).toBe(6);

    // Final has no qualifies_to
    expect(matches[6].qualifiesToMatchId).toBeNull();
  });

  it('generates correct structure for 16 participants', () => {
    const matches = generateBracketStructure(16);

    // 16 participants = 15 matches (8 + 4 + 2 + 1)
    expect(matches).toHaveLength(15);

    // Verify round distribution
    expect(matches.filter(m => m.roundNumber === 1)).toHaveLength(8);
    expect(matches.filter(m => m.roundNumber === 2)).toHaveLength(4);
    expect(matches.filter(m => m.roundNumber === 3)).toHaveLength(2);
    expect(matches.filter(m => m.roundNumber === 4)).toHaveLength(1);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- --run -t "generateBracketStructure"`
Expected: FAIL

**Step 3: Write implementation**

Add to `functions/src/bracketGenerator.ts`:

```typescript
export interface BracketMatch {
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
}

/**
 * Generate all matches for a bracket with qualifies_to links.
 */
export function generateBracketStructure(bracketSize: number): BracketMatch[] {
  const totalRounds = calculateTotalRounds(bracketSize);
  const matches: BracketMatch[] = [];
  let matchId = 1;

  // Track first match ID of each round for linking
  const roundStartIds: number[] = [];

  // Create matches for each round
  for (let round = 1; round <= totalRounds; round++) {
    roundStartIds[round] = matchId;
    const matchCount = getMatchCountForRound(bracketSize, round);

    for (let pos = 1; pos <= matchCount; pos++) {
      matches.push({
        matchId,
        roundNumber: round,
        positionInRound: pos,
        qualifiesToMatchId: null, // Will be set after all matches created
      });
      matchId++;
    }
  }

  // Set qualifies_to links
  for (const match of matches) {
    if (match.roundNumber < totalRounds) {
      const nextRoundStart = roundStartIds[match.roundNumber + 1];
      const nextPosition = Math.ceil(match.positionInRound / 2);
      match.qualifiesToMatchId = nextRoundStart + nextPosition - 1;
    }
  }

  return matches;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- --run -t "generateBracketStructure"`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/bracketGenerator.ts functions/src/bracketGenerator.test.ts
git commit -m "feat(functions): add bracket structure generation"
```

---

## Task 5: Bracket Generator - Bye Assignment

**Files:**
- Modify: `functions/src/bracketGenerator.ts`
- Modify: `functions/src/bracketGenerator.test.ts`

**Step 1: Write failing tests for bye detection**

Add to `functions/src/bracketGenerator.test.ts`:

```typescript
import {
  // ... existing imports
  assignParticipantsToMatches,
  MatchAssignment,
} from './bracketGenerator';

describe('assignParticipantsToMatches', () => {
  it('assigns 8 participants to 8-bracket with no byes', () => {
    const assignments = assignParticipantsToMatches(8, 8);

    // All matches have 2 players
    expect(assignments.every(a => a.isBye === false)).toBe(true);
    expect(assignments.filter(a => a.seed2 !== null)).toHaveLength(4);
  });

  it('assigns 6 participants to 8-bracket with 2 byes', () => {
    const assignments = assignParticipantsToMatches(8, 6);

    // Seeds 1 and 2 get byes
    const byeMatches = assignments.filter(a => a.isBye);
    expect(byeMatches).toHaveLength(2);

    // Bye matches have only seed1 (top seed)
    expect(byeMatches.every(a => a.seed2 === null)).toBe(true);
    expect(byeMatches.map(a => a.seed1).sort((a,b) => a-b)).toEqual([1, 2]);
  });

  it('assigns 12 participants to 16-bracket with 4 byes', () => {
    const assignments = assignParticipantsToMatches(16, 12);

    const byeMatches = assignments.filter(a => a.isBye);
    expect(byeMatches).toHaveLength(4);

    // Top 4 seeds get byes
    expect(byeMatches.map(a => a.seed1).sort((a,b) => a-b)).toEqual([1, 2, 3, 4]);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- --run -t "assignParticipantsToMatches"`
Expected: FAIL

**Step 3: Write implementation**

Add to `functions/src/bracketGenerator.ts`:

```typescript
export interface MatchAssignment {
  position: number;
  seed1: number;
  seed2: number | null;  // null if bye
  isBye: boolean;
}

/**
 * Assign participants to round 1 matches, handling byes.
 * Top seeds get byes when participant count < bracket size.
 */
export function assignParticipantsToMatches(
  bracketSize: number,
  participantCount: number
): MatchAssignment[] {
  const pairings = generateSeedPairings(bracketSize);
  const byeCount = calculateByeCount(bracketSize, participantCount);

  return pairings.map(pairing => {
    // A bye occurs when seed2 would be > participantCount
    const isBye = pairing.seed2 > participantCount;

    return {
      position: pairing.position,
      seed1: pairing.seed1,
      seed2: isBye ? null : pairing.seed2,
      isBye,
    };
  });
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- --run -t "assignParticipantsToMatches"`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/bracketGenerator.ts functions/src/bracketGenerator.test.ts
git commit -m "feat(functions): add bye assignment logic"
```

---

## Task 6: Create Tournament Cloud Function - Setup

**Files:**
- Create: `functions/src/createTournament.ts`
- Create: `functions/src/createTournament.test.ts`

**Step 1: Write failing test for validation**

Create `functions/src/createTournament.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateTournamentRequest } from './createTournament';

describe('createTournament', () => {
  describe('validateTournamentRequest', () => {
    it('throws if fplLeagueId is missing', () => {
      expect(() => validateTournamentRequest({})).toThrow('fplLeagueId is required');
    });

    it('throws if fplLeagueId is not a number', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 'abc' })).toThrow('fplLeagueId must be a number');
    });

    it('passes with valid fplLeagueId', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345 })).not.toThrow();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- --run -t "validateTournamentRequest"`
Expected: FAIL

**Step 3: Write implementation**

Create `functions/src/createTournament.ts`:

```typescript
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { fetchFPLBootstrapData, fetchFPLLeagueStandings } from './fplApi';
import {
  calculateBracketSize,
  calculateTotalRounds,
  generateBracketStructure,
  assignParticipantsToMatches,
} from './bracketGenerator';

export interface CreateTournamentRequest {
  fplLeagueId: number;
}

export interface CreateTournamentResponse {
  tournamentId: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
}

/**
 * Validate the incoming request data
 */
export function validateTournamentRequest(data: any): asserts data is CreateTournamentRequest {
  if (!data.fplLeagueId) {
    throw new HttpsError('invalid-argument', 'fplLeagueId is required');
  }
  if (typeof data.fplLeagueId !== 'number') {
    throw new HttpsError('invalid-argument', 'fplLeagueId must be a number');
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- --run -t "validateTournamentRequest"`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/createTournament.ts functions/src/createTournament.test.ts
git commit -m "feat(functions): add tournament request validation"
```

---

## Task 7: Create Tournament - League Validation

**Files:**
- Modify: `functions/src/createTournament.ts`
- Modify: `functions/src/createTournament.test.ts`

**Step 1: Write failing test**

Add to `functions/src/createTournament.test.ts`:

```typescript
import { validateLeagueStandings } from './createTournament';

describe('validateLeagueStandings', () => {
  it('throws if standings is null', () => {
    expect(() => validateLeagueStandings(null)).toThrow('League not found');
  });

  it('throws if less than 4 participants', () => {
    const standings = { standings: { results: [{}, {}, {}] } };
    expect(() => validateLeagueStandings(standings)).toThrow('at least 4');
  });

  it('throws if more than 50 participants', () => {
    const results = Array(51).fill({});
    const standings = { standings: { results } };
    expect(() => validateLeagueStandings(standings)).toThrow('maximum 50');
  });

  it('passes with valid participant count', () => {
    const results = Array(20).fill({});
    const standings = { standings: { results } };
    expect(() => validateLeagueStandings(standings)).not.toThrow();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd functions && npm test -- --run -t "validateLeagueStandings"`
Expected: FAIL

**Step 3: Write implementation**

Add to `functions/src/createTournament.ts`:

```typescript
/**
 * Validate league standings data
 */
export function validateLeagueStandings(standings: any): void {
  if (!standings || !standings.standings?.results) {
    throw new HttpsError('not-found', 'League not found');
  }

  const count = standings.standings.results.length;

  if (count < 4) {
    throw new HttpsError('failed-precondition', 'League must have at least 4 participants');
  }

  if (count > 50) {
    throw new HttpsError('failed-precondition', 'League exceeds maximum 50 participants');
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npm test -- --run -t "validateLeagueStandings"`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/createTournament.ts functions/src/createTournament.test.ts
git commit -m "feat(functions): add league standings validation"
```

---

## Task 8: Create Tournament - Main Function

**Files:**
- Modify: `functions/src/createTournament.ts`
- Modify: `functions/src/index.ts`

**Step 1: Write the main Cloud Function**

Add to `functions/src/createTournament.ts`:

```typescript
/**
 * Get current gameweek from bootstrap data
 */
export function getCurrentGameweek(bootstrapData: any): number {
  const currentEvent = bootstrapData.events?.find((e: any) => e.is_current);
  if (!currentEvent) {
    throw new HttpsError('failed-precondition', 'Could not determine current gameweek');
  }
  return currentEvent.id;
}

/**
 * Cloud Function to create a knockout tournament
 */
export const createTournament = onCall(async (request: CallableRequest<CreateTournamentRequest>) => {
  // 1. Validate auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in to create a tournament');
  }
  const uid = request.auth.uid;

  // 2. Validate request
  validateTournamentRequest(request.data);
  const { fplLeagueId } = request.data;

  // 3. Fetch FPL data
  const [standings, bootstrapData] = await Promise.all([
    fetchFPLLeagueStandings(fplLeagueId),
    fetchFPLBootstrapData(),
  ]);

  // 4. Validate league
  validateLeagueStandings(standings);

  // 5. Calculate bracket structure
  const participantCount = standings.standings.results.length;
  const bracketSize = calculateBracketSize(participantCount);
  const totalRounds = calculateTotalRounds(bracketSize);
  const currentGW = getCurrentGameweek(bootstrapData);
  const startEvent = currentGW + 1;

  // 6. Generate bracket
  const matches = generateBracketStructure(bracketSize);
  const matchAssignments = assignParticipantsToMatches(bracketSize, participantCount);

  // 7. TODO: Write to database via Data Connect
  // For now, return calculated values
  const tournamentId = crypto.randomUUID();

  console.log('Tournament created:', {
    tournamentId,
    fplLeagueId,
    participantCount,
    bracketSize,
    totalRounds,
    startEvent,
    matchCount: matches.length,
  });

  return {
    tournamentId,
    participantCount,
    totalRounds,
    startEvent,
  };
});
```

**Step 2: Export from index.ts**

Add to `functions/src/index.ts`:

```typescript
// Export tournament creation function
export { createTournament } from './createTournament';
```

**Step 3: Build and verify**

Run: `cd functions && npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add functions/src/createTournament.ts functions/src/index.ts
git commit -m "feat(functions): add createTournament Cloud Function skeleton"
```

---

## Task 9: Add Database Write Logic (Data Connect Integration)

**Files:**
- Modify: `functions/src/createTournament.ts`

**Step 1: Add types for database entities**

Add to `functions/src/createTournament.ts` (after imports):

```typescript
// Database entity types (matching Data Connect schema)
interface TournamentRecord {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
}

interface RoundRecord {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
}

interface ParticipantRecord {
  tournamentId: string;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank: number;
  leaguePoints: number;
  rawJson: string;
}

interface MatchRecord {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  isBye: boolean;
  status: string;
  winnerEntryId?: number;
}

interface MatchPickRecord {
  tournamentId: string;
  matchId: number;
  entryId: number;
  slot: number;
}
```

**Step 2: Create helper to build database records**

Add to `functions/src/createTournament.ts`:

```typescript
/**
 * Build all database records for a tournament
 */
export function buildTournamentRecords(
  tournamentId: string,
  uid: string,
  standings: any,
  bracketSize: number,
  totalRounds: number,
  startEvent: number,
  matches: BracketMatch[],
  matchAssignments: MatchAssignment[]
): {
  tournament: TournamentRecord;
  rounds: RoundRecord[];
  participants: ParticipantRecord[];
  matchRecords: MatchRecord[];
  matchPicks: MatchPickRecord[];
} {
  const leagueData = standings.league;
  const standingsResults = standings.standings.results;

  // Tournament
  const tournament: TournamentRecord = {
    fplLeagueId: leagueData.id,
    fplLeagueName: leagueData.name,
    creatorUid: uid,
    participantCount: standingsResults.length,
    totalRounds,
    startEvent,
    seedingMethod: 'league_rank',
  };

  // Rounds
  const rounds: RoundRecord[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    rounds.push({
      tournamentId,
      roundNumber: r,
      event: startEvent + r - 1,
      status: r === 1 ? 'active' : 'pending',
    });
  }

  // Participants (seed = rank in league)
  const participants: ParticipantRecord[] = standingsResults.map((p: any, index: number) => ({
    tournamentId,
    entryId: p.entry,
    teamName: p.entry_name,
    managerName: p.player_name,
    seed: index + 1,
    leagueRank: p.rank,
    leaguePoints: p.total,
    rawJson: JSON.stringify(p),
  }));

  // Create entry lookup by seed
  const seedToEntry = new Map<number, number>();
  participants.forEach(p => seedToEntry.set(p.seed, p.entryId));

  // Matches
  const matchRecords: MatchRecord[] = matches.map(m => ({
    tournamentId,
    matchId: m.matchId,
    roundNumber: m.roundNumber,
    positionInRound: m.positionInRound,
    qualifiesToMatchId: m.qualifiesToMatchId,
    isBye: false, // Updated below
    status: m.roundNumber === 1 ? 'active' : 'pending',
  }));

  // Match picks (round 1 only)
  const matchPicks: MatchPickRecord[] = [];
  for (const assignment of matchAssignments) {
    const match = matchRecords.find(m => m.roundNumber === 1 && m.positionInRound === assignment.position);
    if (!match) continue;

    // Add slot 1 (higher seed)
    const entry1 = seedToEntry.get(assignment.seed1);
    if (entry1) {
      matchPicks.push({
        tournamentId,
        matchId: match.matchId,
        entryId: entry1,
        slot: 1,
      });
    }

    // Add slot 2 (lower seed) if not a bye
    if (assignment.seed2 !== null) {
      const entry2 = seedToEntry.get(assignment.seed2);
      if (entry2) {
        matchPicks.push({
          tournamentId,
          matchId: match.matchId,
          entryId: entry2,
          slot: 2,
        });
      }
    } else {
      // Mark as bye and set winner
      match.isBye = true;
      match.status = 'complete';
      match.winnerEntryId = entry1;
    }
  }

  return { tournament, rounds, participants, matchRecords, matchPicks };
}
```

**Step 3: Commit**

```bash
git add functions/src/createTournament.ts
git commit -m "feat(functions): add tournament record builder"
```

---

## Task 10: Add Database Write Tests

**Files:**
- Modify: `functions/src/createTournament.test.ts`

**Step 1: Write tests for buildTournamentRecords**

Add to `functions/src/createTournament.test.ts`:

```typescript
import { buildTournamentRecords } from './createTournament';
import { generateBracketStructure, assignParticipantsToMatches, calculateBracketSize, calculateTotalRounds } from './bracketGenerator';

describe('buildTournamentRecords', () => {
  const mockStandings = {
    league: { id: 12345, name: 'Test League' },
    standings: {
      results: [
        { entry: 100, entry_name: 'Team A', player_name: 'Player A', rank: 1, total: 500 },
        { entry: 101, entry_name: 'Team B', player_name: 'Player B', rank: 2, total: 450 },
        { entry: 102, entry_name: 'Team C', player_name: 'Player C', rank: 3, total: 400 },
        { entry: 103, entry_name: 'Team D', player_name: 'Player D', rank: 4, total: 350 },
      ]
    }
  };

  it('builds correct tournament record', () => {
    const bracketSize = calculateBracketSize(4);
    const totalRounds = calculateTotalRounds(bracketSize);
    const matches = generateBracketStructure(bracketSize);
    const assignments = assignParticipantsToMatches(bracketSize, 4);

    const records = buildTournamentRecords(
      'test-uuid',
      'user-123',
      mockStandings,
      bracketSize,
      totalRounds,
      10, // startEvent
      matches,
      assignments
    );

    expect(records.tournament.fplLeagueId).toBe(12345);
    expect(records.tournament.fplLeagueName).toBe('Test League');
    expect(records.tournament.creatorUid).toBe('user-123');
    expect(records.tournament.participantCount).toBe(4);
    expect(records.tournament.totalRounds).toBe(2);
  });

  it('creates correct number of rounds', () => {
    const bracketSize = calculateBracketSize(4);
    const totalRounds = calculateTotalRounds(bracketSize);
    const matches = generateBracketStructure(bracketSize);
    const assignments = assignParticipantsToMatches(bracketSize, 4);

    const records = buildTournamentRecords('test-uuid', 'user-123', mockStandings, bracketSize, totalRounds, 10, matches, assignments);

    expect(records.rounds).toHaveLength(2);
    expect(records.rounds[0].status).toBe('active');
    expect(records.rounds[1].status).toBe('pending');
  });

  it('creates participants with correct seeds', () => {
    const bracketSize = calculateBracketSize(4);
    const totalRounds = calculateTotalRounds(bracketSize);
    const matches = generateBracketStructure(bracketSize);
    const assignments = assignParticipantsToMatches(bracketSize, 4);

    const records = buildTournamentRecords('test-uuid', 'user-123', mockStandings, bracketSize, totalRounds, 10, matches, assignments);

    expect(records.participants).toHaveLength(4);
    expect(records.participants[0].seed).toBe(1);
    expect(records.participants[0].entryId).toBe(100);
    expect(records.participants[3].seed).toBe(4);
  });

  it('creates match picks for round 1', () => {
    const bracketSize = calculateBracketSize(4);
    const totalRounds = calculateTotalRounds(bracketSize);
    const matches = generateBracketStructure(bracketSize);
    const assignments = assignParticipantsToMatches(bracketSize, 4);

    const records = buildTournamentRecords('test-uuid', 'user-123', mockStandings, bracketSize, totalRounds, 10, matches, assignments);

    // 4 participants = 2 matches = 4 match picks
    expect(records.matchPicks).toHaveLength(4);
  });

  it('handles byes correctly', () => {
    // 3 participants in 4-bracket = 1 bye
    const threePlayerStandings = {
      league: { id: 12345, name: 'Test League' },
      standings: {
        results: [
          { entry: 100, entry_name: 'Team A', player_name: 'Player A', rank: 1, total: 500 },
          { entry: 101, entry_name: 'Team B', player_name: 'Player B', rank: 2, total: 450 },
          { entry: 102, entry_name: 'Team C', player_name: 'Player C', rank: 3, total: 400 },
        ]
      }
    };

    const bracketSize = calculateBracketSize(3);
    const totalRounds = calculateTotalRounds(bracketSize);
    const matches = generateBracketStructure(bracketSize);
    const assignments = assignParticipantsToMatches(bracketSize, 3);

    const records = buildTournamentRecords('test-uuid', 'user-123', threePlayerStandings, bracketSize, totalRounds, 10, matches, assignments);

    // One match should be a bye
    const byeMatches = records.matchRecords.filter(m => m.isBye);
    expect(byeMatches).toHaveLength(1);
    expect(byeMatches[0].status).toBe('complete');
    expect(byeMatches[0].winnerEntryId).toBe(100); // Seed 1 gets bye
  });
});
```

**Step 2: Run tests**

Run: `cd functions && npm test -- --run -t "buildTournamentRecords"`
Expected: PASS

**Step 3: Commit**

```bash
git add functions/src/createTournament.test.ts
git commit -m "test(functions): add buildTournamentRecords tests"
```

---

## Task 11: Integrate with Data Connect (Placeholder)

**Files:**
- Modify: `functions/src/createTournament.ts`

**Note:** This task adds placeholder code for Data Connect integration. Actual Data Connect SDK integration will depend on how the generated client is structured.

**Step 1: Add write placeholder**

Update the main function in `functions/src/createTournament.ts`:

```typescript
/**
 * Write tournament records to database
 * TODO: Replace with actual Data Connect SDK calls
 */
async function writeTournamentToDatabase(records: ReturnType<typeof buildTournamentRecords>): Promise<void> {
  // Placeholder - will be replaced with Data Connect mutations
  console.log('Writing tournament:', records.tournament);
  console.log('Writing rounds:', records.rounds.length);
  console.log('Writing participants:', records.participants.length);
  console.log('Writing matches:', records.matchRecords.length);
  console.log('Writing match picks:', records.matchPicks.length);

  // TODO: Call Data Connect mutations:
  // 1. CreateTournament
  // 2. CreateRound (for each round)
  // 3. UpsertEntry (for each participant's entry)
  // 4. CreateParticipant (for each participant)
  // 5. CreateMatch (for each match)
  // 6. CreateMatchPick (for each match pick)
}

// Update the main function to use the builder and writer
export const createTournament = onCall(async (request: CallableRequest<CreateTournamentRequest>) => {
  // ... existing validation code ...

  // 6. Build all records
  const tournamentId = crypto.randomUUID();
  const records = buildTournamentRecords(
    tournamentId,
    uid,
    standings,
    bracketSize,
    totalRounds,
    startEvent,
    matches,
    matchAssignments
  );

  // 7. Write to database
  await writeTournamentToDatabase(records);

  return {
    tournamentId,
    participantCount: records.tournament.participantCount,
    totalRounds: records.tournament.totalRounds,
    startEvent,
  };
});
```

**Step 2: Commit**

```bash
git add functions/src/createTournament.ts
git commit -m "feat(functions): add database write placeholder"
```

---

## Summary

After completing all tasks, you will have:

1. **`functions/src/fplApi.ts`** - FPL API fetcher with league standings endpoint
2. **`functions/src/bracketGenerator.ts`** - Pure functions for bracket math, seeding, and bye logic
3. **`functions/src/createTournament.ts`** - Cloud Function with validation and record building
4. **Full test coverage** for all bracket logic and validation

**Next steps after this plan:**
- Integrate actual Data Connect SDK calls
- Add frontend UI for tournament creation
- Implement round resolution (separate plan)

---

## Related

- [2025-12-27-tournament-creation-design.md](./2025-12-27-tournament-creation-design.md) - Design document
- [../business/technical/data/data-dictionary.md](../business/technical/data/data-dictionary.md) - Database schema
