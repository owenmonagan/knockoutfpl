// functions/src/captureFloawoSnapshot.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { captureSnapshot } from './snapshotCapture';

const db = admin.firestore();

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

      // Store in Firestore
      await db.collection('fpl_snapshots').doc(docId).set(snapshot);

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

      await db.collection('fpl_snapshots').doc(docId).set(snapshot);

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
