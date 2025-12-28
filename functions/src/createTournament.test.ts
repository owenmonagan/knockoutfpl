import { describe, it, expect } from 'vitest';
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
