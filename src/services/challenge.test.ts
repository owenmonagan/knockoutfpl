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

  describe('getChallenge', () => {
    it('should fetch a single challenge by ID', async () => {
      const { getDoc, doc, Timestamp } = await import('firebase/firestore');
      const { getChallenge } = await import('./challenge');

      // Mock doc to return a document reference
      vi.mocked(doc).mockReturnValue('challenge-doc-ref' as any);

      // Mock getDoc to return a document snapshot
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'challenge-123',
        data: () => ({
          gameweek: 7,
          status: 'pending',
          creatorUserId: 'user-1',
          creatorFplId: 158256,
          creatorFplTeamName: 'Test Team',
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
        }),
      } as any);

      const challenge = await getChallenge('challenge-123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'challenges', 'challenge-123');
      expect(getDoc).toHaveBeenCalled();
      expect(challenge).toBeDefined();
      expect(challenge?.challengeId).toBe('challenge-123');
      expect(challenge?.gameweek).toBe(7);
      expect(challenge?.status).toBe('pending');
    });
  });

  describe('getUserChallenges', () => {
    it('should be a function that returns a promise', async () => {
      const { getUserChallenges } = await import('./challenge');

      const result = getUserChallenges('user-123');

      expect(result).toBeInstanceOf(Promise);
    });

    it('should query challenges collection', async () => {
      const { query, collection, where, getDocs } = await import('firebase/firestore');
      const { getUserChallenges } = await import('./challenge');

      vi.mocked(collection).mockReturnValue('challenges-ref' as any);
      vi.mocked(query).mockReturnValue('query-ref' as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      await getUserChallenges('user-123');

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'challenges');
    });

    it('should query for challenges where user is creator', async () => {
      const { query, collection, where, getDocs } = await import('firebase/firestore');
      const { getUserChallenges } = await import('./challenge');

      vi.mocked(collection).mockReturnValue('challenges-ref' as any);
      vi.mocked(where).mockReturnValue('where-clause' as any);
      vi.mocked(query).mockReturnValue('query-ref' as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      await getUserChallenges('user-123');

      expect(where).toHaveBeenCalledWith('creatorUserId', '==', 'user-123');
    });
  });
});
