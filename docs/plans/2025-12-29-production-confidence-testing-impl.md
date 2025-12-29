# Production Confidence Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a daily automated test system that creates tournaments in dev and validates they complete successfully, with Discord alerting for failures.

**Architecture:** Three scheduled Cloud Functions: (1) `createTestTournaments` runs daily at midnight to create 20 test tournaments with random past gameweeks, (2) enhanced `updateBrackets` with catch-up mode to process all pending rounds in one run, (3) `checkStuckTournaments` runs every 6 hours to alert on stuck tournaments.

**Tech Stack:** TypeScript, Firebase Cloud Functions (scheduled), FPL API, Data Connect GraphQL, Discord webhooks

---

## Task 1: Add isTest Field to Tournament Schema

**Files:**
- Modify: `dataconnect/schema/schema.gql`

**Step 1: Add isTest field to Tournament type**

Find the Tournament type (around line 113) and add the `isTest` field after `winnerEntryId`:

```graphql
  winnerEntryId: Int @col(name: "winner_entry_id")
  isTest: Boolean! @col(name: "is_test") @default(value: false)
```

**Step 2: Verify schema compiles**

Run: `cd dataconnect && firebase dataconnect:sql:diff`
Expected: Shows ALTER TABLE adding `is_test` column

**Step 3: Commit**

```bash
git add dataconnect/schema/schema.gql
git commit -m "$(cat <<'EOF'
feat(schema): add isTest flag to Tournament

Enables filtering test tournaments from production queries
and monitoring for stuck test tournaments.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create Discord Webhook Helper

**Files:**
- Create: `functions/src/discord.ts`
- Create: `functions/src/discord.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/discord.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendDiscordAlert } from './discord';

describe('sendDiscordAlert', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send message to Discord webhook', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await sendDiscordAlert('Test message', 'https://discord.com/api/webhooks/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test message' }),
      })
    );
  });

  it('should log error when webhook fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    global.fetch = mockFetch;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await sendDiscordAlert('Test message', 'https://discord.com/api/webhooks/test');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Discord webhook failed'));
    consoleSpy.mockRestore();
  });

  it('should skip when no webhook URL provided', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    await sendDiscordAlert('Test message', '');

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- discord.test.ts`
Expected: FAIL - Cannot find module './discord'

**Step 3: Write minimal implementation**

```typescript
// functions/src/discord.ts
/**
 * Discord Webhook Helper
 *
 * Simple helper for sending alerts to Discord channels via webhooks.
 */

/**
 * Send an alert message to Discord
 */
export async function sendDiscordAlert(message: string, webhookUrl: string): Promise<void> {
  if (!webhookUrl) {
    console.log('[discord] No webhook URL configured, skipping alert');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      console.error(`[discord] Discord webhook failed: ${response.status}`);
    }
  } catch (error) {
    console.error('[discord] Failed to send Discord alert:', error);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- discord.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/discord.ts functions/src/discord.test.ts
git commit -m "$(cat <<'EOF'
feat(functions): add Discord webhook helper

Simple helper for sending alerts to Discord channels.
Handles missing webhook URL gracefully for local dev.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add Query for Active Rounds with Catch-up

**Files:**
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add new query constant for catch-up mode**

Add after `GET_ACTIVE_ROUNDS_QUERY` (around line 220):

```typescript
const GET_PENDING_ACTIVE_ROUNDS_QUERY = `
  query GetPendingActiveRounds($maxEvent: Int!) {
    rounds(where: { event: { le: $maxEvent }, status: { eq: "active" } }, orderBy: { event: ASC }) {
      tournamentId
      roundNumber
      event
      status
      tournament {
        id
        status
        totalRounds
      }
    }
  }
`;
```

**Step 2: Add query function**

Add after `getActiveRoundsForEvent` function (around line 527):

```typescript
/**
 * Get all active rounds for any finished gameweek (catch-up mode)
 * Returns rounds ordered by event ascending (oldest first)
 */
export async function getPendingActiveRounds(maxEvent: number): Promise<ActiveRound[]> {
  const result = await dataConnectAdmin.executeGraphql<{ rounds: ActiveRound[] }, { maxEvent: number }>(
    GET_PENDING_ACTIVE_ROUNDS_QUERY,
    { variables: { maxEvent } }
  );
  return result.data.rounds;
}
```

**Step 3: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add functions/src/dataconnect-mutations.ts
git commit -m "$(cat <<'EOF'
feat(functions): add catch-up query for pending active rounds

Query returns all active rounds for any finished gameweek,
ordered by event ascending (oldest first).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add Query for Stuck Test Tournaments

**Files:**
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add query constant for stuck tournaments**

Add after the new query from Task 3:

```typescript
const GET_STUCK_TEST_TOURNAMENTS_QUERY = `
  query GetStuckTestTournaments($cutoffTime: Timestamp!) {
    tournaments(where: { isTest: { eq: true }, status: { ne: "completed" }, createdAt: { lt: $cutoffTime } }) {
      id
      fplLeagueName
      status
      createdAt
      participantCount
      totalRounds
      currentRound
    }
  }
`;
```

**Step 2: Add interface and function**

```typescript
export interface StuckTournament {
  id: string;
  fplLeagueName: string;
  status: string;
  createdAt: string;
  participantCount: number;
  totalRounds: number;
  currentRound: number;
}

/**
 * Get test tournaments that haven't completed within the timeout period
 */
export async function getStuckTestTournaments(cutoffTime: Date): Promise<StuckTournament[]> {
  const result = await dataConnectAdmin.executeGraphql<{ tournaments: StuckTournament[] }, { cutoffTime: string }>(
    GET_STUCK_TEST_TOURNAMENTS_QUERY,
    { variables: { cutoffTime: cutoffTime.toISOString() } }
  );
  return result.data.tournaments;
}
```

**Step 3: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add functions/src/dataconnect-mutations.ts
git commit -m "$(cat <<'EOF'
feat(functions): add query for stuck test tournaments

Query finds test tournaments that haven't completed
within the expected timeout period (24 hours).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Update Tournament Creation to Support isTest Flag

**Files:**
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Update CREATE_TOURNAMENT_MUTATION**

Find the mutation (around line 67) and add `isTest` parameter:

```typescript
const CREATE_TOURNAMENT_MUTATION = `
  mutation CreateTournament(
    $id: UUID!
    $fplLeagueId: Int!
    $fplLeagueName: String!
    $creatorUid: String!
    $participantCount: Int!
    $totalRounds: Int!
    $startEvent: Int!
    $seedingMethod: String!
    $isTest: Boolean!
  ) {
    tournament_insert(
      data: {
        id: $id
        fplLeagueId: $fplLeagueId
        fplLeagueName: $fplLeagueName
        creatorUid: $creatorUid
        participantCount: $participantCount
        totalRounds: $totalRounds
        startEvent: $startEvent
        seedingMethod: $seedingMethod
        isTest: $isTest
      }
    )
  }
`;
```

**Step 2: Update CreateTournamentInput interface**

Find the interface (around line 351) and add:

```typescript
export interface CreateTournamentInput {
  id: string;
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  isTest?: boolean;  // Add this line
}
```

**Step 3: Update createTournamentAdmin function**

Find the function (around line 460) and update to include isTest with default:

```typescript
export async function createTournamentAdmin(
  input: CreateTournamentInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_TOURNAMENT_MUTATION,
    { variables: { ...input, isTest: input.isTest ?? false } }
  );
}
```

**Step 4: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add functions/src/dataconnect-mutations.ts
git commit -m "$(cat <<'EOF'
feat(functions): support isTest flag in tournament creation

Allows marking tournaments as test tournaments during creation.
Defaults to false for existing code paths.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Enhance updateBrackets with Catch-up Mode

**Files:**
- Modify: `functions/src/updateBrackets.ts`

**Step 1: Import new dependencies**

Update imports at top of file:

```typescript
import {
  getActiveRoundsForEvent,
  getPendingActiveRounds,  // Add this
  getRoundMatches,
  upsertPickAdmin,
  updateMatchWinner,
  updateRoundStatus,
  updateTournamentStatus,
  updateParticipantStatus,
  createMatchPickAdmin,
  ActiveRound,
  RoundMatch,
  AuthClaims,
} from './dataconnect-mutations';
import { fetchCurrentGameweek, fetchScoresForEntries, fetchAllFinishedGameweeks } from './fpl-scores';  // Add fetchAllFinishedGameweeks
import { resolveMatch, getNextRoundSlot, MatchResult } from './match-resolver';
import { sendDiscordAlert } from './discord';  // Add this
```

**Step 2: Add Discord webhook config**

After the SYSTEM_AUTH_CLAIMS constant (around line 36):

```typescript
// Discord webhook URL from environment config
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
```

**Step 3: Replace the main scheduled function**

Replace the entire `export const updateBrackets = onSchedule(...)` block (lines 196-241) with:

```typescript
/**
 * Main scheduled function - runs every 2 hours
 * Enhanced with catch-up mode to process all pending rounds
 */
export const updateBrackets = onSchedule(
  {
    schedule: 'every 2 hours',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[updateBrackets] Starting bracket update check...');

    try {
      // 1. Check current gameweek status
      const currentGW = await fetchCurrentGameweek();

      if (!currentGW) {
        console.log('[updateBrackets] Could not fetch current gameweek');
        return;
      }

      console.log(`[updateBrackets] Current gameweek: ${currentGW.event}, finished: ${currentGW.finished}`);

      // 2. Catch-up mode: find ALL active rounds for finished gameweeks
      // Process rounds where event <= currentGW (not just ==)
      const maxEvent = currentGW.finished ? currentGW.event : currentGW.event - 1;

      if (maxEvent < 1) {
        console.log('[updateBrackets] No finished gameweeks yet, skipping');
        return;
      }

      // 3. Loop to process all pending rounds (max 10 iterations for safety)
      const MAX_ITERATIONS = 10;
      let iteration = 0;
      let totalRoundsProcessed = 0;

      while (iteration < MAX_ITERATIONS) {
        iteration++;
        console.log(`[updateBrackets] Catch-up iteration ${iteration}...`);

        // Find active rounds for any finished gameweek
        const pendingRounds = await getPendingActiveRounds(maxEvent);
        console.log(`[updateBrackets] Found ${pendingRounds.length} pending active rounds`);

        if (pendingRounds.length === 0) {
          console.log('[updateBrackets] No more pending rounds, catch-up complete');
          break;
        }

        // Process each round
        for (const round of pendingRounds) {
          try {
            await processRound(round, round.event);
            totalRoundsProcessed++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[updateBrackets] Error processing round ${round.roundNumber} of ${round.tournamentId}:`, error);

            // Send Discord alert for processing errors
            await sendDiscordAlert(
              `🔴 updateBrackets error: Round ${round.roundNumber} of tournament ${round.tournamentId} failed: ${errorMessage}`,
              DISCORD_WEBHOOK_URL
            );
            // Continue with other rounds
          }
        }
      }

      if (iteration >= MAX_ITERATIONS) {
        console.warn('[updateBrackets] Hit max iterations, may have more rounds to process');
        await sendDiscordAlert(
          `⚠️ updateBrackets hit max iterations (${MAX_ITERATIONS}), may have more rounds pending`,
          DISCORD_WEBHOOK_URL
        );
      }

      console.log(`[updateBrackets] Bracket update complete. Processed ${totalRoundsProcessed} rounds in ${iteration} iterations.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[updateBrackets] Fatal error:', error);
      await sendDiscordAlert(
        `🔴 updateBrackets crashed: ${errorMessage}`,
        DISCORD_WEBHOOK_URL
      );
      throw error; // Re-throw for retry
    }
  }
);
```

**Step 4: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add functions/src/updateBrackets.ts
git commit -m "$(cat <<'EOF'
feat(functions): add catch-up mode to updateBrackets

Enhanced scheduled function to process all pending rounds for
any finished gameweek, not just the current one. Enables test
tournaments with past gameweeks to complete immediately.

Also adds Discord alerting for errors and max iteration warnings.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Create Test Tournament Creator Function

**Files:**
- Create: `functions/src/createTestTournaments.ts`

**Step 1: Create the file**

```typescript
/**
 * Test Tournament Creator
 *
 * Scheduled function that runs daily to create test tournaments
 * for production confidence testing.
 *
 * DEV ONLY - should never be deployed to production.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { fetchFPLBootstrapData, fetchFPLLeagueStandings } from './fplApi';
import {
  calculateBracketSize,
  calculateTotalRounds,
  generateBracketStructure,
  assignParticipantsToMatches,
} from './bracketGenerator';
import {
  upsertEntryAdmin,
  upsertPickAdmin,
  createTournamentAdmin,
  createRoundAdmin,
  createParticipantAdmin,
  createMatchAdmin,
  updateMatchAdmin,
  createMatchPickAdmin,
  AuthClaims,
} from './dataconnect-mutations';
import { sendDiscordAlert } from './discord';

// Configuration
const CONFIG = {
  count: 20,
  leagueIdMin: 134129,
  leagueIdMax: 634129,
  minParticipants: 8,
  maxParticipants: 64,
  maxAttempts: 50,
};

// Auth claims for admin operations
const SYSTEM_AUTH_CLAIMS: AuthClaims = {
  sub: 'test-system',
  email: 'test-system@knockoutfpl.com',
  email_verified: true,
};

// Discord webhook URL from environment
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get current gameweek from bootstrap data
 */
function getCurrentGameweek(bootstrapData: any): number {
  const currentEvent = bootstrapData.events?.find((e: any) => e.is_current);
  if (!currentEvent) {
    throw new Error('Could not determine current gameweek');
  }
  return currentEvent.id;
}

/**
 * Create a single test tournament
 */
async function createTestTournament(
  leagueId: number,
  startEvent: number,
  standings: any,
  currentYear: number
): Promise<string> {
  const leagueData = standings.league;
  const standingsResults = standings.standings.results;
  const participantCount = standingsResults.length;
  const bracketSize = calculateBracketSize(participantCount);
  const totalRounds = calculateTotalRounds(bracketSize);
  const season = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  const tournamentId = crypto.randomUUID();

  console.log(`[createTestTournaments] Creating tournament ${tournamentId} for league ${leagueId} (${leagueData.name})`);
  console.log(`[createTestTournaments] ${participantCount} participants, ${totalRounds} rounds, starting GW${startEvent}`);

  // Generate bracket structure
  const matches = generateBracketStructure(bracketSize);
  const matchAssignments = assignParticipantsToMatches(bracketSize, participantCount);

  // Create entries
  for (const p of standingsResults) {
    const nameParts = (p.player_name || '').split(' ');
    await upsertEntryAdmin({
      entryId: p.entry,
      season,
      name: p.entry_name,
      playerFirstName: nameParts[0] || '',
      playerLastName: nameParts.slice(1).join(' ') || '',
      summaryOverallPoints: p.total,
      rawJson: JSON.stringify(p),
    }, SYSTEM_AUTH_CLAIMS);
  }

  // Create placeholder picks for tournament gameweeks
  for (const p of standingsResults) {
    for (let r = 1; r <= totalRounds; r++) {
      await upsertPickAdmin({
        entryId: p.entry,
        event: startEvent + r - 1,
        points: 0,
        rawJson: '{}',
        isFinal: false,
      }, SYSTEM_AUTH_CLAIMS);
    }
  }

  // Create tournament (with isTest flag)
  await createTournamentAdmin({
    id: tournamentId,
    fplLeagueId: leagueId,
    fplLeagueName: leagueData.name,
    creatorUid: 'test-system',
    participantCount,
    totalRounds,
    startEvent,
    seedingMethod: 'league_rank',
    isTest: true,
  }, SYSTEM_AUTH_CLAIMS);

  // Create rounds
  for (let r = 1; r <= totalRounds; r++) {
    await createRoundAdmin({
      tournamentId,
      roundNumber: r,
      event: startEvent + r - 1,
      status: r === 1 ? 'active' : 'pending',
    }, SYSTEM_AUTH_CLAIMS);
  }

  // Create participants
  const seedToEntry = new Map<number, number>();
  for (let i = 0; i < standingsResults.length; i++) {
    const p = standingsResults[i];
    const seed = i + 1;
    seedToEntry.set(seed, p.entry);

    await createParticipantAdmin({
      tournamentId,
      entryId: p.entry,
      teamName: p.entry_name,
      managerName: p.player_name,
      seed,
      leagueRank: p.rank,
      leaguePoints: p.total,
      rawJson: JSON.stringify(p),
    }, SYSTEM_AUTH_CLAIMS);
  }

  // Create matches and match picks
  for (const match of matches) {
    const isBye = false;
    await createMatchAdmin({
      tournamentId,
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      positionInRound: match.positionInRound,
      qualifiesToMatchId: match.qualifiesToMatchId,
      isBye,
    }, SYSTEM_AUTH_CLAIMS);
  }

  // Create round 1 match picks
  for (const assignment of matchAssignments) {
    const match = matches.find(m => m.roundNumber === 1 && m.positionInRound === assignment.position);
    if (!match) continue;

    const entry1 = seedToEntry.get(assignment.seed1);
    if (entry1) {
      await createMatchPickAdmin({
        tournamentId,
        matchId: match.matchId,
        entryId: entry1,
        slot: 1,
      }, SYSTEM_AUTH_CLAIMS);
    }

    if (assignment.seed2 !== null) {
      const entry2 = seedToEntry.get(assignment.seed2);
      if (entry2) {
        await createMatchPickAdmin({
          tournamentId,
          matchId: match.matchId,
          entryId: entry2,
          slot: 2,
        }, SYSTEM_AUTH_CLAIMS);
      }
    } else {
      // Mark as bye
      await updateMatchAdmin({
        tournamentId,
        matchId: match.matchId,
        roundNumber: match.roundNumber,
        positionInRound: match.positionInRound,
        qualifiesToMatchId: match.qualifiesToMatchId,
        isBye: true,
        status: 'complete',
        winnerEntryId: entry1,
      }, SYSTEM_AUTH_CLAIMS);
    }
  }

  return tournamentId;
}

/**
 * Main scheduled function - runs daily at midnight
 */
export const createTestTournaments = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'Europe/London',
    retryCount: 1,
  },
  async () => {
    // Environment check - only run in dev
    if (process.env.ENVIRONMENT === 'production') {
      console.log('[createTestTournaments] Disabled in production, skipping');
      return;
    }

    console.log('[createTestTournaments] Starting daily test tournament creation...');

    try {
      // Get current gameweek
      const bootstrapData = await fetchFPLBootstrapData();
      const currentGW = getCurrentGameweek(bootstrapData);
      const currentYear = new Date().getFullYear();

      console.log(`[createTestTournaments] Current gameweek: ${currentGW}`);

      let created = 0;
      let attempts = 0;
      const createdIds: string[] = [];

      while (created < CONFIG.count && attempts < CONFIG.maxAttempts) {
        attempts++;

        // Generate random league ID
        const leagueId = randomInt(CONFIG.leagueIdMin, CONFIG.leagueIdMax);

        try {
          // Fetch league standings
          const standings = await fetchFPLLeagueStandings(leagueId);

          // Validate league size
          const participantCount = standings.standings?.results?.length || 0;
          if (participantCount < CONFIG.minParticipants || participantCount > CONFIG.maxParticipants) {
            console.log(`[createTestTournaments] League ${leagueId} has ${participantCount} participants, skipping`);
            continue;
          }

          // Pick random start gameweek (1 to currentGW)
          const startEvent = randomInt(1, currentGW);

          // Create the tournament
          const tournamentId = await createTestTournament(leagueId, startEvent, standings, currentYear);
          createdIds.push(tournamentId);
          created++;

          console.log(`[createTestTournaments] Created ${created}/${CONFIG.count} tournaments`);

          // Small delay between creations
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          // League not found or other error - just skip and try another
          console.log(`[createTestTournaments] League ${leagueId} failed, trying another...`);
        }
      }

      console.log(`[createTestTournaments] Complete. Created ${created} tournaments in ${attempts} attempts.`);

      if (created < CONFIG.count) {
        await sendDiscordAlert(
          `⚠️ createTestTournaments: Only created ${created}/${CONFIG.count} tournaments (${attempts} attempts)`,
          DISCORD_WEBHOOK_URL
        );
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[createTestTournaments] Fatal error:', error);
      await sendDiscordAlert(
        `🔴 createTestTournaments crashed: ${errorMessage}`,
        DISCORD_WEBHOOK_URL
      );
      throw error;
    }
  }
);
```

**Step 2: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add functions/src/createTestTournaments.ts
git commit -m "$(cat <<'EOF'
feat(functions): add daily test tournament creator

Scheduled function that runs daily at midnight to create 20 test
tournaments with random past gameweeks for production confidence
testing. Includes Discord alerting for failures.

DEV ONLY - checks ENVIRONMENT variable and skips in production.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Create Stuck Tournament Checker

**Files:**
- Create: `functions/src/checkStuckTournaments.ts`

**Step 1: Create the file**

```typescript
/**
 * Stuck Tournament Checker
 *
 * Scheduled function that runs every 6 hours to check for
 * test tournaments that haven't completed within 24 hours.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getStuckTestTournaments } from './dataconnect-mutations';
import { sendDiscordAlert } from './discord';

// Timeout in hours - tournaments older than this are considered stuck
const STUCK_TIMEOUT_HOURS = 24;

// Discord webhook URL from environment
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

/**
 * Format time difference in human-readable format
 */
function formatTimeSince(dateString: string): string {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h ago`;
  }
  return `${diffHours}h ago`;
}

/**
 * Main scheduled function - runs every 6 hours
 */
export const checkStuckTournaments = onSchedule(
  {
    schedule: 'every 6 hours',
    timeZone: 'Europe/London',
    retryCount: 1,
  },
  async () => {
    console.log('[checkStuckTournaments] Checking for stuck test tournaments...');

    try {
      // Calculate cutoff time (24 hours ago)
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - STUCK_TIMEOUT_HOURS);

      // Query for stuck tournaments
      const stuckTournaments = await getStuckTestTournaments(cutoffTime);

      console.log(`[checkStuckTournaments] Found ${stuckTournaments.length} stuck tournaments`);

      if (stuckTournaments.length === 0) {
        console.log('[checkStuckTournaments] No stuck tournaments, all good!');
        return;
      }

      // Send alert for each stuck tournament
      for (const tournament of stuckTournaments) {
        const timeSince = formatTimeSince(tournament.createdAt);
        const message = `⚠️ Tournament stuck - ${tournament.fplLeagueName} (${tournament.id})\n` +
          `Status: ${tournament.status}, Round ${tournament.currentRound}/${tournament.totalRounds}\n` +
          `Created: ${timeSince}`;

        console.log(`[checkStuckTournaments] Alerting: ${tournament.id}`);
        await sendDiscordAlert(message, DISCORD_WEBHOOK_URL);
      }

      console.log(`[checkStuckTournaments] Sent ${stuckTournaments.length} alerts`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[checkStuckTournaments] Error:', error);
      await sendDiscordAlert(
        `🔴 checkStuckTournaments crashed: ${errorMessage}`,
        DISCORD_WEBHOOK_URL
      );
      throw error;
    }
  }
);
```

**Step 2: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add functions/src/checkStuckTournaments.ts
git commit -m "$(cat <<'EOF'
feat(functions): add stuck tournament checker

Scheduled function that runs every 6 hours to check for test
tournaments that haven't completed within 24 hours. Sends Discord
alerts for each stuck tournament found.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Export New Functions

**Files:**
- Modify: `functions/src/index.ts`

**Step 1: Add new exports**

Add at the end of the file:

```typescript
// Export test tournament functions (dev only)
export { createTestTournaments } from './createTestTournaments';
export { checkStuckTournaments } from './checkStuckTournaments';
```

**Step 2: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 3: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 4: Commit**

```bash
git add functions/src/index.ts
git commit -m "$(cat <<'EOF'
feat(functions): export test tournament functions

Exports createTestTournaments and checkStuckTournaments
scheduled functions for production confidence testing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Add Unit Tests for Stuck Tournament Checker

**Files:**
- Create: `functions/src/checkStuckTournaments.test.ts`

**Step 1: Create test file**

```typescript
import { describe, it, expect } from 'vitest';

// Test the time formatting logic (extracted for testing)
function formatTimeSince(dateString: string): string {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h ago`;
  }
  return `${diffHours}h ago`;
}

describe('formatTimeSince', () => {
  it('should format hours correctly', () => {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    const result = formatTimeSince(threeHoursAgo.toISOString());
    expect(result).toBe('3h ago');
  });

  it('should format days and hours correctly', () => {
    const oneDayAndFiveHoursAgo = new Date();
    oneDayAndFiveHoursAgo.setHours(oneDayAndFiveHoursAgo.getHours() - 29);

    const result = formatTimeSince(oneDayAndFiveHoursAgo.toISOString());
    expect(result).toBe('1d 5h ago');
  });

  it('should handle exactly 24 hours', () => {
    const exactlyOneDayAgo = new Date();
    exactlyOneDayAgo.setHours(exactlyOneDayAgo.getHours() - 24);

    const result = formatTimeSince(exactlyOneDayAgo.toISOString());
    expect(result).toBe('1d 0h ago');
  });
});
```

**Step 2: Run test to verify it passes**

Run: `cd functions && npm test -- checkStuckTournaments.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add functions/src/checkStuckTournaments.test.ts
git commit -m "$(cat <<'EOF'
test(functions): add unit tests for time formatting

Tests the formatTimeSince helper function used in
stuck tournament alerts.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add isTest field to Tournament schema | `dataconnect/schema/schema.gql` |
| 2 | Create Discord webhook helper | `functions/src/discord.ts`, `functions/src/discord.test.ts` |
| 3 | Add catch-up query for pending active rounds | `functions/src/dataconnect-mutations.ts` |
| 4 | Add query for stuck test tournaments | `functions/src/dataconnect-mutations.ts` |
| 5 | Update tournament creation to support isTest | `functions/src/dataconnect-mutations.ts` |
| 6 | Enhance updateBrackets with catch-up mode | `functions/src/updateBrackets.ts` |
| 7 | Create test tournament creator function | `functions/src/createTestTournaments.ts` |
| 8 | Create stuck tournament checker | `functions/src/checkStuckTournaments.ts` |
| 9 | Export new functions | `functions/src/index.ts` |
| 10 | Add unit tests for stuck tournament checker | `functions/src/checkStuckTournaments.test.ts` |

**Total steps:** ~50

---

## Post-Implementation

After completing all tasks:

1. **Configure Discord webhook in Firebase:**
   ```bash
   firebase functions:config:set discord.webhook_url="<your-webhook-url>"
   ```

2. **Deploy to dev environment:**
   ```bash
   firebase deploy --only functions --project dev
   ```

3. **Verify in Firebase Console:**
   - Check that all 3 scheduled functions appear
   - Verify schedules are correct
   - Monitor initial runs

4. **Test manually:**
   - Trigger `createTestTournaments` manually
   - Wait for `updateBrackets` to run
   - Verify Discord alerts work
