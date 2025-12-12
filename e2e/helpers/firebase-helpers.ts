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

  adminApp = initializeApp({
    projectId: 'knockoutfpl-dev',
  });

  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

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
