// Test script for small tournament creation (to verify emulator works)
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCZ2KDHJSRewJ6JLDsIdxYqnzvTFf_IGVc",
  authDomain: "knockoutfpl-dev.firebaseapp.com",
  projectId: "knockoutfpl-dev",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

connectFunctionsEmulator(functions, 'localhost', 5001);

async function test() {
  console.log('Logging in...');
  await signInWithEmailAndPassword(auth, 'testuser@knockoutfpl.com', 'TestPass123!');
  
  // Try a small league (need to find one)
  console.log('Calling createTournament for a small league (314)...');
  const createTournament = httpsCallable(functions, 'createTournament');
  
  try {
    const result = await createTournament({ fplLeagueId: 314 });
    console.log('Result:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message, error.code);
  }
  
  process.exit(0);
}

test();
