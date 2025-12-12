import { describe, it, expect } from 'vitest';
import { calculateChallengeStats } from './challengeStats';
import type { Challenge } from '../types/challenge';
import { Timestamp } from 'firebase/firestore';

const mockChallenge: Challenge = {
  challengeId: 'test-id',
  gameweek: 1,
  status: 'pending',
  creatorUserId: 'user-1',
  creatorFplId: 123456,
  creatorFplTeamName: 'Team 1',
  creatorScore: null,
  opponentUserId: null,
  opponentFplId: null,
  opponentFplTeamName: null,
  opponentScore: null,
  winnerId: null,
  isDraw: false,
  gameweekDeadline: Timestamp.now(),
  gameweekFinished: false,
  completedAt: null,
  createdAt: Timestamp.now(),
};

describe('calculateChallengeStats', () => {
  it('should return zero stats for empty challenges array', () => {
    const stats = calculateChallengeStats([], 'user-id');

    expect(stats).toEqual({
      total: 0,
      wins: 0,
      losses: 0,
      winRate: 'N/A',
    });
  });

  it('should calculate total from challenges length', () => {
    const challenges = [mockChallenge, { ...mockChallenge, challengeId: 'test-id-2' }];
    const stats = calculateChallengeStats(challenges, 'user-id');

    expect(stats.total).toBe(2);
  });

  it('should calculate wins correctly', () => {
    const wonChallenge: Challenge = {
      ...mockChallenge,
      status: 'completed',
      winnerId: 'user-1',
    };
    const lostChallenge: Challenge = {
      ...mockChallenge,
      challengeId: 'test-id-2',
      status: 'completed',
      winnerId: 'user-2',
    };
    const challenges = [wonChallenge, lostChallenge];
    const stats = calculateChallengeStats(challenges, 'user-1');

    expect(stats.wins).toBe(1);
  });

  it('should calculate losses correctly', () => {
    const wonChallenge: Challenge = {
      ...mockChallenge,
      status: 'completed',
      winnerId: 'user-1',
    };
    const lostChallenge: Challenge = {
      ...mockChallenge,
      challengeId: 'test-id-2',
      status: 'completed',
      winnerId: 'user-2',
      isDraw: false,
    };
    const challenges = [wonChallenge, lostChallenge];
    const stats = calculateChallengeStats(challenges, 'user-1');

    expect(stats.losses).toBe(1);
  });

  it('should calculate winRate as percentage', () => {
    const wonChallenge: Challenge = {
      ...mockChallenge,
      status: 'completed',
      winnerId: 'user-1',
    };
    const lostChallenge: Challenge = {
      ...mockChallenge,
      challengeId: 'test-id-2',
      status: 'completed',
      winnerId: 'user-2',
      isDraw: false,
    };
    const challenges = [wonChallenge, lostChallenge];
    const stats = calculateChallengeStats(challenges, 'user-1');

    expect(stats.winRate).toBe('50%');
  });
});
