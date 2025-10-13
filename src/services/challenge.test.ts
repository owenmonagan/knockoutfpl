import { describe, it, expect } from 'vitest';
import { Challenge } from '../types/challenge';

describe('Challenge Types', () => {
  it('should define Challenge type', () => {
    // This test will fail because Challenge type doesn't exist yet
    const challenge: Challenge = {
      challengeId: 'test-id',
      gameweek: 1,
      status: 'pending',
      creatorUserId: 'user-1',
      creatorFplId: 123456,
      creatorFplTeamName: 'Test Team',
      creatorScore: null,
      opponentUserId: null,
      opponentFplId: null,
      opponentFplTeamName: null,
      opponentScore: null,
      winnerId: null,
      isDraw: false,
      gameweekDeadline: null as any,
      gameweekFinished: false,
      completedAt: null,
      createdAt: null as any,
    };

    expect(challenge.challengeId).toBe('test-id');
  });
});
