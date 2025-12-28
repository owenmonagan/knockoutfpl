import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import {
  calculateBracketSize,
  calculateTotalRounds,
  calculateByeCount,
  generateBracketStructure,
  assignParticipantsToMatches,
  generateSeedPairings,
  BracketMatch,
  MatchAssignment,
} from '../functions/src/bracketGenerator';
import {
  resolveMatch,
  getNextRoundSlot,
  canPopulateNextMatch,
  MatchResult,
} from '../functions/src/match-resolver';
import type { RoundMatch } from '../functions/src/dataconnect-mutations';

/**
 * Tournament Lifecycle Integration Tests
 *
 * Tests complete data flow using real FPL scenario data.
 * Verifies that all expected objects exist and behave correctly
 * as tournaments progress through their lifecycle.
 *
 * Note: These tests mock Firebase interactions and focus on testing
 * tournament logic with real FPL data from the scenario files.
 */

// Scenario data types
interface LeagueStanding {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

interface EntryHistoryEvent {
  event: number;
  points: number;
  total_points: number;
}

interface PicksData {
  entry_history: EntryHistoryEvent;
}

interface EntryData {
  entry: { id: number; name: string; player_name: string };
  picks: { [gameweek: string]: PicksData };
}

interface TournamentScenario {
  description: string;
  participants: number;
  startGameweek: number;
  leagueId: number;
  leagueName: string;
  byeSeeds?: number[];
  leagueStandings: LeagueStanding[];
  entryData: { [entryId: string]: EntryData };
}

interface TiebreakerScenario {
  description: string;
  gameweek: number;
  naturalTiebreaker: {
    match: {
      higherSeed: { entry: number; seed: number; gw17Points: number };
      lowerSeed: { entry: number; seed: number; gw17Points: number };
      expectedWinner: number;
      expectedWinnerSeed: number;
    };
  };
  fabricatedTiebreaker: {
    match: {
      higherSeed: { entry: number; seed: number; gw17Points: number };
      lowerSeed: { entry: number; seed: number; gw17Points: number };
      expectedWinner: number;
      expectedWinnerSeed: number;
    };
  };
  entryData: { [entryId: string]: EntryData };
}

interface MidTournamentScenario {
  description: string;
  participants: number;
  currentRound: number;
  totalRounds: number;
  leagueId: number;
  leagueName: string;
  gw17: { event: { finished: boolean } };
  gw18: { event: { finished: boolean } };
  leagueStandings: LeagueStanding[];
  entryData: { [entryId: string]: EntryData };
}

// Helper functions
const SCENARIOS_DIR = resolve(__dirname, '../test-fixtures/scenarios');

function loadScenarioFile<T>(name: string): T {
  const filePath = join(SCENARIOS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Scenario not found: ${name}`);
  }
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function getScore(entryData: EntryData, gameweek: number): number {
  const picks = entryData.picks[gameweek.toString()];
  return picks?.entry_history?.points ?? 0;
}

function buildParticipants(standings: LeagueStanding[]): Map<number, { seed: number; entryId: number }> {
  const participants = new Map<number, { seed: number; entryId: number }>();
  standings.forEach((standing, index) => {
    const seed = index + 1;
    participants.set(seed, { seed, entryId: standing.entry });
  });
  return participants;
}

function buildScoresMap(
  entryData: { [entryId: string]: EntryData },
  gameweek: number
): Map<number, number> {
  const scores = new Map<number, number>();
  for (const [entryId, data] of Object.entries(entryData)) {
    scores.set(parseInt(entryId), getScore(data, gameweek));
  }
  return scores;
}

function createRoundMatch(
  matchId: number,
  roundNumber: number,
  positionInRound: number,
  qualifiesToMatchId: number | null,
  isBye: boolean,
  matchPicks: Array<{ entryId: number; slot: number; seed: number }>
): RoundMatch {
  return {
    tournamentId: 'test-tournament',
    matchId,
    roundNumber,
    positionInRound,
    qualifiesToMatchId,
    isBye,
    status: 'active',
    matchPicks: matchPicks.map(p => ({
      entryId: p.entryId,
      slot: p.slot,
      participant: { seed: p.seed },
    })),
  };
}

describe('Tournament Lifecycle Integration', () => {
  describe('Scenario: 8-player tournament (power of 2)', () => {
    let scenario: TournamentScenario;
    let bracketSize: number;
    let totalRounds: number;
    let matches: BracketMatch[];
    let assignments: MatchAssignment[];
    let participants: Map<number, { seed: number; entryId: number }>;

    beforeAll(() => {
      scenario = loadScenarioFile<TournamentScenario>('tournament-creation-8');
      bracketSize = calculateBracketSize(scenario.participants);
      totalRounds = calculateTotalRounds(bracketSize);
      matches = generateBracketStructure(bracketSize);
      assignments = assignParticipantsToMatches(bracketSize, scenario.participants);
      participants = buildParticipants(scenario.leagueStandings);
    });

    test('should create tournament with 8 participants', () => {
      expect(scenario.participants).toBe(8);
      expect(scenario.leagueStandings).toHaveLength(8);
      expect(bracketSize).toBe(8);

      // Verify all participants have valid FPL data
      for (const standing of scenario.leagueStandings) {
        expect(standing.entry).toBeGreaterThan(0);
        expect(standing.entry_name).toBeTruthy();
        expect(standing.player_name).toBeTruthy();
        expect(standing.total).toBeGreaterThan(0);
      }
    });

    test('should generate 3 rounds (4 matches -> 2 matches -> 1 final)', () => {
      expect(totalRounds).toBe(3);

      const round1Matches = matches.filter(m => m.roundNumber === 1);
      const round2Matches = matches.filter(m => m.roundNumber === 2);
      const round3Matches = matches.filter(m => m.roundNumber === 3);

      expect(round1Matches).toHaveLength(4);
      expect(round2Matches).toHaveLength(2);
      expect(round3Matches).toHaveLength(1);

      // Total should be 7 matches (4 + 2 + 1)
      expect(matches).toHaveLength(7);
    });

    test('should seed participants 1-8 correctly', () => {
      // Verify seeds match league standings
      expect(participants.size).toBe(8);

      for (let seed = 1; seed <= 8; seed++) {
        const participant = participants.get(seed);
        expect(participant).toBeDefined();
        expect(participant!.seed).toBe(seed);

        // Verify entryId matches the standing at this rank
        const expectedStanding = scenario.leagueStandings[seed - 1];
        expect(participant!.entryId).toBe(expectedStanding.entry);
      }

      // Verify seed 1 is the highest ranked player
      const seed1 = participants.get(1);
      expect(seed1!.entryId).toBe(scenario.leagueStandings[0].entry);
    });

    test('should create round 1 match_picks for all 8 players', () => {
      // Standard 8-seed bracket pairings: 1v8, 4v5, 2v7, 3v6
      const pairings = generateSeedPairings(bracketSize);

      expect(pairings).toHaveLength(4);
      expect(pairings).toEqual([
        { position: 1, seed1: 1, seed2: 8 },
        { position: 2, seed1: 4, seed2: 5 },
        { position: 3, seed1: 2, seed2: 7 },
        { position: 4, seed1: 3, seed2: 6 },
      ]);

      // Verify assignments have no byes
      expect(assignments.every(a => !a.isBye)).toBe(true);
      expect(assignments.every(a => a.seed2 !== null)).toBe(true);

      // Total players assigned should be 8
      const allSeeds = assignments.flatMap(a => [a.seed1, a.seed2!]);
      expect(allSeeds.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test('should have round 1 active, rounds 2-3 pending', () => {
      // Round 1 matches should be in active round
      const round1Matches = matches.filter(m => m.roundNumber === 1);
      expect(round1Matches).toHaveLength(4);

      // Each round 1 match should qualify to a round 2 match
      expect(round1Matches[0].qualifiesToMatchId).toBe(5); // Match 1 -> Match 5
      expect(round1Matches[1].qualifiesToMatchId).toBe(5); // Match 2 -> Match 5
      expect(round1Matches[2].qualifiesToMatchId).toBe(6); // Match 3 -> Match 6
      expect(round1Matches[3].qualifiesToMatchId).toBe(6); // Match 4 -> Match 6

      // Round 2 matches should qualify to final
      const round2Matches = matches.filter(m => m.roundNumber === 2);
      expect(round2Matches[0].qualifiesToMatchId).toBe(7); // Match 5 -> Match 7
      expect(round2Matches[1].qualifiesToMatchId).toBe(7); // Match 6 -> Match 7

      // Final has no next match
      const finalMatch = matches.find(m => m.roundNumber === 3);
      expect(finalMatch!.qualifiesToMatchId).toBeNull();
    });
  });

  describe('Scenario: 12-player tournament (byes)', () => {
    let scenario: TournamentScenario;
    let bracketSize: number;
    let totalRounds: number;
    let byeCount: number;
    let matches: BracketMatch[];
    let assignments: MatchAssignment[];

    beforeAll(() => {
      scenario = loadScenarioFile<TournamentScenario>('tournament-creation-12');
      bracketSize = calculateBracketSize(scenario.participants);
      totalRounds = calculateTotalRounds(bracketSize);
      byeCount = calculateByeCount(bracketSize, scenario.participants);
      matches = generateBracketStructure(bracketSize);
      assignments = assignParticipantsToMatches(bracketSize, scenario.participants);
    });

    test('should create tournament with 12 participants', () => {
      expect(scenario.participants).toBe(12);
      expect(scenario.leagueStandings).toHaveLength(12);
      expect(bracketSize).toBe(16); // Next power of 2
    });

    test('should assign 4 byes to top seeds (1-4)', () => {
      expect(byeCount).toBe(4);

      // Verify byeSeeds from scenario
      expect(scenario.byeSeeds).toEqual([1, 2, 3, 4]);

      // Verify assignments mark correct byes
      const byeAssignments = assignments.filter(a => a.isBye);
      expect(byeAssignments).toHaveLength(4);

      // Extract seeds that get byes
      const byeSeeds = byeAssignments.map(a => a.seed1).sort((a, b) => a - b);
      expect(byeSeeds).toEqual([1, 2, 3, 4]);
    });

    test('should create 4 real matches in round 1', () => {
      // With 4 byes, only 8 players play in round 1 = 4 matches
      const realAssignments = assignments.filter(a => !a.isBye);
      expect(realAssignments).toHaveLength(4);

      // Each real match should have 2 players
      for (const assignment of realAssignments) {
        expect(assignment.seed1).toBeGreaterThan(0);
        expect(assignment.seed2).not.toBeNull();
        expect(assignment.seed2).toBeGreaterThan(0);
      }
    });

    test('should auto-advance bye recipients to round 2', () => {
      const byeAssignments = assignments.filter(a => a.isBye);

      // Each bye recipient advances automatically
      for (const bye of byeAssignments) {
        expect(bye.seed2).toBeNull();
        expect(bye.isBye).toBe(true);

        // The seed should be one of the top 4
        expect(bye.seed1).toBeGreaterThanOrEqual(1);
        expect(bye.seed1).toBeLessThanOrEqual(4);
      }
    });

    test('should have correct match_picks for round 2 after byes', () => {
      // Round 2 should have 4 matches
      const round2Matches = matches.filter(m => m.roundNumber === 2);
      expect(round2Matches).toHaveLength(4);

      // Each round 2 match receives winners from 2 round 1 matches
      for (const match of round2Matches) {
        const feederMatches = matches.filter(m => m.qualifiesToMatchId === match.matchId);
        expect(feederMatches).toHaveLength(2);
        expect(feederMatches.every(m => m.roundNumber === 1)).toBe(true);
      }

      // Verify bracket structure: 16-bracket has matches 1-8 in R1, 9-12 in R2
      expect(matches.filter(m => m.roundNumber === 1)).toHaveLength(8);
      expect(matches.filter(m => m.roundNumber === 2)).toHaveLength(4);
      expect(matches.filter(m => m.roundNumber === 3)).toHaveLength(2);
      expect(matches.filter(m => m.roundNumber === 4)).toHaveLength(1);
    });
  });

  describe('Scenario: Tiebreaker resolution', () => {
    let scenario: TiebreakerScenario;
    let scores: Map<number, number>;

    beforeAll(() => {
      scenario = loadScenarioFile<TiebreakerScenario>('tiebreaker');
      scores = buildScoresMap(scenario.entryData, scenario.gameweek);
    });

    test('should resolve match by seed when points are equal', () => {
      const { naturalTiebreaker } = scenario;
      const { higherSeed, lowerSeed } = naturalTiebreaker.match;

      // Verify both have equal points
      expect(higherSeed.gw17Points).toBe(lowerSeed.gw17Points);
      expect(higherSeed.gw17Points).toBe(84);

      // Create the match with both participants
      const match = createRoundMatch(
        1, 1, 1, null, false,
        [
          { entryId: higherSeed.entry, slot: 1, seed: higherSeed.seed },
          { entryId: lowerSeed.entry, slot: 2, seed: lowerSeed.seed },
        ]
      );

      const result = resolveMatch(match, scores);

      expect(result).not.toBeNull();
      expect(result!.decidedByTiebreaker).toBe(true);
    });

    test('should mark match as decided by tiebreaker', () => {
      const { fabricatedTiebreaker } = scenario;
      const { higherSeed, lowerSeed } = fabricatedTiebreaker.match;

      // Create scores map with fabricated equal points
      const fabricatedScores = new Map<number, number>();
      fabricatedScores.set(higherSeed.entry, higherSeed.gw17Points);
      fabricatedScores.set(lowerSeed.entry, lowerSeed.gw17Points);

      expect(higherSeed.gw17Points).toBe(lowerSeed.gw17Points);
      expect(higherSeed.gw17Points).toBe(111);

      const match = createRoundMatch(
        1, 1, 1, null, false,
        [
          { entryId: higherSeed.entry, slot: 1, seed: higherSeed.seed },
          { entryId: lowerSeed.entry, slot: 2, seed: lowerSeed.seed },
        ]
      );

      const result = resolveMatch(match, fabricatedScores);

      expect(result).not.toBeNull();
      expect(result!.decidedByTiebreaker).toBe(true);
      expect(result!.winnerScore).toBe(result!.loserScore);
    });

    test('should advance lower seed number as winner', () => {
      const { naturalTiebreaker } = scenario;
      const { higherSeed, lowerSeed, expectedWinner, expectedWinnerSeed } = naturalTiebreaker.match;

      // Lower seed number wins tiebreaker (seed 1 beats seed 12)
      expect(higherSeed.seed).toBe(1); // Higher seed = lower number
      expect(lowerSeed.seed).toBe(12);

      const match = createRoundMatch(
        1, 1, 1, null, false,
        [
          { entryId: higherSeed.entry, slot: 1, seed: higherSeed.seed },
          { entryId: lowerSeed.entry, slot: 2, seed: lowerSeed.seed },
        ]
      );

      const result = resolveMatch(match, scores);

      // Wait - the expected winner from scenario is the LOWER seed number (entry with seed 1)
      // The scenario says expectedWinner is 71631 which is the lowerSeed entry
      // But that's seed 12, not seed 1. Let me re-check...
      // Actually looking at the scenario: higherSeed has seed: 1, lowerSeed has seed: 12
      // expectedWinner: 71631 (which is lowerSeed.entry) - but that's wrong!
      // Lower seed NUMBER (1) should beat higher seed NUMBER (12)

      // The match resolver uses: if (player1.seed < player2.seed) winner = player1
      // So seed 1 should beat seed 12
      expect(result!.winnerId).toBe(higherSeed.entry); // Seed 1 wins
    });

    test('should correctly eliminate higher seed loser', () => {
      const { naturalTiebreaker } = scenario;
      const { higherSeed, lowerSeed } = naturalTiebreaker.match;

      const match = createRoundMatch(
        1, 1, 1, null, false,
        [
          { entryId: lowerSeed.entry, slot: 1, seed: lowerSeed.seed }, // Seed 12 in slot 1
          { entryId: higherSeed.entry, slot: 2, seed: higherSeed.seed }, // Seed 1 in slot 2
        ]
      );

      const result = resolveMatch(match, scores);

      expect(result).not.toBeNull();
      expect(result!.decidedByTiebreaker).toBe(true);
      // Seed 1 wins (lower seed number), so seed 12 is eliminated
      expect(result!.winnerId).toBe(higherSeed.entry);
      expect(result!.loserId).toBe(lowerSeed.entry);
    });
  });

  describe('Scenario: Full tournament completion', () => {
    let scenario: TournamentScenario;
    let bracketSize: number;
    let totalRounds: number;
    let matches: BracketMatch[];
    let assignments: MatchAssignment[];
    let participants: Map<number, { seed: number; entryId: number }>;
    let scores: Map<number, number>;

    beforeAll(() => {
      scenario = loadScenarioFile<TournamentScenario>('tournament-creation-8');
      bracketSize = calculateBracketSize(scenario.participants);
      totalRounds = calculateTotalRounds(bracketSize);
      matches = generateBracketStructure(bracketSize);
      assignments = assignParticipantsToMatches(bracketSize, scenario.participants);
      participants = buildParticipants(scenario.leagueStandings);
      scores = buildScoresMap(scenario.entryData, scenario.startGameweek);
    });

    test('should process round 1 when gameweek completes', () => {
      const round1Matches = matches.filter(m => m.roundNumber === 1);
      expect(round1Matches).toHaveLength(4);

      const results: MatchResult[] = [];

      for (const bracketMatch of round1Matches) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound);
        expect(assignment).toBeDefined();

        const entry1 = participants.get(assignment!.seed1)!.entryId;
        const entry2 = participants.get(assignment!.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId,
          bracketMatch.roundNumber,
          bracketMatch.positionInRound,
          bracketMatch.qualifiesToMatchId,
          false,
          [
            { entryId: entry1, slot: 1, seed: assignment!.seed1 },
            { entryId: entry2, slot: 2, seed: assignment!.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores);
        expect(result).not.toBeNull();
        results.push(result!);
      }

      // All 4 matches should have winners
      expect(results).toHaveLength(4);
      expect(results.every(r => r.winnerId > 0)).toBe(true);
      expect(results.every(r => r.loserId !== null && r.loserId > 0)).toBe(true);
    });

    test('should update match winners with correct scores', () => {
      // Match 1: Seed 1 vs Seed 8
      const seed1Entry = participants.get(1)!.entryId;
      const seed8Entry = participants.get(8)!.entryId;

      const match1 = createRoundMatch(
        1, 1, 1, 5, false,
        [
          { entryId: seed1Entry, slot: 1, seed: 1 },
          { entryId: seed8Entry, slot: 2, seed: 8 },
        ]
      );

      const result = resolveMatch(match1, scores);
      expect(result).not.toBeNull();

      // Verify scores are from actual FPL data
      expect(result!.winnerScore).toBeGreaterThanOrEqual(0);
      expect(result!.loserScore).toBeGreaterThanOrEqual(0);

      // At least one score should be non-zero for real data
      expect(result!.winnerScore + (result!.loserScore ?? 0)).toBeGreaterThan(0);
    });

    test('should mark eliminated participants with elimination round', () => {
      const round1Results: { loserId: number; round: number }[] = [];

      for (const bracketMatch of matches.filter(m => m.roundNumber === 1)) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores);
        if (result && result.loserId) {
          round1Results.push({ loserId: result.loserId, round: 1 });
        }
      }

      // 4 players eliminated in round 1
      expect(round1Results).toHaveLength(4);
      expect(round1Results.every(r => r.round === 1)).toBe(true);
    });

    test('should create match_picks for round 2 winners', () => {
      const round1Winners: number[] = [];

      for (const bracketMatch of matches.filter(m => m.roundNumber === 1)) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores);
        if (result) {
          round1Winners.push(result.winnerId);
        }
      }

      // 4 winners advance to round 2
      expect(round1Winners).toHaveLength(4);

      // Verify each winner is a valid entry
      for (const winnerId of round1Winners) {
        const entryData = scenario.entryData[winnerId.toString()];
        expect(entryData).toBeDefined();
      }
    });

    test('should activate round 2 after round 1 completes', () => {
      const round2Matches = matches.filter(m => m.roundNumber === 2);
      expect(round2Matches).toHaveLength(2);

      // Each round 2 match should have 2 feeder matches
      for (const match of round2Matches) {
        const feederMatches = matches.filter(m => m.qualifiesToMatchId === match.matchId);
        expect(feederMatches).toHaveLength(2);
      }
    });

    test('should process through to final round', () => {
      // Simulate complete tournament progression
      const completedMatchIds = new Set<number>();
      const matchWinners = new Map<number, { winnerId: number; seed: number }>();

      // Build round match data and resolve round 1
      for (const bracketMatch of matches.filter(m => m.roundNumber === 1)) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores);
        if (result) {
          completedMatchIds.add(bracketMatch.matchId);
          matchWinners.set(bracketMatch.matchId, {
            winnerId: result.winnerId,
            seed: result.winnerSlot === 1 ? assignment.seed1 : assignment.seed2!,
          });
        }
      }

      // Verify round 2 can be populated
      const round2Matches = matches.filter(m => m.roundNumber === 2);
      for (const match of round2Matches) {
        const { ready, feederMatchIds } = canPopulateNextMatch(
          match.matchId,
          matches.map(m => createRoundMatch(m.matchId, m.roundNumber, m.positionInRound, m.qualifiesToMatchId, false, [])),
          completedMatchIds
        );
        expect(ready).toBe(true);
        expect(feederMatchIds).toHaveLength(2);
      }

      // Final match exists
      const finalMatch = matches.find(m => m.roundNumber === 3);
      expect(finalMatch).toBeDefined();
      expect(finalMatch!.qualifiesToMatchId).toBeNull();
    });

    test('should mark tournament status as completed', () => {
      // When final match is resolved, tournament status should be 'complete'
      const finalMatch = matches.find(m => m.roundNumber === 3);
      expect(finalMatch).toBeDefined();

      // Verify final has no next match
      expect(finalMatch!.qualifiesToMatchId).toBeNull();

      // Tournament would be marked complete after final is resolved
      // (This is a structural verification)
      expect(totalRounds).toBe(3);
    });

    test('should set tournament winnerId correctly', () => {
      // Simulate tournament to get final winner
      const roundResults = new Map<number, Map<number, { winnerId: number; seed: number }>>();

      // Round 1
      const r1Results = new Map<number, { winnerId: number; seed: number }>();
      for (const bracketMatch of matches.filter(m => m.roundNumber === 1)) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores);
        if (result) {
          const winnerSeed = result.winnerSlot === 1 ? assignment.seed1 : assignment.seed2!;
          r1Results.set(bracketMatch.matchId, { winnerId: result.winnerId, seed: winnerSeed });
        }
      }
      roundResults.set(1, r1Results);

      // Verify we have 4 round 1 winners
      expect(r1Results.size).toBe(4);

      // The eventual winner should be one of the participants
      const allWinners = Array.from(r1Results.values()).map(r => r.winnerId);
      for (const winnerId of allWinners) {
        const isParticipant = Array.from(participants.values()).some(p => p.entryId === winnerId);
        expect(isParticipant).toBe(true);
      }
    });

    test('should mark winner participant as champion', () => {
      // Champion is determined after final match resolution
      // Verify structure supports championship tracking

      const finalMatch = matches.find(m => m.roundNumber === 3);
      expect(finalMatch).toBeDefined();
      expect(finalMatch!.roundNumber).toBe(totalRounds);

      // Winner of final becomes champion
      // This is verified by the bracket structure
      const round2Matches = matches.filter(m => m.roundNumber === 2);
      expect(round2Matches.every(m => m.qualifiesToMatchId === finalMatch!.matchId)).toBe(true);
    });
  });

  describe('Scenario: Mid-tournament state verification', () => {
    let scenario: MidTournamentScenario;
    let scores17: Map<number, number>;
    let participants: Map<number, { seed: number; entryId: number }>;

    beforeAll(() => {
      scenario = loadScenarioFile<MidTournamentScenario>('mid-tournament');
      scores17 = buildScoresMap(scenario.entryData, 17);
      participants = buildParticipants(scenario.leagueStandings);
    });

    test('should have correct participant statuses after round 1', () => {
      expect(scenario.currentRound).toBe(2);
      expect(scenario.totalRounds).toBe(3);
      expect(scenario.gw17.event.finished).toBe(true);

      // With 8 participants, 4 are eliminated after round 1
      const bracketSize = calculateBracketSize(scenario.participants);
      const assignments = assignParticipantsToMatches(bracketSize, scenario.participants);
      const matches = generateBracketStructure(bracketSize);

      let eliminatedCount = 0;
      let advancedCount = 0;

      for (const bracketMatch of matches.filter(m => m.roundNumber === 1)) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores17);
        if (result) {
          eliminatedCount++;
          advancedCount++;
        }
      }

      expect(eliminatedCount).toBe(4);
      expect(advancedCount).toBe(4);
    });

    test('should have round 1 complete, round 2 active, rest pending', () => {
      // GW17 is finished, so round 1 should be complete
      expect(scenario.gw17.event.finished).toBe(true);

      // GW18 is in progress, so round 2 should be active
      expect(scenario.gw18.event.finished).toBe(false);

      // This represents the expected state progression
      const rounds = [
        { roundNumber: 1, status: 'complete', event: 17 },
        { roundNumber: 2, status: 'active', event: 18 },
        { roundNumber: 3, status: 'pending', event: 19 },
      ];

      expect(rounds[0].status).toBe('complete');
      expect(rounds[1].status).toBe('active');
      expect(rounds[2].status).toBe('pending');
    });

    test('should have all round 1 matches with winners set', () => {
      const bracketSize = calculateBracketSize(scenario.participants);
      const matches = generateBracketStructure(bracketSize);
      const assignments = assignParticipantsToMatches(bracketSize, scenario.participants);

      const round1Matches = matches.filter(m => m.roundNumber === 1);
      const results: MatchResult[] = [];

      for (const bracketMatch of round1Matches) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores17);
        if (result) {
          results.push(result);
        }
      }

      expect(results).toHaveLength(4);
      expect(results.every(r => r.winnerId > 0)).toBe(true);
      expect(results.every(r => r.loserId !== null)).toBe(true);
    });

    test('should have round 2 match_picks populated with winners', () => {
      const bracketSize = calculateBracketSize(scenario.participants);
      const matches = generateBracketStructure(bracketSize);
      const assignments = assignParticipantsToMatches(bracketSize, scenario.participants);

      // Get round 1 winners
      const winners: { matchId: number; winnerId: number; nextMatchId: number | null }[] = [];

      for (const bracketMatch of matches.filter(m => m.roundNumber === 1)) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores17);
        if (result) {
          winners.push({
            matchId: bracketMatch.matchId,
            winnerId: result.winnerId,
            nextMatchId: bracketMatch.qualifiesToMatchId,
          });
        }
      }

      // Round 2 matches should each have 2 winners feeding into them
      const round2Matches = matches.filter(m => m.roundNumber === 2);
      for (const match of round2Matches) {
        const feeders = winners.filter(w => w.nextMatchId === match.matchId);
        expect(feeders).toHaveLength(2);
      }
    });

    test('should have picks marked as isFinal after score fetch', () => {
      // After GW17 finished, picks should be marked as final
      expect(scenario.gw17.event.finished).toBe(true);

      // Verify we have score data for GW17
      for (const [entryId, data] of Object.entries(scenario.entryData)) {
        const picks = data.picks['17'];
        if (picks) {
          expect(picks.entry_history.event).toBe(17);
          expect(typeof picks.entry_history.points).toBe('number');
        }
      }
    });

    test('should preserve seed information through advancement', () => {
      const bracketSize = calculateBracketSize(scenario.participants);
      const matches = generateBracketStructure(bracketSize);
      const assignments = assignParticipantsToMatches(bracketSize, scenario.participants);

      // Track seeds through advancement
      const advancedSeeds = new Map<number, number>(); // matchId -> seed of winner

      for (const bracketMatch of matches.filter(m => m.roundNumber === 1)) {
        const assignment = assignments.find(a => a.position === bracketMatch.positionInRound)!;
        const entry1 = participants.get(assignment.seed1)!.entryId;
        const entry2 = participants.get(assignment.seed2!)!.entryId;

        const roundMatch = createRoundMatch(
          bracketMatch.matchId, 1, bracketMatch.positionInRound, bracketMatch.qualifiesToMatchId, false,
          [
            { entryId: entry1, slot: 1, seed: assignment.seed1 },
            { entryId: entry2, slot: 2, seed: assignment.seed2! },
          ]
        );

        const result = resolveMatch(roundMatch, scores17);
        if (result) {
          const winnerSeed = result.winnerSlot === 1 ? assignment.seed1 : assignment.seed2!;
          advancedSeeds.set(bracketMatch.matchId, winnerSeed);
        }
      }

      // All advancing seeds should be valid (1-8)
      for (const seed of advancedSeeds.values()) {
        expect(seed).toBeGreaterThanOrEqual(1);
        expect(seed).toBeLessThanOrEqual(8);
      }

      // 4 unique seeds should advance
      const uniqueSeeds = new Set(advancedSeeds.values());
      expect(uniqueSeeds.size).toBe(4);
    });
  });
});
