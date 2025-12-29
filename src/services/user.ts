import { dataConnect } from '../lib/firebase';
import { connectFplEntry, getUser as getUserQuery, upsertUser } from '@knockoutfpl/dataconnect';
import type { User, CreateUserData } from '../types/user';
import { getFPLTeamInfo } from './fpl';

/**
 * Get user profile from Data Connect
 * Returns a User-compatible object or null if not found
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const result = await getUserQuery(dataConnect, { uid: userId });
    const users = result.data?.users;
    if (users && users.length > 0) {
      const dcUser = users[0];
      // Convert Data Connect user to legacy User type
      // Note: fplTeamName is fetched separately if needed
      return {
        userId: dcUser.uid,
        email: dcUser.email,
        fplTeamId: dcUser.entryId2025 ?? 0,
        fplTeamName: '', // Not stored in Data Connect, fetch from FPL API if needed
        displayName: dcUser.email.split('@')[0], // Derive from email
        wins: 0,
        losses: 0,
        createdAt: dcUser.createdAt,
        updatedAt: dcUser.updatedAt,
      } as User;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a new user profile via Data Connect
 * Fails gracefully if Data Connect is unavailable
 */
export async function createUserProfile(userData: CreateUserData): Promise<void> {
  try {
    await upsertUser(dataConnect, { uid: userData.userId, email: userData.email });
  } catch (error) {
    // Log but don't fail - Data Connect may not be available in all environments
    console.warn('Failed to create user profile in Data Connect:', error);
  }
}

/**
 * Update user profile (limited - mainly for FPL team connection)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'userId' | 'createdAt'>>
): Promise<void> {
  // Get current user to get email (required for upsert)
  const currentUser = await getUserProfile(userId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  // If updating FPL team, use connectFplEntry
  if (updates.fplTeamId) {
    await connectFplEntry(dataConnect, {
      uid: userId,
      email: currentUser.email,
      entryId: updates.fplTeamId,
    });
  }
}

/**
 * Get user's FPL entry ID from Data Connect
 */
export async function getUserEntryId(uid: string): Promise<number | null> {
  const result = await getUserQuery(dataConnect, { uid });
  const users = result.data?.users;
  if (users && users.length > 0) {
    return users[0].entryId2025 ?? null;
  }
  return null;
}

/**
 * Connect FPL team to user profile via Data Connect
 */
export async function connectFPLTeam(uid: string, email: string, fplTeamId: number): Promise<void> {
  // Verify team exists by fetching from FPL API
  await getFPLTeamInfo(fplTeamId);
  // Update user profile with FPL team ID
  await connectFplEntry(dataConnect, { uid, email, entryId: fplTeamId });
}
