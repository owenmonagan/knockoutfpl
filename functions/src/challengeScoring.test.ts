import { describe, it, expect, vi } from 'vitest';
import { findCompletableChallenges, determineWinner, scoreChallenge } from './challengeScoring';

describe('Challenge Scoring', () => {
  describe('findCompletableChallenges', () => {
    it('should find challenges ready for scoring', async () => {
      const challenges = await findCompletableChallenges();
      expect(Array.isArray(challenges)).toBe(true);
    });
  });

  describe('determineWinner', () => {
    it('should return creator as winner when creator score is higher', () => {
      const result = determineWinner(78, 76, 'user1', 'user2');
      expect(result.winnerId).toBe('user1');
      expect(result.isDraw).toBe(false);
    });

    it('should return opponent as winner when opponent score is higher', () => {
      const result = determineWinner(76, 78, 'user1', 'user2');
      expect(result.winnerId).toBe('user2');
      expect(result.isDraw).toBe(false);
    });

    it('should return draw when scores are equal', () => {
      const result = determineWinner(78, 78, 'user1', 'user2');
      expect(result.winnerId).toBe(null);
      expect(result.isDraw).toBe(true);
    });
  });

  describe('scoreChallenge', () => {
    it('should fetch scores and determine winner', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          json: async () => ({ entry_history: { points: 78 } }), // Creator score
        })
        .mockResolvedValueOnce({
          json: async () => ({ entry_history: { points: 76 } }), // Opponent score
        });
      global.fetch = mockFetch;

      const challenge = {
        challengeId: 'challenge123',
        gameweek: 7,
        creatorFplId: 158256,
        creatorUserId: 'user1',
        opponentFplId: 999999,
        opponentUserId: 'user2',
      };

      const result = await scoreChallenge(challenge);

      expect(result.creatorScore).toBe(78);
      expect(result.opponentScore).toBe(76);
      expect(result.winnerId).toBe('user1');
      expect(result.isDraw).toBe(false);
    });
  });
});
