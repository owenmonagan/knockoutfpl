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
  const maxAttempts = 60;
  let attempts = 0;

  console.log('Waiting for Firebase emulators...');

  // Check both Hub (4400) and Auth (9099) to ensure emulators are fully ready
  while (attempts < maxAttempts) {
    try {
      const [hubResponse, authResponse] = await Promise.all([
        fetch('http://127.0.0.1:4400'),
        fetch('http://127.0.0.1:9099'),
      ]);
      if (hubResponse.ok && authResponse.ok) {
        // Both hub and auth are responding - emulators are ready
        console.log('Emulators ready!');
        // Extra delay to ensure all services are fully initialized
        await new Promise((r) => setTimeout(r, 2000));
        return;
      }
    } catch {
      // Not ready yet
    }
    attempts++;
    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error('Emulators did not start in time - ensure Firebase emulators are running (check ports 4400 and 9099)');
}

export default globalSetup;
