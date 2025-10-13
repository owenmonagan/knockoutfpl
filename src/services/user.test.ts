import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User, CreateUserData } from '../types/user';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}));

vi.mock('../lib/firebase', () => ({
  db: {},
}));

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export createUserProfile function', async () => {
    const { createUserProfile } = await import('./user');
    expect(createUserProfile).toBeDefined();
    expect(typeof createUserProfile).toBe('function');
  });

  describe('createUserProfile', () => {
    it('should create a user document in Firestore', async () => {
      const { setDoc } = await import('firebase/firestore');
      const { createUserProfile } = await import('./user');

      const userData: CreateUserData = {
        userId: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      await createUserProfile(userData);

      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('should fetch a user document from Firestore', async () => {
      const { getDoc } = await import('firebase/firestore');
      const { getUserProfile } = await import('./user');

      const mockUserData: User = {
        userId: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        fplTeamId: 158256,
        fplTeamName: "Owen's Team",
        wins: 5,
        losses: 3,
        createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      } as any);

      const result = await getUserProfile('test-uid');

      expect(getDoc).toHaveBeenCalled();
      expect(result).toEqual(mockUserData);
    });

    it('should return null if user document does not exist', async () => {
      const { getDoc } = await import('firebase/firestore');
      const { getUserProfile } = await import('./user');

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getUserProfile('nonexistent-uid');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update a user document in Firestore', async () => {
      const { updateDoc } = await import('firebase/firestore');
      const { updateUserProfile } = await import('./user');

      const updates = {
        displayName: 'Updated Name',
        fplTeamId: 999999,
      };

      await updateUserProfile('test-uid', updates);

      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
