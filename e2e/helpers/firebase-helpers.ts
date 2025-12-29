import { initializeApp, deleteApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let firestoreInstance: Firestore | null = null;

export async function connectToFirebaseEmulator(): Promise<Firestore> {
  if (adminApp) {
    await deleteApp(adminApp);
    adminApp = null;
    firestoreInstance = null;
  }

  // Set emulator environment variables BEFORE initializing the app
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

  adminApp = initializeApp({
    projectId: 'knockoutfpl-dev',
  });

  firestoreInstance = getFirestore(adminApp);

  return firestoreInstance;
}

export async function disconnectFirebase(): Promise<void> {
  if (adminApp) {
    await deleteApp(adminApp);
    adminApp = null;
    firestoreInstance = null;
  }
}
