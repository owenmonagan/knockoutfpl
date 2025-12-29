import { execSync } from 'child_process';

async function globalSetup() {
  console.log('Running E2E global setup...');

  // Wait for emulators to be ready
  await waitForEmulators();

  // Seed test data
  console.log('Seeding test data...');
  execSync('npm run e2e:seed', { stdio: 'inherit' });

  console.log('Global setup complete!');
}

async function waitForEmulators() {
  const maxAttempts = 30;
  let attempts = 0;

  console.log('Waiting for Firebase emulators...');

  while (attempts < maxAttempts) {
    try {
      const response = await fetch('http://127.0.0.1:9099');
      if (response.ok || response.status === 400) {
        // Auth emulator returns 400 for root path, but that means it's running
        console.log('Emulators ready!');
        return;
      }
    } catch {
      // Not ready yet
    }
    attempts++;
    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error('Emulators did not start in time');
}

export default globalSetup;
