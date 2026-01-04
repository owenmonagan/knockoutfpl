import { describe, it, expect } from 'vitest';
import {
  findSiblingMatch,
  calculateRemainingParticipants,
  getUserStatus,
  getRoundStatus,
  getRoundStatusDisplay,
} from './tournament-utils';
import type { Match, Round } from '@/types/tournament';

describe('tournament-utils', () => {
  describe('findSiblingMatch', () => {
    it('returns null when user match has no sibling (final)', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Final',
          gameweek: 20,
          isComplete: false,
          matches: [{ id: 'final', player1: null, player2: null, winnerId: null, isBye: false }],
        },
      ];
      const userMatch: Match = { id: 'final', player1: null, player2: null, winnerId: null, isBye: false };

      const result = findSiblingMatch(rounds, userMatch, 1);

      expect(result).toBeNull();
    });

    it('finds sibling match in semi-finals', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Semi-Finals',
          gameweek: 20,
          isComplete: false,
          matches: [
            { id: 'sf1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
            { id: 'sf2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
          ],
        },
        {
          roundNumber: 2,
          name: 'Final',
          gameweek: 21,
          isComplete: false,
          matches: [{ id: 'final', player1: null, player2: null, winnerId: null, isBye: false }],
        },
      ];
      const userMatch = rounds[0].matches[0]; // sf1

      const result = findSiblingMatch(rounds, userMatch, 1);

      expect(result).not.toBeNull();
      expect(result?.match.id).toBe('sf2');
      expect(result?.round.name).toBe('Semi-Finals');
    });

    it('finds sibling when user is at odd position', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Semi-Finals',
          gameweek: 20,
          isComplete: false,
          matches: [
            { id: 'sf1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
            { id: 'sf2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
          ],
        },
      ];
      const userMatch = rounds[0].matches[1]; // sf2 (odd position)

      const result = findSiblingMatch(rounds, userMatch, 1);

      expect(result).not.toBeNull();
      expect(result?.match.id).toBe('sf1');
    });

    it('finds correct sibling in quarter-finals', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Quarter-Finals',
          gameweek: 20,
          isComplete: false,
          matches: [
            { id: 'qf1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 8, seed: 8, score: null }, winnerId: null, isBye: false },
            { id: 'qf2', player1: { fplTeamId: 4, seed: 4, score: null }, player2: { fplTeamId: 5, seed: 5, score: null }, winnerId: null, isBye: false },
            { id: 'qf3', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 7, seed: 7, score: null }, winnerId: null, isBye: false },
            { id: 'qf4', player1: { fplTeamId: 3, seed: 3, score: null }, player2: { fplTeamId: 6, seed: 6, score: null }, winnerId: null, isBye: false },
          ],
        },
      ];
      // qf1 (position 0) should pair with qf2 (position 1)
      const userMatch = rounds[0].matches[0];
      const result = findSiblingMatch(rounds, userMatch, 1);
      expect(result?.match.id).toBe('qf2');

      // qf3 (position 2) should pair with qf4 (position 3)
      const userMatch2 = rounds[0].matches[2];
      const result2 = findSiblingMatch(rounds, userMatch2, 1);
      expect(result2?.match.id).toBe('qf4');
    });

    it('returns null when round not found', () => {
      const rounds: Round[] = [];
      const userMatch: Match = { id: 'test', winnerId: null, isBye: false };

      const result = findSiblingMatch(rounds, userMatch, 1);

      expect(result).toBeNull();
    });

    it('returns null when match not found in round', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Semi-Finals',
          gameweek: 20,
          isComplete: false,
          matches: [
            { id: 'sf1', winnerId: null, isBye: false },
          ],
        },
      ];
      const userMatch: Match = { id: 'not-found', winnerId: null, isBye: false };

      const result = findSiblingMatch(rounds, userMatch, 1);

      expect(result).toBeNull();
    });
  });

  describe('calculateRemainingParticipants', () => {
    it('counts participants not eliminated', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Round 1',
          gameweek: 20,
          isComplete: true,
          matches: [
            { id: 'm1', player1: { fplTeamId: 1, seed: 1, score: 50 }, player2: { fplTeamId: 2, seed: 2, score: 40 }, winnerId: 1, isBye: false },
            { id: 'm2', player1: { fplTeamId: 3, seed: 3, score: 60 }, player2: { fplTeamId: 4, seed: 4, score: 55 }, winnerId: 3, isBye: false },
          ],
        },
      ];

      const result = calculateRemainingParticipants(rounds);

      expect(result).toBe(2); // Teams 1 and 3 remain
    });

    it('counts all participants when no matches completed', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Round 1',
          gameweek: 20,
          isComplete: false,
          matches: [
            { id: 'm1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 2, seed: 2, score: null }, winnerId: null, isBye: false },
            { id: 'm2', player1: { fplTeamId: 3, seed: 3, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
          ],
        },
      ];

      const result = calculateRemainingParticipants(rounds);

      expect(result).toBe(4); // All 4 teams remain
    });

    it('handles bye matches correctly', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Round 1',
          gameweek: 20,
          isComplete: true,
          matches: [
            { id: 'm1', player1: { fplTeamId: 1, seed: 1, score: 50 }, player2: null, winnerId: 1, isBye: true },
            { id: 'm2', player1: { fplTeamId: 3, seed: 3, score: 60 }, player2: { fplTeamId: 4, seed: 4, score: 55 }, winnerId: 3, isBye: false },
          ],
        },
      ];

      const result = calculateRemainingParticipants(rounds);

      expect(result).toBe(2); // Team 1 (bye), Team 3 (winner), Team 4 eliminated
    });

    it('returns 0 for empty rounds', () => {
      const result = calculateRemainingParticipants([]);
      expect(result).toBe(0);
    });
  });

  describe('getUserStatus', () => {
    it('returns in when user has no losses', () => {
      const result = getUserStatus(undefined, false);
      expect(result).toBe('in');
    });

    it('returns eliminated with round when user lost', () => {
      const result = getUserStatus(3, false);
      expect(result).toBe('eliminated');
    });

    it('returns winner when tournament complete and user not eliminated', () => {
      const result = getUserStatus(undefined, true);
      expect(result).toBe('winner');
    });

    it('returns eliminated even if tournament complete when user was eliminated', () => {
      const result = getUserStatus(2, true);
      expect(result).toBe('eliminated');
    });
  });

  describe('getRoundStatus', () => {
    it('returns complete when isComplete is true', () => {
      const result = getRoundStatus(15, 20, true);
      expect(result).toBe('complete');
    });

    it('returns complete when isComplete is true even if gameweek matches current', () => {
      const result = getRoundStatus(20, 20, true);
      expect(result).toBe('complete');
    });

    it('returns complete when round gameweek is before current gameweek', () => {
      const result = getRoundStatus(15, 20, false);
      expect(result).toBe('complete');
    });

    it('returns live when round gameweek equals current gameweek', () => {
      const result = getRoundStatus(20, 20, false);
      expect(result).toBe('live');
    });

    it('returns upcoming when round gameweek is after current gameweek', () => {
      const result = getRoundStatus(25, 20, false);
      expect(result).toBe('upcoming');
    });

    it('returns upcoming for future gameweeks', () => {
      const result = getRoundStatus(38, 1, false);
      expect(result).toBe('upcoming');
    });
  });

  describe('getRoundStatusDisplay', () => {
    it('returns Live for live status', () => {
      expect(getRoundStatusDisplay('live')).toBe('Live');
    });

    it('returns Complete for complete status', () => {
      expect(getRoundStatusDisplay('complete')).toBe('Complete');
    });

    it('returns Upcoming for upcoming status', () => {
      expect(getRoundStatusDisplay('upcoming')).toBe('Upcoming');
    });
  });
});
