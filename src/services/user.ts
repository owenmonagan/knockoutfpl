import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CreateUserData } from '../types/user';

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
