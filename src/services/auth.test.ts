import { describe, it, expect } from 'vitest';
import { signUpWithEmail } from './auth';

describe('Authentication Service', () => {
  it('should export signUpWithEmail function', () => {
    expect(signUpWithEmail).toBeDefined();
    expect(typeof signUpWithEmail).toBe('function');
  });
});
