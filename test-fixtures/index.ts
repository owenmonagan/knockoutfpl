import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join, basename } from 'path';
import type { FPLSnapshot } from '../src/types/fpl-snapshot';

const SCENARIOS_DIR = resolve(__dirname, 'scenarios');
const SNAPSHOTS_DIR = resolve(__dirname, 'snapshots');

export function loadScenario(name: string): FPLSnapshot {
  const filePath = join(SCENARIOS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    const available = listScenarios();
    throw new Error(
      `Scenario not found: ${name}\n` +
      `Available scenarios: ${available.join(', ') || 'none'}\n` +
      `Create one with: npm run fixtures:scenario <snapshot-id> ${name}`
    );
  }
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as FPLSnapshot;
}

export function loadSnapshot(id: string): FPLSnapshot {
  const filePath = join(SNAPSHOTS_DIR, `${id}.json`);
  if (!existsSync(filePath)) {
    throw new Error(
      `Snapshot not found: ${id}\n` +
      `Download it with: npm run fixtures:download -- --id=${id}`
    );
  }
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as FPLSnapshot;
}

export function listScenarios(): string[] {
  if (!existsSync(SCENARIOS_DIR)) return [];
  return readdirSync(SCENARIOS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => basename(f, '.json'));
}

export function listSnapshots(): string[] {
  if (!existsSync(SNAPSHOTS_DIR)) return [];
  return readdirSync(SNAPSHOTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => basename(f, '.json'));
}

export type { FPLSnapshot, GameweekStatus, TeamSnapshotData } from '../src/types/fpl-snapshot';
