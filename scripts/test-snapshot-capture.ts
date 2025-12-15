// scripts/test-snapshot-capture.ts
// Test script to manually trigger the snapshot capture function

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase config for knockoutfpl-dev
// These are public keys, safe to commit
const firebaseConfig = {
  projectId: 'knockoutfpl-dev',
  // Minimal config needed for callable functions
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');

async function testSnapshotCapture() {
  console.log('Triggering snapshot capture...');
  console.log('Project: knockoutfpl-dev');
  console.log('Region: us-central1');
  console.log('');

  const triggerSnapshot = httpsCallable(functions, 'triggerSnapshotCapture');

  try {
    const result = await triggerSnapshot({});
    console.log('Snapshot captured successfully!');
    console.log('Result:', JSON.stringify(result.data, null, 2));
    return result.data;
  } catch (error: any) {
    console.error('Failed to capture snapshot:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

testSnapshotCapture();
