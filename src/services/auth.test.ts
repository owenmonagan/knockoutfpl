import { describe, it, expect } from 'vitest';
import { signUpWithEmail, signInWithEmail } from './auth';

describe('Authentication Service', () => {
  it('should export signUpWithEmail function', () => {
    expect(signUpWithEmail).toBeDefined();
    expect(typeof signUpWithEmail).toBe('function');
  });

  it('should export signInWithEmail function', () => {
    expect(signInWithEmail).toBeDefined();
    expect(typeof signInWithEmail).toBe('function');
  });
});
