import { Firestore } from '@google-cloud/firestore';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';

// Firebase CLI OAuth client credentials (public - same as firebase-tools uses)
const FIREBASE_CLI_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLI_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';
const PROJECT_ID = 'knockoutfpl-dev';

// Create Firestore client with appropriate credentials
function createFirestoreClient(): Firestore {
  const serviceAccountPath = resolve(process.cwd(), 'service-account.json');

  // Option 1: Use service account if available
  if (existsSync(serviceAccountPath)) {
    console.log('Using service account credentials...');
    return new Firestore({
      projectId: PROJECT_ID,
      keyFilename: serviceAccountPath,
    });
  }

  // Option 2: Try to use Firebase CLI refresh token by creating an ADC file
  const firebaseConfigPath = join(homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (existsSync(firebaseConfigPath)) {
    try {
      const firebaseConfig = JSON.parse(readFileSync(firebaseConfigPath, 'utf-8'));
      const firebaseRefreshToken = firebaseConfig.tokens?.refresh_token;

      if (firebaseRefreshToken) {
        console.log('Using Firebase CLI credentials...');

        // Create ADC file from Firebase CLI token
        const adcDir = join(homedir(), '.config', 'gcloud');
        const adcPath = join(adcDir, 'application_default_credentials.json');

        // Create directory if it doesn't exist
        if (!existsSync(adcDir)) {
          mkdirSync(adcDir, { recursive: true });
        }

        // Write ADC file
        const adcContent = {
          client_id: FIREBASE_CLI_CLIENT_ID,
          client_secret: FIREBASE_CLI_CLIENT_SECRET,
          refresh_token: firebaseRefreshToken,
          type: 'authorized_user',
        };
        writeFileSync(adcPath, JSON.stringify(adcContent, null, 2));
        console.log(`Created ADC at: ${adcPath}`);

        return new Firestore({ projectId: PROJECT_ID });
      }
    } catch (e) {
      console.warn('Could not load Firebase CLI credentials:', e);
    }
  }

  // Option 3: Fallback to Application Default Credentials
  console.log('Using Application Default Credentials...');
  return new Firestore({ projectId: PROJECT_ID });
}

async function listSnapshots() {
  const db = createFirestoreClient();

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
