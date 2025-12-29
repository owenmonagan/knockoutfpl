import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth, dataConnect } from '../lib/firebase';
import { upsertUser } from '@knockoutfpl/dataconnect';

/**
 * Sync user to Data Connect (non-blocking, logs errors)
 */
async function syncUserToDataConnect(uid: string, email: string): Promise<void> {
  try {
    await upsertUser(dataConnect, { uid, email });
  } catch (error) {
    // Log but don't fail auth if Data Connect is unavailable
    console.warn('Failed to sync user to Data Connect:', error);
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  // Fire-and-forget sync to Data Connect (don't block auth)
  syncUserToDataConnect(credential.user.uid, credential.user.email!);
  return credential;
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  // Fire-and-forget sync to Data Connect (don't block auth)
  syncUserToDataConnect(credential.user.uid, credential.user.email!);
  return credential;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  // Fire-and-forget sync to Data Connect (don't block auth)
  syncUserToDataConnect(credential.user.uid, credential.user.email!);
  return credential;
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
