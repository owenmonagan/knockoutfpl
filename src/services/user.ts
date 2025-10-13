import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CreateUserData, User } from '../types/user';

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
