import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CreateUserData, User } from '../types/user';
import { getFPLTeamInfo } from './fpl';

/**
 * Create a new user profile in Firestore
 */
export async function createUserProfile(userData: CreateUserData): Promise<void> {
  const userRef = doc(db, 'users', userData.userId);
  const now = Timestamp.now();

  await setDoc(userRef, {
    userId: userData.userId,
    email: userData.email,
    displayName: userData.displayName,
    fplTeamId: 0,
    fplTeamName: '',
    wins: 0,
    losses: 0,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Get a user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data() as User;
}

/**
 * Update a user profile in Firestore
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'userId' | 'createdAt'>>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const now = Timestamp.now();

  await updateDoc(userRef, {
    ...updates,
    updatedAt: now,
  });
}

/**
 * Connect FPL team to user profile
 */
export async function connectFPLTeam(userId: string, fplTeamId: number): Promise<void> {
  // Fetch team info from FPL API to verify team exists
  const teamInfo = await getFPLTeamInfo(fplTeamId);

  // Update user profile with FPL team info
  await updateUserProfile(userId, {
    fplTeamId: teamInfo.teamId,
    fplTeamName: teamInfo.teamName,
  });
}
