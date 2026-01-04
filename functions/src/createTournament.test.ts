import { describe, it, expect } from 'vitest';
import { validateTournamentRequest, validateLeagueStandings, getCurrentGameweek, getCurrentSeason, buildTournamentRecords, buildNWayTournamentRecords } from './createTournament';
import { generateBracketStructure, assignParticipantsToMatches, calculateBracketSize, calculateTotalRounds } from './bracketGenerator';
import { calculateNWayBracket, generateNWayBracketStructure, assignParticipantsToNWayMatches } from './nWayBracket';

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

    it('passes with valid fplLeagueId and startEvent', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345, startEvent: 10 })).not.toThrow();
    });

    it('passes with startEvent of 1 (minimum)', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345, startEvent: 1 })).not.toThrow();
    });

    it('passes with startEvent of 38 (maximum)', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345, startEvent: 38 })).not.toThrow();
    });

    it('throws if startEvent is less than 1', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345, startEvent: 0 })).toThrow('startEvent must be between 1 and 38');
    });

    it('throws if startEvent is greater than 38', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345, startEvent: 39 })).toThrow('startEvent must be between 1 and 38');
    });

    it('throws if startEvent is not a number', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345, startEvent: 'ten' })).toThrow('startEvent must be a number');
    });

    it('passes when startEvent is undefined (optional)', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 12345, startEvent: undefined })).not.toThrow();
    });

    // matchSize validation tests
    it('accepts valid matchSize', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 3 })).not.toThrow();
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 4 })).not.toThrow();
    });

    it('accepts matchSize of 2 (minimum/default)', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 2 })).not.toThrow();
    });

    it('accepts matchSize of 8 (maximum)', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 8 })).not.toThrow();
    });

    it('rejects matchSize less than 2', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 1 }))
        .toThrow('matchSize must be between 2 and 8');
    });

    it('rejects matchSize greater than 8', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 10 }))
        .toThrow('matchSize must be between 2 and 8');
    });

    it('rejects non-number matchSize', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: 'three' }))
        .toThrow('matchSize must be a number');
    });

    it('passes when matchSize is undefined (optional)', () => {
      expect(() => validateTournamentRequest({ fplLeagueId: 123, matchSize: undefined })).not.toThrow();
    });
  });

  describe('validateLeagueStandings', () => {
    it('throws if standings is null', () => {
      expect(() => validateLeagueStandings(null)).toThrow('League not found');
    });

    it('throws if less than 2 participants', () => {
      const standings = { standings: { results: [{}] } };
      expect(() => validateLeagueStandings(standings)).toThrow('at least 2');
    });

    it('throws if more than 48 participants in production', () => {
      const originalEnv = process.env.ENVIRONMENT;
      process.env.ENVIRONMENT = 'production';
      try {
        const results = Array(49).fill({});
        const standings = { standings: { results } };
        expect(() => validateLeagueStandings(standings)).toThrow('maximum 48');
      } finally {
        process.env.ENVIRONMENT = originalEnv;
      }
    });

    it('allows more than 48 participants in dev/local', () => {
      const originalEnv = process.env.ENVIRONMENT;
      process.env.ENVIRONMENT = 'development';
      try {
        const results = Array(100).fill({});
        const standings = { standings: { results } };
        expect(() => validateLeagueStandings(standings)).not.toThrow();
      } finally {
        process.env.ENVIRONMENT = originalEnv;
      }
    });

    it('passes with exactly 48 participants', () => {
      const results = Array(48).fill({});
      const standings = { standings: { results } };
      expect(() => validateLeagueStandings(standings)).not.toThrow();
    });

    it('passes with valid participant count', () => {
      const results = Array(20).fill({});
      const standings = { standings: { results } };
      expect(() => validateLeagueStandings(standings)).not.toThrow();
    });
  });

  describe('getCurrentGameweek', () => {
    it('throws if no current gameweek found', () => {
      const bootstrapData = { events: [] };
      expect(() => getCurrentGameweek(bootstrapData)).toThrow('Could not determine current gameweek');
    });

    it('throws if events is undefined', () => {
      const bootstrapData = {};
      expect(() => getCurrentGameweek(bootstrapData)).toThrow('Could not determine current gameweek');
    });

    it('returns current gameweek id', () => {
      const bootstrapData = {
        events: [
          { id: 1, is_current: false },
          { id: 2, is_current: true },
          { id: 3, is_current: false },
        ],
      };
      expect(getCurrentGameweek(bootstrapData)).toBe(2);
    });
  });

  describe('getCurrentSeason', () => {
    it('returns current season in format YYYY-YY', () => {
      const season = getCurrentSeason();
      expect(season).toMatch(/^\d{4}-\d{2}$/);
    });
  });

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

    const testRefreshId = 'test-refresh-id-123';

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
        assignments,
        2,
        testRefreshId
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

      const records = buildTournamentRecords('test-uuid', 'user-123', mockStandings, bracketSize, totalRounds, 10, matches, assignments, 2, testRefreshId);

      expect(records.rounds).toHaveLength(2);
      expect(records.rounds[0].status).toBe('active');
      expect(records.rounds[1].status).toBe('pending');
    });

    it('creates tournamentEntries with correct seeds and refreshId', () => {
      const bracketSize = calculateBracketSize(4);
      const totalRounds = calculateTotalRounds(bracketSize);
      const matches = generateBracketStructure(bracketSize);
      const assignments = assignParticipantsToMatches(bracketSize, 4);

      const records = buildTournamentRecords('test-uuid', 'user-123', mockStandings, bracketSize, totalRounds, 10, matches, assignments, 2, testRefreshId);

      expect(records.tournamentEntries).toHaveLength(4);
      expect(records.tournamentEntries[0].seed).toBe(1);
      expect(records.tournamentEntries[0].entryId).toBe(100);
      expect(records.tournamentEntries[0].refreshId).toBe(testRefreshId);
      expect(records.tournamentEntries[0].status).toBe('active');
      expect(records.tournamentEntries[3].seed).toBe(4);
    });

    it('creates match picks for round 1', () => {
      const bracketSize = calculateBracketSize(4);
      const totalRounds = calculateTotalRounds(bracketSize);
      const matches = generateBracketStructure(bracketSize);
      const assignments = assignParticipantsToMatches(bracketSize, 4);

      const records = buildTournamentRecords('test-uuid', 'user-123', mockStandings, bracketSize, totalRounds, 10, matches, assignments, 2, testRefreshId);

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

      const records = buildTournamentRecords('test-uuid', 'user-123', threePlayerStandings, bracketSize, totalRounds, 10, matches, assignments, 2, testRefreshId);

      // One match should be a bye
      const byeMatches = records.matchRecords.filter(m => m.isBye);
      expect(byeMatches).toHaveLength(1);
      expect(byeMatches[0].status).toBe('complete');
      expect(byeMatches[0].winnerEntryId).toBe(100); // Seed 1 gets bye
    });

    it('creates correct record counts for 8 participants', () => {
      // This test documents the expected database write counts for Data Connect
      const eightPlayerStandings = {
        league: { id: 123, name: 'Test League' },
        standings: {
          results: Array(8).fill(null).map((_, i) => ({
            entry: 1000 + i,
            entry_name: `Team ${i + 1}`,
            player_name: `Manager ${i + 1}`,
            rank: i + 1,
            total: 1000 - i * 10,
          })),
        },
      };

      const bracketSize = calculateBracketSize(8);
      const totalRounds = calculateTotalRounds(bracketSize);
      const matches = generateBracketStructure(bracketSize);
      const assignments = assignParticipantsToMatches(bracketSize, 8);

      const records = buildTournamentRecords(
        'tour-1',
        'user123',
        eightPlayerStandings,
        bracketSize,
        totalRounds,
        20,
        matches,
        assignments,
        2,
        testRefreshId
      );

      // Document expected counts for Data Connect writes
      expect(records.rounds).toHaveLength(3); // 8 -> 4 -> 2 -> 1
      expect(records.tournamentEntries).toHaveLength(8);
      expect(records.matchRecords).toHaveLength(7); // 4 + 2 + 1
      expect(records.matchPicks).toHaveLength(8); // 4 matches * 2 picks each

      // Verify no byes with exactly 8 participants
      const byeMatches = records.matchRecords.filter(m => m.isBye);
      expect(byeMatches).toHaveLength(0);
    });
  });

  describe('buildNWayTournamentRecords', () => {
    const mockStandings = {
      league: { id: 12345, name: 'Test 4-Way League' },
      standings: {
        results: [
          { entry: 100, entry_name: 'Team A', player_name: 'Player A', rank: 1, total: 500 },
          { entry: 101, entry_name: 'Team B', player_name: 'Player B', rank: 2, total: 450 },
          { entry: 102, entry_name: 'Team C', player_name: 'Player C', rank: 3, total: 400 },
          { entry: 103, entry_name: 'Team D', player_name: 'Player D', rank: 4, total: 350 },
        ]
      }
    };

    const testRefreshId = 'nway-refresh-id-456';

    it('builds correct 4-way tournament with 4 participants (1 match final)', () => {
      const matchSize = 4;
      const { rounds, totalSlots } = calculateNWayBracket(4, matchSize);
      const matches = generateNWayBracketStructure(matchSize, rounds);
      const assignments = assignParticipantsToNWayMatches(matchSize, totalSlots, 4);

      const records = buildNWayTournamentRecords(
        'test-uuid',
        'user-123',
        mockStandings,
        totalSlots,
        rounds,
        10, // startEvent
        matches,
        assignments,
        matchSize,
        testRefreshId
      );

      expect(records.tournament.fplLeagueId).toBe(12345);
      expect(records.tournament.matchSize).toBe(4);
      expect(records.tournament.totalRounds).toBe(1); // 4 people = 1 round (all in final)
      expect(records.tournamentEntries).toHaveLength(4);
      expect(records.matchRecords).toHaveLength(1); // Single 4-way final
      expect(records.matchPicks).toHaveLength(4); // 4 picks for 1 match
    });

    it('builds correct 4-way tournament with 16 participants (2 rounds)', () => {
      const sixteenPlayerStandings = {
        league: { id: 123, name: 'Test 16 Player League' },
        standings: {
          results: Array(16).fill(null).map((_, i) => ({
            entry: 1000 + i,
            entry_name: `Team ${i + 1}`,
            player_name: `Manager ${i + 1}`,
            rank: i + 1,
            total: 1000 - i * 10,
          })),
        },
      };

      const matchSize = 4;
      const { rounds, totalSlots } = calculateNWayBracket(16, matchSize);
      const matches = generateNWayBracketStructure(matchSize, rounds);
      const assignments = assignParticipantsToNWayMatches(matchSize, totalSlots, 16);

      const records = buildNWayTournamentRecords(
        'test-uuid',
        'user-123',
        sixteenPlayerStandings,
        totalSlots,
        rounds,
        20,
        matches,
        assignments,
        matchSize,
        testRefreshId
      );

      expect(records.tournament.matchSize).toBe(4);
      expect(records.tournament.totalRounds).toBe(2); // 16 -> 4 -> 1
      expect(records.tournamentEntries).toHaveLength(16);
      expect(records.matchRecords).toHaveLength(5); // 4 round1 + 1 final
      expect(records.rounds).toHaveLength(2);
    });

    it('builds correct 3-way tournament with 9 participants (2 rounds)', () => {
      const ninePlayerStandings = {
        league: { id: 456, name: 'Test 9 Player League' },
        standings: {
          results: Array(9).fill(null).map((_, i) => ({
            entry: 2000 + i,
            entry_name: `Team ${i + 1}`,
            player_name: `Manager ${i + 1}`,
            rank: i + 1,
            total: 900 - i * 10,
          })),
        },
      };

      const matchSize = 3;
      const { rounds, totalSlots } = calculateNWayBracket(9, matchSize);
      const matches = generateNWayBracketStructure(matchSize, rounds);
      const assignments = assignParticipantsToNWayMatches(matchSize, totalSlots, 9);

      const records = buildNWayTournamentRecords(
        'test-uuid',
        'user-456',
        ninePlayerStandings,
        totalSlots,
        rounds,
        15,
        matches,
        assignments,
        matchSize,
        testRefreshId
      );

      expect(records.tournament.matchSize).toBe(3);
      expect(records.tournament.totalRounds).toBe(2); // 9 -> 3 -> 1
      expect(records.tournamentEntries).toHaveLength(9);
      expect(records.matchRecords).toHaveLength(4); // 3 round1 + 1 final
      expect(records.matchPicks).toHaveLength(9); // 9 participants in round 1
    });

    it('handles byes in 4-way tournament (10 participants)', () => {
      const tenPlayerStandings = {
        league: { id: 789, name: 'Test 10 Player League' },
        standings: {
          results: Array(10).fill(null).map((_, i) => ({
            entry: 3000 + i,
            entry_name: `Team ${i + 1}`,
            player_name: `Manager ${i + 1}`,
            rank: i + 1,
            total: 1000 - i * 10,
          })),
        },
      };

      const matchSize = 4;
      const { rounds, totalSlots, byeCount } = calculateNWayBracket(10, matchSize);
      const matches = generateNWayBracketStructure(matchSize, rounds);
      const assignments = assignParticipantsToNWayMatches(matchSize, totalSlots, 10);

      expect(totalSlots).toBe(16); // Next power of 4
      expect(byeCount).toBe(6); // 16 - 10 = 6 byes

      const records = buildNWayTournamentRecords(
        'test-uuid',
        'user-789',
        tenPlayerStandings,
        totalSlots,
        rounds,
        25,
        matches,
        assignments,
        matchSize,
        testRefreshId
      );

      expect(records.tournament.matchSize).toBe(4);
      expect(records.tournamentEntries).toHaveLength(10);
      // 6 byes distributed across 4 groups: each group has 2-3 real players
      // No group has only 1 player, so no auto-advance bye matches
      expect(records.matchRecords).toHaveLength(5); // 4 round1 + 1 final
    });

    it('creates bye match when only 1 player in group (4 participants in 4-way)', () => {
      // With 4 participants in a 16-slot 4-way bracket, we get 12 byes
      // Each of the 4 groups gets 3 byes = 1 real player = auto-advance
      const fourPlayerStandings = {
        league: { id: 999, name: 'Test 4 Player 16-Slot League' },
        standings: {
          results: Array(4).fill(null).map((_, i) => ({
            entry: 4000 + i,
            entry_name: `Team ${i + 1}`,
            player_name: `Manager ${i + 1}`,
            rank: i + 1,
            total: 1000 - i * 10,
          })),
        },
      };

      // Force a 16-slot bracket with 4 participants
      const matchSize = 4;
      const totalSlots = 16;
      const rounds = 2;
      const matches = generateNWayBracketStructure(matchSize, rounds);
      const assignments = assignParticipantsToNWayMatches(matchSize, totalSlots, 4);

      const records = buildNWayTournamentRecords(
        'test-uuid',
        'user-999',
        fourPlayerStandings,
        totalSlots,
        rounds,
        30,
        matches,
        assignments,
        matchSize,
        testRefreshId
      );

      // All 4 round 1 matches should be byes (only 1 real player each)
      const byeMatches = records.matchRecords.filter(m => m.isBye);
      expect(byeMatches.length).toBe(4);
    });

    it('includes refreshId in tournamentEntries', () => {
      const matchSize = 4;
      const { rounds, totalSlots } = calculateNWayBracket(4, matchSize);
      const matches = generateNWayBracketStructure(matchSize, rounds);
      const assignments = assignParticipantsToNWayMatches(matchSize, totalSlots, 4);

      const records = buildNWayTournamentRecords(
        'test-uuid',
        'user-123',
        mockStandings,
        totalSlots,
        rounds,
        10,
        matches,
        assignments,
        matchSize,
        testRefreshId
      );

      expect(records.tournamentEntries[0].refreshId).toBe(testRefreshId);
      expect(records.tournamentEntries[0].status).toBe('active');
    });
  });
});
