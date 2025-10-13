import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Challenge, CreateChallengeData } from '../types/challenge';
import { createChallenge } from './challenge';

// Mock Firestore
vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
    fromDate: vi.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
  },
}));

describe('Challenge Types', () => {
  it('should define Challenge type', () => {
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

describe('Challenge Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChallenge', () => {
    it('should create a pending challenge in Firestore', async () => {
      const { addDoc, collection, Timestamp } = await import('firebase/firestore');

      // Mock collection to return a collection reference
      vi.mocked(collection).mockReturnValue('challenges-collection-ref' as any);

      // Mock addDoc to return a document reference
      vi.mocked(addDoc).mockResolvedValue({
        id: 'new-challenge-id',
      } as any);

      const challengeData: CreateChallengeData = {
        userId: 'user-123',
        fplTeamId: 158256,
        fplTeamName: 'Test Team',
        gameweek: 7,
        gameweekDeadline: new Date('2025-10-20T11:30:00Z'),
      };

      const challengeId = await createChallenge(challengeData);

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(), // collection ref
        expect.objectContaining({
          gameweek: 7,
          status: 'pending',
          creatorUserId: 'user-123',
          creatorFplId: 158256,
          creatorFplTeamName: 'Test Team',
          creatorScore: null,
          opponentUserId: null,
          opponentFplId: null,
          opponentFplTeamName: null,
          opponentScore: null,
          winnerId: null,
          isDraw: false,
          gameweekFinished: false,
          completedAt: null,
        })
      );
      expect(challengeId).toBe('new-challenge-id');
    });
  });
});
