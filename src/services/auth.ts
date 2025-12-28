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
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await upsertUser(dataConnect, { uid: credential.user.uid, email: credential.user.email! });
  return credential;
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await upsertUser(dataConnect, { uid: credential.user.uid, email: credential.user.email! });
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
  await upsertUser(dataConnect, { uid: credential.user.uid, email: credential.user.email! });
  return credential;
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
