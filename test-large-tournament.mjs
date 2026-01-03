// Test script for large tournament import
// This tests the createTournament function with league 39776 (36k participants)

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getDataConnect, connectDataConnectEmulator, executeMutation, mutationRef } from 'firebase/data-connect';

const firebaseConfig = {
  apiKey: "AIzaSyCZ2KDHJSRewJ6JLDsIdxYqnzvTFf_IGVc",
  authDomain: "knockoutfpl-dev.firebaseapp.com",
  projectId: "knockoutfpl-dev",
};

const connectorConfig = {
  connector: 'default',
  service: 'knockoutfpl-dev-service',
  location: 'europe-west1',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);  // Default to us-central1
const dataConnect = getDataConnect(app, connectorConfig);

// Connect to emulators
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
connectFunctionsEmulator(functions, 'localhost', 5001);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);

// Helper to upsert user
async function upsertUser(uid, email) {
  const ref = mutationRef(dataConnect, 'UpsertUser', { uid, email });
  return executeMutation(ref);
}

async function testLargeTournament() {
  console.log('=== Testing Large Tournament Import ===\n');

  // First login (or create user if not exists)
  console.log('1. Logging in...');
  let user;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'testuser@knockoutfpl.com', 'TestPass123!');
    user = userCredential.user;
    console.log('   Logged in as:', user.email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('   User not found, creating...');
      const userCredential = await createUserWithEmailAndPassword(auth, 'testuser@knockoutfpl.com', 'TestPass123!');
      user = userCredential.user;
      console.log('   Created and logged in as:', user.email);
    } else {
      console.error('   Login failed:', error.message);
      process.exit(1);
    }
  }

  // Create user in Data Connect (foreign key requirement)
  console.log('\n2. Creating user in Data Connect...');
  try {
    await upsertUser(user.uid, user.email);
    console.log('   User created/updated in Data Connect');
  } catch (error) {
    console.error('   Failed to create user:', error.message);
    // Continue anyway - user might already exist
  }

  // Call createTournament for league 39776
  console.log('\n3. Calling createTournament for league 39776 (36k participants)...');
  const createTournament = httpsCallable(functions, 'createTournament');

  try {
    const result = await createTournament({ fplLeagueId: 39776 });
    console.log('\n4. Response:', JSON.stringify(result.data, null, 2));

    if (result.data.importStatus === 'pending') {
      console.log('\n✅ SUCCESS! Tournament created with background import');
      console.log('   Tournament ID:', result.data.tournamentId);
      console.log('   Participant Count:', result.data.participantCount);
      console.log('   Size Tier:', result.data.size);
      console.log('\n   The import task should now be running in the background.');
      console.log('   Check the functions emulator logs for progress.');
    } else {
      console.log('\n⚠️ Tournament created synchronously (unexpected for 36k league)');
    }
  } catch (error) {
    console.error('\n❌ Error calling createTournament:', error.message);
    if (error.code) console.error('   Error code:', error.code);
    if (error.details) console.error('   Details:', error.details);
  }

  process.exit(0);
}

testLargeTournament();
