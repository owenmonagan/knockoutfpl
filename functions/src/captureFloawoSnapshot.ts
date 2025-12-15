// functions/src/captureFloawoSnapshot.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { captureSnapshot } from './snapshotCapture';
import type { FPLSnapshot } from './types/fplSnapshot';

const db = admin.firestore();

/**
 * Store snapshot split across multiple documents to avoid 1MB limit.
 * Structure:
 * - fpl_snapshots/{docId} - metadata + league standings
 * - fpl_snapshots/{docId}/bootstrap/data - bootstrap static data
 * - fpl_snapshots/{docId}/fixtures/data - fixtures data
 * - fpl_snapshots/{docId}/teams/{teamId} - per-team data
 */
async function storeSnapshot(snapshot: FPLSnapshot, docId: string): Promise<void> {
  const batch = db.batch();
  const snapshotRef = db.collection('fpl_snapshots').doc(docId);

  // Main document: metadata + small data
  batch.set(snapshotRef, {
    capturedAt: snapshot.capturedAt,
    gameweek: snapshot.gameweek,
    gameweekStatus: snapshot.gameweekStatus,
    leagueId: snapshot.leagueId,
    leagueStandings: snapshot.leagueStandings,
    eventStatus: snapshot.eventStatus,
    liveScores: snapshot.liveScores,
    dreamTeam: snapshot.dreamTeam,
    setPieceNotes: snapshot.setPieceNotes,
    teamCount: Object.keys(snapshot.teamData).length,
  });

  await batch.commit();

  // Bootstrap data is too large (~1.7MB) - split into multiple documents
  // Elements (players) is the largest array
  const bootstrapBatch = db.batch();

  // Bootstrap metadata (events, teams, element_types - smaller data)
  bootstrapBatch.set(snapshotRef.collection('bootstrap').doc('metadata'), {
    events: snapshot.bootstrapStatic.events,
    teams: snapshot.bootstrapStatic.teams,
    element_types: snapshot.bootstrapStatic.element_types,
  });

  await bootstrapBatch.commit();

  // Split elements (players) into chunks of ~100 each to stay under 1MB
  const elements = snapshot.bootstrapStatic.elements;
  const CHUNK_SIZE = 100;
  const elementBatches: admin.firestore.WriteBatch[] = [];
  let currentElementBatch = db.batch();
  let elementOpCount = 0;

  for (let i = 0; i < elements.length; i += CHUNK_SIZE) {
    const chunk = elements.slice(i, i + CHUNK_SIZE);
    const chunkIndex = Math.floor(i / CHUNK_SIZE);
    currentElementBatch.set(snapshotRef.collection('bootstrap').doc(`elements_${chunkIndex}`), {
      elements: chunk,
      startIndex: i,
      endIndex: Math.min(i + CHUNK_SIZE, elements.length),
    });
    elementOpCount++;

    if (elementOpCount >= 400) {
      elementBatches.push(currentElementBatch);
      currentElementBatch = db.batch();
      elementOpCount = 0;
    }
  }

  if (elementOpCount > 0) {
    elementBatches.push(currentElementBatch);
  }

  await Promise.all(elementBatches.map((b) => b.commit()));

  // Fixtures data in subcollection
  const fixturesBatch = db.batch();
  fixturesBatch.set(snapshotRef.collection('data').doc('fixtures'), {
    fixtures: snapshot.fixtures,
    fixturesCurrentGW: snapshot.fixturesCurrentGW,
  });

  await fixturesBatch.commit();

  // Store team data separately (may need multiple batches)
  const teamIds = Object.keys(snapshot.teamData);
  const teamBatches: admin.firestore.WriteBatch[] = [];
  let currentBatch = db.batch();
  let opCount = 0;

  for (const teamId of teamIds) {
    const teamRef = snapshotRef.collection('teams').doc(teamId);
    currentBatch.set(teamRef, snapshot.teamData[Number(teamId)]);
    opCount++;

    // Firestore batch limit is 500 operations
    if (opCount >= 400) {
      teamBatches.push(currentBatch);
      currentBatch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    teamBatches.push(currentBatch);
  }

  // Commit all team batches
  await Promise.all(teamBatches.map((b) => b.commit()));
}

/**
 * Scheduled function to capture FPL API snapshot for FLOAWO league.
 * Runs every hour from 11:00 to 23:00 GMT (covers all match times).
 *
 * Schedule: "0 11-23 * * *" means minute 0, hours 11-23, every day
 */
export const captureFloawoSnapshot = onSchedule(
  {
    schedule: '0 11-23 * * *',
    timeZone: 'Europe/London',
    retryCount: 3,
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async () => {
    console.log('Starting FLOAWO snapshot capture...');

    try {
      const snapshot = await captureSnapshot();

      // Generate document ID: gw{N}-{ISO timestamp}
      const timestamp = snapshot.capturedAt.toDate().toISOString().slice(0, 16).replace(':', '-');
      const docId = `gw${snapshot.gameweek}-${timestamp}`;

      // Store split across multiple documents
      await storeSnapshot(snapshot, docId);

      console.log(`Snapshot captured successfully: ${docId}`);
      console.log(`Gameweek: ${snapshot.gameweek}, Status: ${snapshot.gameweekStatus}`);
      console.log(`Teams captured: ${Object.keys(snapshot.teamData).length}`);
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
      throw error; // Re-throw to trigger retry
    }
  }
);

/**
 * Manual trigger for snapshot capture (for testing/debugging).
 * Call via Firebase SDK or curl.
 */
export const triggerSnapshotCapture = onCall(
  { memory: '512MiB', timeoutSeconds: 120 },
  async () => {
    console.log('Manual snapshot capture triggered');

    try {
      const snapshot = await captureSnapshot();

      const timestamp = snapshot.capturedAt.toDate().toISOString().slice(0, 16).replace(':', '-');
      const docId = `gw${snapshot.gameweek}-${timestamp}`;

      // Store split across multiple documents
      await storeSnapshot(snapshot, docId);

      return {
        success: true,
        docId,
        gameweek: snapshot.gameweek,
        gameweekStatus: snapshot.gameweekStatus,
        teamsCount: Object.keys(snapshot.teamData).length,
      };
    } catch (error: any) {
      console.error('Manual snapshot capture failed:', error);
      throw new HttpsError('internal', 'Snapshot capture failed', { message: error.message });
    }
  }
);
