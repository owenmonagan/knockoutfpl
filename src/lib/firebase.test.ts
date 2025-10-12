import { describe, it, expect } from 'vitest';

describe('Firebase Configuration', () => {
  it('should export auth instance', async () => {
    const { auth } = await import('./firebase');
    expect(auth).toBeDefined();
    expect(auth).not.toBeNull();
  });

  it('should export firestore instance', async () => {
    const { db } = await import('./firebase');
    expect(db).toBeDefined();
    expect(db).not.toBeNull();
  });

  it('should export functions instance', async () => {
    const { functions } = await import('./firebase');
    expect(functions).toBeDefined();
    expect(functions).not.toBeNull();
  });
});
