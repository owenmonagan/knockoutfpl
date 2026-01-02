/**
 * Test Tournament Creator - Scheduled Function
 *
 * Runs daily at midnight to create 20 test tournaments using random FPL leagues.
 * These tournaments are marked with isTest: true for production confidence testing.
 *
 * DEV ONLY - Will skip execution in production environment.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { fetchFPLBootstrapData, fetchFPLLeagueStandings } from './fplApi';
import {
  calculateBracketSize,
  calculateTotalRounds,
  generateBracketStructure,
  assignParticipantsToMatches,
  BracketMatch,
  MatchAssignment,
} from './bracketGenerator';
import {
  upsertUserAdmin,
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

// Auth claims for admin operations - uses real user ID to satisfy FK constraint
const SYSTEM_TEST_USER_ID = '1B0uIvuiGmaQUoMVFCu5Lh8jzlz1'; // owen@trylayup.com

const SYSTEM_AUTH_CLAIMS: AuthClaims = {
  sub: SYSTEM_TEST_USER_ID,
  email: 'owen@trylayup.com',
  email_verified: true,
};

// Discord webhook URL from environment config
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

// Database entity types (matching Data Connect schema)
interface EntryRecord {
  entryId: number;
  season: string;
  name: string;
  playerFirstName?: string;
  playerLastName?: string;
  summaryOverallPoints?: number;
  rawJson: string;
}

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

/**
 * Generate a random league ID within the configured range
 */
function generateRandomLeagueId(): number {
  return Math.floor(
    Math.random() * (CONFIG.leagueIdMax - CONFIG.leagueIdMin + 1) + CONFIG.leagueIdMin
  );
}

/**
 * Generate a random start event between 1 and the current gameweek
 */
function generateRandomStartEvent(currentGameweek: number): number {
  return Math.floor(Math.random() * currentGameweek) + 1;
}

/**
 * Get current gameweek from bootstrap data
 */
function getCurrentGameweek(bootstrapData: any): number | null {
  const currentEvent = bootstrapData.events?.find((e: any) => e.is_current);
  return currentEvent?.id ?? null;
}

/**
 * Validate if league standings are suitable for a tournament
 */
function isValidLeague(standings: any): boolean {
  if (!standings || !standings.standings?.results) {
    return false;
  }

  const count = standings.standings.results.length;
  return count >= CONFIG.minParticipants && count <= CONFIG.maxParticipants;
}

/**
 * Build all database records for a test tournament
 */
function buildTournamentRecords(
  tournamentId: string,
  standings: any,
  bracketSize: number,
  totalRounds: number,
  startEvent: number,
  matches: BracketMatch[],
  matchAssignments: MatchAssignment[]
): {
  entries: EntryRecord[];
  tournament: TournamentRecord;
  rounds: RoundRecord[];
  participants: ParticipantRecord[];
  matchRecords: MatchRecord[];
  matchPicks: MatchPickRecord[];
} {
  const leagueData = standings.league;
  const standingsResults = standings.standings.results;

  // Get current season (e.g., "2024-25")
  const currentYear = new Date().getFullYear();
  const season = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

  // Entries (FPL team data from league standings)
  const entries: EntryRecord[] = standingsResults.map((p: any) => {
    // Parse player name into first/last
    const nameParts = (p.player_name || '').split(' ');
    const playerFirstName = nameParts[0] || '';
    const playerLastName = nameParts.slice(1).join(' ') || '';

    return {
      entryId: p.entry,
      season,
      name: p.entry_name,
      playerFirstName,
      playerLastName,
      summaryOverallPoints: p.total,
      rawJson: JSON.stringify(p),
    };
  });

  // Tournament (created by system for testing)
  const tournament: TournamentRecord = {
    fplLeagueId: leagueData.id,
    fplLeagueName: leagueData.name,
    creatorUid: SYSTEM_TEST_USER_ID,
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

      // Advance BYE winner to next round
      if (match.qualifiesToMatchId && entry1) {
        const slot = assignment.position % 2 === 1 ? 1 : 2; // Odd positions → slot 1, even → slot 2
        matchPicks.push({
          tournamentId,
          matchId: match.qualifiesToMatchId,
          entryId: entry1,
          slot,
        });
      }
    }
  }

  return { entries, tournament, rounds, participants, matchRecords, matchPicks };
}

/**
 * Write tournament records to database
 */
async function writeTournamentToDatabase(
  tournamentId: string,
  records: ReturnType<typeof buildTournamentRecords>,
  isTest: boolean
): Promise<void> {
  console.log(`[createTestTournaments] Writing test tournament to database:`, {
    tournamentId,
    entryCount: records.entries.length,
    roundCount: records.rounds.length,
    participantCount: records.participants.length,
    matchCount: records.matchRecords.length,
    matchPickCount: records.matchPicks.length,
  });

  // 1. Create entries first (participants have FK to entries)
  for (const entry of records.entries) {
    await upsertEntryAdmin(
      {
        entryId: entry.entryId,
        season: entry.season,
        name: entry.name,
        playerFirstName: entry.playerFirstName,
        playerLastName: entry.playerLastName,
        summaryOverallPoints: entry.summaryOverallPoints,
        rawJson: entry.rawJson,
      },
      SYSTEM_AUTH_CLAIMS
    );
  }

  // 2. Create placeholder picks for tournament gameweeks
  for (const entry of records.entries) {
    for (const round of records.rounds) {
      await upsertPickAdmin(
        {
          entryId: entry.entryId,
          event: round.event,
          points: 0,
          rawJson: '{}',
          isFinal: false,
        },
        SYSTEM_AUTH_CLAIMS
      );
    }
  }

  // 3. Create tournament with isTest flag
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
      isTest,
      matchSize: 2,  // Test tournaments always use 1v1
    },
    SYSTEM_AUTH_CLAIMS
  );

  // 4. Create rounds
  for (const round of records.rounds) {
    await createRoundAdmin(
      {
        tournamentId,
        roundNumber: round.roundNumber,
        event: round.event,
        status: round.status,
      },
      SYSTEM_AUTH_CLAIMS
    );
  }

  // 5. Create participants
  for (const participant of records.participants) {
    await createParticipantAdmin(
      {
        tournamentId,
        entryId: participant.entryId,
        teamName: participant.teamName,
        managerName: participant.managerName,
        seed: participant.seed,
        leagueRank: participant.leagueRank,
        leaguePoints: participant.leaguePoints,
        rawJson: participant.rawJson,
      },
      SYSTEM_AUTH_CLAIMS
    );
  }

  // 6. Create matches
  for (const match of records.matchRecords) {
    await createMatchAdmin(
      {
        tournamentId,
        matchId: match.matchId,
        roundNumber: match.roundNumber,
        positionInRound: match.positionInRound,
        qualifiesToMatchId: match.qualifiesToMatchId,
        isBye: match.isBye,
        status: match.isBye ? 'complete' : 'active',
      },
      SYSTEM_AUTH_CLAIMS
    );

    // Update bye matches with status and winner
    if (match.isBye && match.winnerEntryId) {
      await updateMatchAdmin(
        {
          tournamentId,
          matchId: match.matchId,
          roundNumber: match.roundNumber,
          positionInRound: match.positionInRound,
          qualifiesToMatchId: match.qualifiesToMatchId,
          isBye: true,
          status: 'complete',
          winnerEntryId: match.winnerEntryId,
        },
        SYSTEM_AUTH_CLAIMS
      );
    }
  }

  // 7. Create match picks
  for (const pick of records.matchPicks) {
    await createMatchPickAdmin(
      {
        tournamentId,
        matchId: pick.matchId,
        entryId: pick.entryId,
        slot: pick.slot,
      },
      SYSTEM_AUTH_CLAIMS
    );
  }
}

/**
 * Create a single test tournament from a random FPL league
 */
async function createSingleTestTournament(
  currentGameweek: number
): Promise<{ success: boolean; tournamentId?: string; leagueId?: number; error?: string }> {
  const leagueId = generateRandomLeagueId();

  try {
    // Fetch league standings
    const standings = await fetchFPLLeagueStandings(leagueId);

    // Validate participant count
    if (!isValidLeague(standings)) {
      return { success: false, leagueId, error: 'Invalid participant count' };
    }

    const participantCount = standings.standings.results.length;
    const bracketSize = calculateBracketSize(participantCount);
    const totalRounds = calculateTotalRounds(bracketSize);
    const startEvent = generateRandomStartEvent(currentGameweek);

    // Generate bracket
    const matches = generateBracketStructure(bracketSize);
    const matchAssignments = assignParticipantsToMatches(bracketSize, participantCount);

    // Build records
    const tournamentId = crypto.randomUUID();
    const records = buildTournamentRecords(
      tournamentId,
      standings,
      bracketSize,
      totalRounds,
      startEvent,
      matches,
      matchAssignments
    );

    // Write to database
    await writeTournamentToDatabase(tournamentId, records, true);

    console.log(`[createTestTournaments] Created test tournament ${tournamentId} from league ${leagueId} (${participantCount} participants, starting GW${startEvent})`);

    return { success: true, tournamentId, leagueId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, leagueId, error: errorMessage };
  }
}

/**
 * Main scheduled function - runs daily at midnight
 */
export const createTestTournaments = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[createTestTournaments] Starting daily test tournament creation...');

    // Environment check - only run in dev
    if (process.env.ENVIRONMENT === 'production') {
      console.log('[createTestTournaments] Skipping in production environment');
      return;
    }

    try {
      // 0. Ensure test user exists in Data Connect (FK constraint)
      console.log('[createTestTournaments] Ensuring test user exists in database...');
      await upsertUserAdmin(SYSTEM_TEST_USER_ID, 'owen@trylayup.com');

      // 1. Fetch current gameweek from bootstrap data
      const bootstrapData = await fetchFPLBootstrapData();
      const currentGameweek = getCurrentGameweek(bootstrapData);

      if (!currentGameweek) {
        console.error('[createTestTournaments] Could not determine current gameweek');
        await sendDiscordAlert(
          '[createTestTournaments] Failed to determine current gameweek',
          DISCORD_WEBHOOK_URL
        );
        return;
      }

      console.log(`[createTestTournaments] Current gameweek: ${currentGameweek}`);

      // 2. Create tournaments
      let created = 0;
      let attempts = 0;
      const errors: string[] = [];

      while (created < CONFIG.count && attempts < CONFIG.maxAttempts) {
        attempts++;

        const result = await createSingleTestTournament(currentGameweek);

        if (result.success) {
          created++;
          console.log(`[createTestTournaments] Created ${created}/${CONFIG.count} (attempt ${attempts})`);
        } else {
          console.log(`[createTestTournaments] Attempt ${attempts} failed for league ${result.leagueId}: ${result.error}`);
          if (result.error && !result.error.includes('Invalid participant count')) {
            errors.push(`League ${result.leagueId}: ${result.error}`);
          }
        }
      }

      // 3. Report results
      console.log(`[createTestTournaments] Complete: ${created}/${CONFIG.count} tournaments created in ${attempts} attempts`);

      if (created < CONFIG.count) {
        const message = `[createTestTournaments] Only created ${created}/${CONFIG.count} test tournaments in ${attempts} attempts. Errors: ${errors.slice(0, 5).join(', ')}${errors.length > 5 ? '...' : ''}`;
        console.warn(message);
        await sendDiscordAlert(message, DISCORD_WEBHOOK_URL);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[createTestTournaments] Fatal error:', error);
      await sendDiscordAlert(
        `[createTestTournaments] crashed: ${errorMessage}`,
        DISCORD_WEBHOOK_URL
      );
      throw error; // Re-throw for retry
    }
  }
);
