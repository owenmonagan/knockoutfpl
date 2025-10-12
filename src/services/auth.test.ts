import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserCredential, User } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null })),
}));

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export signUpWithEmail function', async () => {
    const { signUpWithEmail } = await import('./auth');
    expect(signUpWithEmail).toBeDefined();
    expect(typeof signUpWithEmail).toBe('function');
  });

  it('should export signInWithEmail function', async () => {
    const { signInWithEmail } = await import('./auth');
    expect(signInWithEmail).toBeDefined();
    expect(typeof signInWithEmail).toBe('function');
  });

  it('should export signOut function', async () => {
    const { signOut } = await import('./auth');
    expect(signOut).toBeDefined();
    expect(typeof signOut).toBe('function');
  });

  it('should export getCurrentUser function', async () => {
    const { getCurrentUser } = await import('./auth');
    expect(getCurrentUser).toBeDefined();
    expect(typeof getCurrentUser).toBe('function');
  });

  describe('signUpWithEmail', () => {
    it('should call createUserWithEmailAndPassword and return UserCredential', async () => {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { signUpWithEmail } = await import('./auth');

      const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
      const mockUserCredential: UserCredential = {
        user: mockUser,
      } as UserCredential;

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(mockUserCredential);

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(result).toBeDefined();
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('signInWithEmail', () => {
    it('should call signInWithEmailAndPassword and return UserCredential', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { signInWithEmail } = await import('./auth');

      const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
      const mockUserCredential: UserCredential = {
        user: mockUser,
      } as UserCredential;

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockUserCredential);

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(result).toBeDefined();
      expect(result.user.uid).toBe('test-uid');
    });
  });

  describe('signOut', () => {
    it('should call Firebase signOut', async () => {
      const firebaseAuth = await import('firebase/auth');
      const { signOut: authSignOut } = await import('./auth');

      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      await authSignOut();

      expect(firebaseAuth.signOut).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user from auth.currentUser', async () => {
      const { auth } = await import('../lib/firebase');
      const { getCurrentUser } = await import('./auth');

      const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
      Object.defineProperty(auth, 'currentUser', {
        value: mockUser,
        writable: true,
      });

      const result = getCurrentUser();

      expect(result).toBe(mockUser);
      expect(result?.uid).toBe('test-uid');
    });
  });
});
