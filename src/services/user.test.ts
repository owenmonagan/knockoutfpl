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
});
