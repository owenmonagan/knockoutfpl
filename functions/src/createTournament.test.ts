import { describe, it, expect } from 'vitest';
import { validateTournamentRequest, validateLeagueStandings, getCurrentGameweek, buildTournamentRecords } from './createTournament';
import { generateBracketStructure, assignParticipantsToMatches, calculateBracketSize, calculateTotalRounds } from './bracketGenerator';

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
  });

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
        assignments
      );

      // Document expected counts for Data Connect writes
      expect(records.rounds).toHaveLength(3); // 8 -> 4 -> 2 -> 1
      expect(records.participants).toHaveLength(8);
      expect(records.matchRecords).toHaveLength(7); // 4 + 2 + 1
      expect(records.matchPicks).toHaveLength(8); // 4 matches * 2 picks each

      // Verify no byes with exactly 8 participants
      const byeMatches = records.matchRecords.filter(m => m.isBye);
      expect(byeMatches).toHaveLength(0);
    });
  });
});
