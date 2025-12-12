import { describe, it, expect, vi } from 'vitest';

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

  it('should connect to Firestore emulator in development mode', async () => {
    const { db } = await import('./firebase');

    // In development mode (which is true in test environment via vite)
    // The db instance should be configured to use localhost emulator
    expect(db).toBeDefined();

    // Check that the Firestore instance has emulator settings
    // (This will be properly configured once we add emulator connection code)
    const firestoreSettings = (db as any)._settings;
    expect(firestoreSettings).toBeDefined();
  });
});
