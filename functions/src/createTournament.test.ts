import { describe, it, expect } from 'vitest';
import { validateTournamentRequest, validateLeagueStandings, getCurrentGameweek } from './createTournament';

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
});
