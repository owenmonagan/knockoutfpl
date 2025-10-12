import { describe, it, expect } from 'vitest';
import { signUpWithEmail, signInWithEmail, signOut, getCurrentUser } from './auth';

describe('Authentication Service', () => {
  it('should export signUpWithEmail function', () => {
    expect(signUpWithEmail).toBeDefined();
    expect(typeof signUpWithEmail).toBe('function');
  });

  it('should export signInWithEmail function', () => {
    expect(signInWithEmail).toBeDefined();
    expect(typeof signInWithEmail).toBe('function');
  });

  it('should export signOut function', () => {
    expect(signOut).toBeDefined();
    expect(typeof signOut).toBe('function');
  });

  it('should export getCurrentUser function', () => {
    expect(getCurrentUser).toBeDefined();
    expect(typeof getCurrentUser).toBe('function');
  });
});
