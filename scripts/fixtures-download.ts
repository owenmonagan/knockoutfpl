import { Firestore, Timestamp } from '@google-cloud/firestore';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';
import type { FPLSnapshot } from '../src/types/fpl-snapshot';
import type { BootstrapResponse, FPLElement } from '../src/types/fpl-api';

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

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: { id?: string; latest?: boolean; gameweek?: number } = {};

  for (const arg of args) {
    if (arg.startsWith('--id=')) {
      options.id = arg.slice(5);
    } else if (arg === '--latest') {
      options.latest = true;
    } else if (arg.startsWith('--gameweek=')) {
      options.gameweek = parseInt(arg.slice(11), 10);
    }
  }

  return options;
}

// Fetch and reassemble snapshot from Firestore
async function fetchSnapshot(
  db: Firestore,
  docId: string
): Promise<FPLSnapshot> {
  const snapshotRef = db.collection('fpl_snapshots').doc(docId);

  console.log(`Fetching snapshot: ${docId}...`);

  // Fetch main document
  const mainDoc = await snapshotRef.get();
  if (!mainDoc.exists) {
    throw new Error(`Snapshot not found: ${docId}`);
  }

  const mainData = mainDoc.data()!;
  console.log(`  ✓ Main document fetched (GW${mainData.gameweek}, ${mainData.gameweekStatus})`);

  // Fetch bootstrap metadata
  const bootstrapMetaDoc = await snapshotRef.collection('bootstrap').doc('metadata').get();
  const bootstrapMeta = bootstrapMetaDoc.data() || { events: [], teams: [], element_types: [] };
  console.log(`  ✓ Bootstrap metadata fetched (${bootstrapMeta.events.length} events, ${bootstrapMeta.teams.length} teams)`);

  // Fetch all element chunks and reassemble
  const elementsSnapshot = await snapshotRef
    .collection('bootstrap')
    .where('startIndex', '>=', 0)
    .orderBy('startIndex')
    .get();

  const elements: FPLElement[] = [];
  for (const doc of elementsSnapshot.docs) {
    if (doc.data().elements) {
      elements.push(...doc.data().elements);
    }
  }
  console.log(`  ✓ Elements reassembled (${elements.length} players from ${elementsSnapshot.size} chunks)`);

  // Fetch fixtures data
  const fixturesDoc = await snapshotRef.collection('data').doc('fixtures').get();
  const fixturesData = fixturesDoc.data() || { fixtures: [], fixturesCurrentGW: [] };
  console.log(`  ✓ Fixtures fetched (${fixturesData.fixtures.length} total, ${fixturesData.fixturesCurrentGW.length} current GW)`);

  // Fetch team data
  const teamsSnapshot = await snapshotRef.collection('teams').get();
  const teamData: FPLSnapshot['teamData'] = {};
  for (const doc of teamsSnapshot.docs) {
    teamData[parseInt(doc.id, 10)] = doc.data() as FPLSnapshot['teamData'][number];
  }
  console.log(`  ✓ Team data fetched (${teamsSnapshot.size} teams)`);

  // Convert Timestamp to ISO string for capturedAt
  const capturedAt =
    mainData.capturedAt instanceof Timestamp
      ? mainData.capturedAt.toDate().toISOString()
      : mainData.capturedAt;

  // Assemble complete bootstrap response
  const bootstrapStatic: BootstrapResponse = {
    events: bootstrapMeta.events,
    teams: bootstrapMeta.teams,
    elements,
    element_types: bootstrapMeta.element_types,
  };

  // Return assembled snapshot
  const snapshot: FPLSnapshot = {
    capturedAt,
    gameweek: mainData.gameweek,
    gameweekStatus: mainData.gameweekStatus,
    leagueId: mainData.leagueId,
    bootstrapStatic,
    fixtures: fixturesData.fixtures,
    fixturesCurrentGW: fixturesData.fixturesCurrentGW,
    liveScores: mainData.liveScores,
    eventStatus: mainData.eventStatus,
    dreamTeam: mainData.dreamTeam,
    setPieceNotes: mainData.setPieceNotes,
    leagueStandings: mainData.leagueStandings,
    teamData,
    playerSummaries: {}, // Empty for now (not stored in current snapshot)
  };

  return snapshot;
}

// Find snapshot by criteria
async function findSnapshot(
  db: Firestore,
  options: { id?: string; latest?: boolean; gameweek?: number }
): Promise<string> {
  if (options.id) {
    return options.id;
  }

  const snapshotsRef = db.collection('fpl_snapshots');
  let query = snapshotsRef.orderBy('capturedAt', 'desc').limit(1);

  if (options.gameweek) {
    query = snapshotsRef
      .where('gameweek', '==', options.gameweek)
      .orderBy('capturedAt', 'desc')
      .limit(1);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    throw new Error(
      options.gameweek
        ? `No snapshots found for gameweek ${options.gameweek}`
        : 'No snapshots found'
    );
  }

  return snapshot.docs[0].id;
}

// Save snapshot to local JSON file
function saveSnapshot(docId: string, snapshot: FPLSnapshot): string {
  const fixturesDir = resolve(process.cwd(), 'test-fixtures', 'snapshots');

  // Create directory if it doesn't exist
  if (!existsSync(fixturesDir)) {
    mkdirSync(fixturesDir, { recursive: true });
    console.log(`Created directory: ${fixturesDir}`);
  }

  const filePath = join(fixturesDir, `${docId}.json`);
  writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');

  return filePath;
}

// Main function
async function downloadSnapshot() {
  const options = parseArgs();

  if (!options.id && !options.latest && !options.gameweek) {
    console.error('Usage:');
    console.error('  npm run fixtures:download -- --id=<snapshot-id>');
    console.error('  npm run fixtures:download -- --latest');
    console.error('  npm run fixtures:download -- --gameweek=<number>');
    process.exit(1);
  }

  const db = createFirestoreClient();

  try {
    // Find snapshot to download
    const docId = await findSnapshot(db, options);
    console.log(`\nDownloading snapshot: ${docId}\n`);

    // Fetch and reassemble snapshot
    const snapshot = await fetchSnapshot(db, docId);

    // Save to local file
    const filePath = saveSnapshot(docId, snapshot);

    console.log(`\n✅ Snapshot downloaded successfully!`);
    console.log(`\nFile: ${filePath}`);
    console.log(`Gameweek: ${snapshot.gameweek}`);
    console.log(`Status: ${snapshot.gameweekStatus}`);
    console.log(`Captured: ${snapshot.capturedAt}`);
    console.log(`Teams: ${Object.keys(snapshot.teamData).length}`);
    console.log(`Players: ${snapshot.bootstrapStatic.elements.length}`);
    console.log(`Fixtures: ${snapshot.fixtures.length}`);
  } catch (error: any) {
    console.error('\n❌ Error downloading snapshot:', error.message);
    process.exit(1);
  }
}

downloadSnapshot();
