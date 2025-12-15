import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin
function initFirebase() {
  const serviceAccountPath = resolve(process.cwd(), 'service-account.json');

  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf-8')
    ) as ServiceAccount;
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Use Application Default Credentials (works with gcloud auth)
    initializeApp({ projectId: 'knockoutfpl' });
  }
}

async function listSnapshots() {
  initFirebase();
  const db = getFirestore();

  console.log('Fetching snapshots from Firestore...\n');

  const snapshotsRef = db.collection('fpl_snapshots');
  const snapshot = await snapshotsRef.orderBy('capturedAt', 'desc').get();

  if (snapshot.empty) {
    console.log('No snapshots found in Firestore.');
    console.log('Run the triggerSnapshotCapture function to capture a snapshot.');
    return;
  }

  console.log(`Found ${snapshot.size} snapshots:\n`);
  console.log('ID                              | GW | Status       | Captured At');
  console.log('--------------------------------|----|--------------|-----------------------');

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const capturedAt = data.capturedAt?.toDate?.()?.toISOString() || 'unknown';
    const status = (data.gameweekStatus || 'unknown').padEnd(12);
    const gw = String(data.gameweek || '?').padStart(2);

    console.log(`${doc.id.padEnd(31)} | ${gw} | ${status} | ${capturedAt}`);
  }

  console.log('\nTo download a snapshot:');
  console.log('  npm run fixtures:download -- --id=<snapshot-id>');
  console.log('  npm run fixtures:download -- --latest');
}

listSnapshots().catch((error) => {
  console.error('Error listing snapshots:', error);
  process.exit(1);
});
