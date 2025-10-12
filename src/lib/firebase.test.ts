import { describe, it, expect } from 'vitest';

describe('Firebase Configuration', () => {
  it('should export auth instance', async () => {
    const { auth } = await import('./firebase');
    expect(auth).toBeDefined();
    expect(auth).not.toBeNull();
  });
});
