import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, join } from 'path';

function parseArgs(): { source?: string; name?: string } {
  const [source, name] = process.argv.slice(2);
  return { source, name };
}

function createScenario() {
  const args = parseArgs();

  if (!args.source || !args.name) {
    console.log('Usage:');
    console.log('  npm run fixtures:scenario <snapshot-id> <scenario-name>');
    console.log('');
    console.log('Example:');
    console.log('  npm run fixtures:scenario gw16-2025-12-15T14-00 gw-finished');
    console.log('');
    console.log('This copies the snapshot to test-fixtures/scenarios/<name>.json');
    process.exit(1);
  }

  const snapshotsDir = resolve(process.cwd(), 'test-fixtures/snapshots');
  const scenariosDir = resolve(process.cwd(), 'test-fixtures/scenarios');

  // Try to find source file
  let sourcePath = join(snapshotsDir, `${args.source}.json`);
  if (!existsSync(sourcePath)) {
    sourcePath = join(snapshotsDir, args.source);
    if (!existsSync(sourcePath)) {
      console.error(`Source snapshot not found: ${args.source}`);
      console.error(`Looked in: ${snapshotsDir}`);
      console.error('\nRun "npm run fixtures:download -- --latest" first.');
      process.exit(1);
    }
  }

  const destPath = join(scenariosDir, `${args.name}.json`);

  if (existsSync(destPath)) {
    console.log(`Scenario ${args.name} already exists. Overwriting...`);
  }

  copyFileSync(sourcePath, destPath);
  console.log(`Created scenario: ${destPath}`);

  // Show snapshot info
  const snapshot = JSON.parse(readFileSync(destPath, 'utf-8'));
  console.log(`  Source: ${args.source}`);
  console.log(`  Gameweek: ${snapshot.gameweek}`);
  console.log(`  Status: ${snapshot.gameweekStatus}`);
  console.log(`  Teams: ${Object.keys(snapshot.teamData || {}).length}`);
}

createScenario();
