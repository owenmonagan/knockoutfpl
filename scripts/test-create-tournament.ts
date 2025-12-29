#!/usr/bin/env npx tsx
/**
 * Test script to create a tournament via the deployed Cloud Function
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser } from '@knockoutfpl/dataconnect';

const firebaseConfig = {
  apiKey: "AIzaSyCZ2KDHJSRewJ6JLDsIdxYqnzvTFf_IGVc",
  authDomain: "knockoutfpl-dev.firebaseapp.com",
  projectId: "knockoutfpl-dev",
  storageBucket: "knockoutfpl-dev.firebasestorage.app",
  messagingSenderId: "23223093101",
  appId: "1:23223093101:web:1176fe6f832ddfb2eafc64"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const dataConnect = getDataConnect(app, connectorConfig);

// Test credentials from CLAUDE.md
const TEST_EMAIL = 'testuser@knockoutfpl.com';
const TEST_PASSWORD = 'TestPass123!';

async function main() {
  try {
    // Sign in first
    console.log('Signing in as test user...');
    const credential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    console.log('Signed in successfully! UID:', credential.user.uid);

    // Create user in Data Connect (required for foreign key constraint)
    console.log('Creating/updating user in Data Connect...');
    await upsertUser(dataConnect, {
      uid: credential.user.uid,
      email: credential.user.email!,
    });
    console.log('User created/updated in Data Connect!');

    const createTournament = httpsCallable(functions, 'createTournament');

    console.log('Creating tournament for FLOAWO league (634129)...');
    const result = await createTournament({ fplLeagueId: 634129 });
    console.log('Success!', JSON.stringify(result.data, null, 2));
  } catch (error: any) {
    console.error('Error:', error.code, error.message);
    if (error.details) console.error('Details:', error.details);
  }
}

main();
