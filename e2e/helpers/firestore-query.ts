import { getFirestore } from 'firebase-admin/firestore';

/**
 * DATABASE STATE VERIFICATION - SOURCE OF TRUTH
 *
 * These functions query Firestore directly to verify the database state.
 */

/**
 * Gets user document from Firestore
 */
export async function getUserFromFirestore(userId: string) {
  const db = getFirestore();

  const doc = await db.collection('users').doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    userId: doc.id,
    ...doc.data(),
  };
}

/**
 * Gets tournament document from Firestore
 */
export async function getTournamentFromFirestore(tournamentId: string) {
  const db = getFirestore();

  const doc = await db.collection('tournaments').doc(tournamentId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    tournamentId: doc.id,
    ...doc.data(),
  };
}
