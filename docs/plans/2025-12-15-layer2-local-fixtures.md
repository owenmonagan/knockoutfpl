# Layer 2: Local Fixtures Tooling - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build CLI tools to download FPL snapshots from Firestore to local JSON files for offline testing and CI, plus a fixture loader for easy test consumption.

**Architecture:** CLI scripts download snapshots stored in Firestore subcollections (split due to 1MB limit), reassemble them into complete JSON files, and store them locally. A TypeScript loader provides type-safe access to fixtures for tests.

**Tech Stack:** TypeScript, Firebase Admin SDK, Node.js CLI scripts, Vitest

---

## Prerequisites

Before starting, verify Layer 1 is deployed and has captured at least one snapshot:

```bash
# List snapshots in Firestore (will be built in Task 3)
firebase firestore:export --collection=fpl_snapshots
```

Or check Firebase Console > Firestore > `fpl_snapshots` collection.

---

## Task 1: Create Shared FPLSnapshot Types

**Files:**
- Create: `src/types/fpl-snapshot.ts`
- Create: `src/types/fpl-api.ts`
- Test: `src/types/fpl-snapshot.test.ts`

**Rationale:** We need the FPLSnapshot types in the frontend for test utilities. Copy essential types from functions to share between both codebases.

### Step 1: Write test for type imports

```typescript
// src/types/fpl-snapshot.test.ts
import { describe, it, expect } from 'vitest';
import type { FPLSnapshot, GameweekStatus, TeamSnapshotData } from './fpl-snapshot';
import type { BootstrapResponse, FixtureResponse, PicksResponse } from './fpl-api';

describe('FPL Snapshot Types', () => {
  it('should allow valid FPLSnapshot structure', () => {
    const snapshot: FPLSnapshot = {
      capturedAt: '2025-12-15T14:00:00Z',
      gameweek: 16,
      gameweekStatus: 'in_progress',
      leagueId: 634129,
      bootstrapStatic: { events: [], teams: [], elements: [], element_types: [] },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [] },
      dreamTeam: null,
      setPieceNotes: { teams: [] },
      leagueStandings: { league: { id: 634129, name: 'FLOAWO' }, standings: { results: [] } },
      teamData: {},
      playerSummaries: {},
    };
    expect(snapshot.gameweek).toBe(16);
  });

  it('should validate GameweekStatus enum', () => {
    const statuses: GameweekStatus[] = ['not_started', 'in_progress', 'finished'];
    expect(statuses).toContain('in_progress');
  });

  it('should allow TeamSnapshotData with nested picks', () => {
    const teamData: TeamSnapshotData = {
      entry: {
        id: 158256,
        name: 'Test Team',
        player_first_name: 'Test',
        player_last_name: 'User',
        summary_overall_points: 1000,
        summary_overall_rank: 50000,
        summary_event_points: 65,
        summary_event_rank: 100000,
        last_deadline_value: 1005,
      },
      history: { current: [], chips: [] },
      transfers: [],
      picks: {
        16: {
          picks: [],
          entry_history: { event: 16, points: 65, total_points: 1000, rank: 100000 },
          active_chip: null,
        },
      },
    };
    expect(teamData.entry.id).toBe(158256);
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- --run src/types/fpl-snapshot.test.ts`
Expected: FAIL with "Cannot find module './fpl-snapshot'"

### Step 3: Create FPL API types file

```typescript
// src/types/fpl-api.ts

// === BOOTSTRAP STATIC ===

export interface FPLEvent {
  id: number;
  name: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
  deadline_time: string;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
}

export interface FPLElement {
  id: number;
  web_name: string;
  element_type: number;
  team: number;
  now_cost: number;
}

export interface FPLElementType {
  id: number;
  singular_name: string;
  plural_name: string;
}

export interface BootstrapResponse {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: FPLElement[];
  element_types: FPLElementType[];
}

// === FIXTURES ===

export interface FixtureResponse {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  started: boolean;
  finished: boolean;
  minutes: number;
  kickoff_time: string;
}

// === LIVE SCORES ===

export interface LiveElementStats {
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
}

export interface LiveElement {
  id: number;
  stats: LiveElementStats;
}

export interface LiveResponse {
  elements: LiveElement[];
}

// === EVENT STATUS ===

export interface EventStatusItem {
  event: number;
  points: string;
  bonus_added: boolean;
}

export interface EventStatusResponse {
  status: EventStatusItem[];
}

// === DREAM TEAM ===

export interface DreamTeamPick {
  element: number;
  points: number;
  position: number;
}

export interface DreamTeamResponse {
  top_player: { id: number; points: number } | null;
  team: DreamTeamPick[];
}

// === SET PIECE NOTES ===

export interface SetPieceResponse {
  teams: Array<{
    id: number;
    notes: Array<{ info_message: string }>;
  }>;
}

// === LEAGUE STANDINGS ===

export interface LeagueInfo {
  id: number;
  name: string;
}

export interface LeagueStandingEntry {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

export interface LeagueStandingsResponse {
  league: LeagueInfo;
  standings: {
    results: LeagueStandingEntry[];
  };
}

// === ENTRY (TEAM INFO) ===

export interface EntryResponse {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  last_deadline_value: number;
}

// === HISTORY ===

export interface HistoryEvent {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  overall_rank: number;
}

export interface HistoryChip {
  name: string;
  event: number;
}

export interface HistoryResponse {
  current: HistoryEvent[];
  chips: HistoryChip[];
}

// === TRANSFERS ===

export interface TransferItem {
  element_in: number;
  element_out: number;
  event: number;
  time: string;
}

export type TransferResponse = TransferItem[];

// === PICKS ===

export interface PickItem {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface PicksEntryHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
}

export interface PicksResponse {
  picks: PickItem[];
  entry_history: PicksEntryHistory;
  active_chip: string | null;
}

// === ELEMENT SUMMARY ===

export interface ElementSummaryFixture {
  event: number;
  is_home: boolean;
  difficulty: number;
}

export interface ElementSummaryHistory {
  element: number;
  fixture: number;
  total_points: number;
  round: number;
}

export interface ElementSummaryResponse {
  fixtures: ElementSummaryFixture[];
  history: ElementSummaryHistory[];
}
```

### Step 4: Create FPL Snapshot types file

```typescript
// src/types/fpl-snapshot.ts
import type {
  BootstrapResponse,
  FixtureResponse,
  LiveResponse,
  EventStatusResponse,
  DreamTeamResponse,
  SetPieceResponse,
  LeagueStandingsResponse,
  EntryResponse,
  HistoryResponse,
  TransferResponse,
  PicksResponse,
  ElementSummaryResponse,
} from './fpl-api';

export type GameweekStatus = 'not_started' | 'in_progress' | 'finished';

export interface TeamSnapshotData {
  entry: EntryResponse;
  history: HistoryResponse;
  transfers: TransferResponse;
  picks: {
    [gameweek: number]: PicksResponse;
  };
}

export interface FPLSnapshot {
  // ISO string when loaded from JSON, Timestamp when from Firestore
  capturedAt: string;
  gameweek: number;
  gameweekStatus: GameweekStatus;
  leagueId: number;

  // Global data
  bootstrapStatic: BootstrapResponse;
  fixtures: FixtureResponse[];
  fixturesCurrentGW: FixtureResponse[];
  liveScores: LiveResponse | null;
  eventStatus: EventStatusResponse;
  dreamTeam: DreamTeamResponse | null;
  setPieceNotes: SetPieceResponse;

  // League data
  leagueStandings: LeagueStandingsResponse;

  // Per-team data
  teamData: {
    [teamId: number]: TeamSnapshotData;
  };

  // Player deep data (top owned)
  playerSummaries: {
    [playerId: number]: ElementSummaryResponse;
  };
}

// Re-export commonly used types
export type {
  BootstrapResponse,
  FixtureResponse,
  LiveResponse,
  LeagueStandingsResponse,
  EntryResponse,
  PicksResponse,
  TeamSnapshotData,
} from './fpl-api';
```

### Step 5: Create types index file

```typescript
// src/types/index.ts
export * from './fpl-api';
export * from './fpl-snapshot';
```

### Step 6: Run test to verify it passes

Run: `npm test -- --run src/types/fpl-snapshot.test.ts`
Expected: PASS

### Step 7: Commit

```bash
git add src/types/
git commit -m "feat(types): add shared FPL snapshot types for test fixtures"
```

---

## Task 2: Create Test Fixtures Directory Structure

**Files:**
- Create: `test-fixtures/.gitignore`
- Create: `test-fixtures/README.md`
- Create: `test-fixtures/scenarios/.gitkeep`

### Step 1: Create directory structure

```bash
mkdir -p test-fixtures/snapshots
mkdir -p test-fixtures/scenarios
```

### Step 2: Create .gitignore for snapshots

```text
# test-fixtures/.gitignore

# Downloaded snapshots are gitignored (large files, regenerate from Firestore)
snapshots/

# Keep the directory
!snapshots/.gitkeep
```

### Step 3: Create .gitkeep files

```bash
touch test-fixtures/snapshots/.gitkeep
touch test-fixtures/scenarios/.gitkeep
```

### Step 4: Create README

```markdown
# Test Fixtures

FPL API snapshot data for testing.

## Directory Structure

```
test-fixtures/
├── snapshots/         # Downloaded from Firestore (gitignored)
│   └── gw16-2025-12-15T14-00.json
├── scenarios/         # Curated test scenarios (committed)
│   ├── gw-not-started.json
│   ├── gw-in-progress.json
│   └── gw-finished.json
└── index.ts           # Fixture loader
```

## CLI Commands

```bash
# List available snapshots in Firestore
npm run fixtures:list

# Download latest snapshot
npm run fixtures:download

# Download specific gameweek snapshots
npm run fixtures:download -- --gameweek=16

# Create a named scenario from a snapshot
npm run fixtures:scenario gw16-2025-12-15T14-00 gw-finished
```

## Usage in Tests

```typescript
import { loadScenario, loadSnapshot } from '@/test-fixtures';

// Load a curated scenario
const snapshot = loadScenario('gw-finished');

// Load a specific downloaded snapshot
const snapshot = loadSnapshot('gw16-2025-12-15T14-00');
```
```

### Step 5: Commit

```bash
git add test-fixtures/
git commit -m "feat(test-fixtures): add directory structure for FPL snapshots"
```

---

## Task 3: Create Fixtures List CLI Script

**Files:**
- Create: `scripts/fixtures-list.ts`
- Modify: `package.json` (add script)

### Step 1: Write the CLI script

```typescript
// scripts/fixtures-list.ts
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin
function initFirebase() {
  const serviceAccountPath = resolve(process.cwd(), 'service-account.json');

  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf-8')
    ) as ServiceAccount;
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Use Application Default Credentials (works with gcloud auth)
    initializeApp({ projectId: 'knockoutfpl' });
  }
}

async function listSnapshots() {
  initFirebase();
  const db = getFirestore();

  console.log('Fetching snapshots from Firestore...\n');

  const snapshotsRef = db.collection('fpl_snapshots');
  const snapshot = await snapshotsRef.orderBy('capturedAt', 'desc').get();

  if (snapshot.empty) {
    console.log('No snapshots found in Firestore.');
    console.log('Run the triggerSnapshotCapture function to capture a snapshot.');
    return;
  }

  console.log(`Found ${snapshot.size} snapshots:\n`);
  console.log('ID                              | GW | Status       | Captured At');
  console.log('--------------------------------|----|--------------|-----------------------');

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const capturedAt = data.capturedAt?.toDate?.()?.toISOString() || 'unknown';
    const status = (data.gameweekStatus || 'unknown').padEnd(12);
    const gw = String(data.gameweek || '?').padStart(2);

    console.log(`${doc.id.padEnd(31)} | ${gw} | ${status} | ${capturedAt}`);
  }

  console.log('\nTo download a snapshot:');
  console.log('  npm run fixtures:download -- --id=<snapshot-id>');
  console.log('  npm run fixtures:download -- --latest');
}

listSnapshots().catch((error) => {
  console.error('Error listing snapshots:', error);
  process.exit(1);
});
```

### Step 2: Add script to package.json

Add to `package.json` scripts:

```json
"fixtures:list": "npx tsx scripts/fixtures-list.ts"
```

### Step 3: Test the script works

Run: `npm run fixtures:list`
Expected: Either shows snapshot list or "No snapshots found" message

### Step 4: Commit

```bash
git add scripts/fixtures-list.ts package.json
git commit -m "feat(scripts): add fixtures:list CLI to show available snapshots"
```

---

## Task 4: Create Fixtures Download CLI Script

**Files:**
- Create: `scripts/fixtures-download.ts`
- Modify: `package.json` (add script)

### Step 1: Write the download script

```typescript
// scripts/fixtures-download.ts
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import type { FPLSnapshot } from '../src/types/fpl-snapshot';
import type { BootstrapResponse, FPLElement } from '../src/types/fpl-api';

// Initialize Firebase Admin
function initFirebase() {
  const serviceAccountPath = resolve(process.cwd(), 'service-account.json');

  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf-8')
    ) as ServiceAccount;
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp({ projectId: 'knockoutfpl' });
  }
}

// Parse command line arguments
function parseArgs(): { id?: string; latest?: boolean; gameweek?: number } {
  const args: { id?: string; latest?: boolean; gameweek?: number } = {};

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--id=')) {
      args.id = arg.slice(5);
    } else if (arg === '--latest') {
      args.latest = true;
    } else if (arg.startsWith('--gameweek=')) {
      args.gameweek = parseInt(arg.slice(11), 10);
    }
  }

  return args;
}

// Reassemble snapshot from Firestore subcollections
async function fetchSnapshot(
  db: FirebaseFirestore.Firestore,
  docId: string
): Promise<FPLSnapshot> {
  const snapshotRef = db.collection('fpl_snapshots').doc(docId);

  // Fetch main document
  const mainDoc = await snapshotRef.get();
  if (!mainDoc.exists) {
    throw new Error(`Snapshot ${docId} not found`);
  }
  const mainData = mainDoc.data()!;

  // Fetch bootstrap metadata
  const bootstrapMetaDoc = await snapshotRef.collection('bootstrap').doc('metadata').get();
  const bootstrapMeta = bootstrapMetaDoc.data() || { events: [], teams: [], element_types: [] };

  // Fetch all element chunks and reassemble
  const elementsSnapshot = await snapshotRef
    .collection('bootstrap')
    .where('startIndex', '>=', 0)
    .orderBy('startIndex')
    .get();

  const elements: FPLElement[] = [];
  for (const doc of elementsSnapshot.docs) {
    const data = doc.data();
    if (data.elements) {
      elements.push(...data.elements);
    }
  }

  const bootstrapStatic: BootstrapResponse = {
    events: bootstrapMeta.events || [],
    teams: bootstrapMeta.teams || [],
    elements: elements,
    element_types: bootstrapMeta.element_types || [],
  };

  // Fetch fixtures data
  const fixturesDoc = await snapshotRef.collection('data').doc('fixtures').get();
  const fixturesData = fixturesDoc.data() || { fixtures: [], fixturesCurrentGW: [] };

  // Fetch team data
  const teamsSnapshot = await snapshotRef.collection('teams').get();
  const teamData: FPLSnapshot['teamData'] = {};
  for (const doc of teamsSnapshot.docs) {
    const teamId = parseInt(doc.id, 10);
    teamData[teamId] = doc.data() as FPLSnapshot['teamData'][number];
  }

  // Convert Timestamp to ISO string
  const capturedAt =
    mainData.capturedAt instanceof Timestamp
      ? mainData.capturedAt.toDate().toISOString()
      : mainData.capturedAt;

  return {
    capturedAt,
    gameweek: mainData.gameweek,
    gameweekStatus: mainData.gameweekStatus,
    leagueId: mainData.leagueId,
    bootstrapStatic,
    fixtures: fixturesData.fixtures,
    fixturesCurrentGW: fixturesData.fixturesCurrentGW,
    liveScores: mainData.liveScores,
    eventStatus: mainData.eventStatus,
    dreamTeam: mainData.dreamTeam,
    setPieceNotes: mainData.setPieceNotes,
    leagueStandings: mainData.leagueStandings,
    teamData,
    playerSummaries: {}, // Not stored in subcollections yet
  };
}

async function downloadSnapshots() {
  const args = parseArgs();

  if (!args.id && !args.latest && args.gameweek === undefined) {
    console.log('Usage:');
    console.log('  npm run fixtures:download -- --latest');
    console.log('  npm run fixtures:download -- --id=<snapshot-id>');
    console.log('  npm run fixtures:download -- --gameweek=16');
    console.log('\nRun "npm run fixtures:list" to see available snapshots.');
    process.exit(1);
  }

  initFirebase();
  const db = getFirestore();

  // Ensure output directory exists
  const outputDir = resolve(process.cwd(), 'test-fixtures/snapshots');
  mkdirSync(outputDir, { recursive: true });

  let docIds: string[] = [];

  if (args.id) {
    docIds = [args.id];
  } else if (args.latest) {
    const snapshot = await db
      .collection('fpl_snapshots')
      .orderBy('capturedAt', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) {
      console.log('No snapshots found in Firestore.');
      process.exit(1);
    }
    docIds = [snapshot.docs[0].id];
  } else if (args.gameweek !== undefined) {
    const snapshot = await db
      .collection('fpl_snapshots')
      .where('gameweek', '==', args.gameweek)
      .orderBy('capturedAt', 'desc')
      .get();
    if (snapshot.empty) {
      console.log(`No snapshots found for gameweek ${args.gameweek}.`);
      process.exit(1);
    }
    docIds = snapshot.docs.map((d) => d.id);
    console.log(`Found ${docIds.length} snapshots for gameweek ${args.gameweek}`);
  }

  for (const docId of docIds) {
    console.log(`Downloading ${docId}...`);

    try {
      const snapshot = await fetchSnapshot(db, docId);
      const outputPath = join(outputDir, `${docId}.json`);

      writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));
      console.log(`  Saved to ${outputPath}`);
      console.log(`  Gameweek: ${snapshot.gameweek}, Status: ${snapshot.gameweekStatus}`);
      console.log(`  Teams: ${Object.keys(snapshot.teamData).length}`);
      console.log(`  Elements: ${snapshot.bootstrapStatic.elements.length}`);
    } catch (error) {
      console.error(`  Error downloading ${docId}:`, error);
    }
  }

  console.log('\nDone!');
}

downloadSnapshots().catch((error) => {
  console.error('Error downloading snapshots:', error);
  process.exit(1);
});
```

### Step 2: Add script to package.json

Add to `package.json` scripts:

```json
"fixtures:download": "npx tsx scripts/fixtures-download.ts"
```

### Step 3: Test the script

Run: `npm run fixtures:download -- --latest`
Expected: Downloads snapshot to `test-fixtures/snapshots/` directory

### Step 4: Verify downloaded file

Run: `ls -la test-fixtures/snapshots/`
Expected: Shows JSON file like `gw16-2025-12-15T14-00.json`

### Step 5: Commit

```bash
git add scripts/fixtures-download.ts package.json
git commit -m "feat(scripts): add fixtures:download CLI to fetch snapshots from Firestore"
```

---

## Task 5: Create Fixtures Scenario CLI Script

**Files:**
- Create: `scripts/fixtures-scenario.ts`
- Modify: `package.json` (add script)

### Step 1: Write the scenario creation script

```typescript
// scripts/fixtures-scenario.ts
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
    // Try without adding .json
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
```

### Step 2: Add script to package.json

Add to `package.json` scripts:

```json
"fixtures:scenario": "npx tsx scripts/fixtures-scenario.ts"
```

### Step 3: Test creating a scenario

Run: `npm run fixtures:scenario gw16-2025-12-15T14-00 gw-example`
Expected: Creates `test-fixtures/scenarios/gw-example.json`

### Step 4: Commit

```bash
git add scripts/fixtures-scenario.ts package.json
git commit -m "feat(scripts): add fixtures:scenario CLI to create named test scenarios"
```

---

## Task 6: Create Fixture Loader Module

**Files:**
- Create: `test-fixtures/index.ts`
- Test: `test-fixtures/index.test.ts`

### Step 1: Write test for fixture loader

```typescript
// test-fixtures/index.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadScenario, loadSnapshot, listScenarios, listSnapshots } from './index';
import type { FPLSnapshot } from '../src/types/fpl-snapshot';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

import { existsSync, readFileSync, readdirSync } from 'fs';

describe('Fixture Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadScenario', () => {
    it('loads a scenario by name', () => {
      const mockSnapshot: FPLSnapshot = {
        capturedAt: '2025-12-15T14:00:00Z',
        gameweek: 16,
        gameweekStatus: 'finished',
        leagueId: 634129,
        bootstrapStatic: { events: [], teams: [], elements: [], element_types: [] },
        fixtures: [],
        fixturesCurrentGW: [],
        liveScores: null,
        eventStatus: { status: [] },
        dreamTeam: null,
        setPieceNotes: { teams: [] },
        leagueStandings: { league: { id: 634129, name: 'FLOAWO' }, standings: { results: [] } },
        teamData: {},
        playerSummaries: {},
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockSnapshot));

      const result = loadScenario('gw-finished');

      expect(result.gameweek).toBe(16);
      expect(result.gameweekStatus).toBe('finished');
    });

    it('throws when scenario not found', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      expect(() => loadScenario('nonexistent')).toThrow('Scenario not found');
    });
  });

  describe('listScenarios', () => {
    it('returns list of available scenarios', () => {
      vi.mocked(readdirSync).mockReturnValue([
        'gw-finished.json',
        'gw-in-progress.json',
        '.gitkeep',
      ] as any);

      const result = listScenarios();

      expect(result).toEqual(['gw-finished', 'gw-in-progress']);
    });
  });

  describe('listSnapshots', () => {
    it('returns list of downloaded snapshots', () => {
      vi.mocked(readdirSync).mockReturnValue([
        'gw16-2025-12-15T14-00.json',
        'gw16-2025-12-15T15-00.json',
        '.gitkeep',
      ] as any);

      const result = listSnapshots();

      expect(result).toEqual(['gw16-2025-12-15T14-00', 'gw16-2025-12-15T15-00']);
    });
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- --run test-fixtures/index.test.ts`
Expected: FAIL with "Cannot find module './index'"

### Step 3: Write the fixture loader module

```typescript
// test-fixtures/index.ts
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join, basename } from 'path';
import type { FPLSnapshot } from '../src/types/fpl-snapshot';

const SCENARIOS_DIR = resolve(__dirname, 'scenarios');
const SNAPSHOTS_DIR = resolve(__dirname, 'snapshots');

/**
 * Load a curated test scenario by name.
 * Scenarios are committed to git and provide stable test data.
 *
 * @example
 * const snapshot = loadScenario('gw-finished');
 */
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

/**
 * Load a downloaded snapshot by ID.
 * Snapshots are gitignored and must be downloaded first.
 *
 * @example
 * const snapshot = loadSnapshot('gw16-2025-12-15T14-00');
 */
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

/**
 * List available scenario names.
 */
export function listScenarios(): string[] {
  if (!existsSync(SCENARIOS_DIR)) {
    return [];
  }

  return readdirSync(SCENARIOS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => basename(f, '.json'));
}

/**
 * List downloaded snapshot IDs.
 */
export function listSnapshots(): string[] {
  if (!existsSync(SNAPSHOTS_DIR)) {
    return [];
  }

  return readdirSync(SNAPSHOTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => basename(f, '.json'));
}

// Re-export types for convenience
export type { FPLSnapshot, GameweekStatus, TeamSnapshotData } from '../src/types/fpl-snapshot';
```

### Step 4: Run test to verify it passes

Run: `npm test -- --run test-fixtures/index.test.ts`
Expected: PASS

### Step 5: Commit

```bash
git add test-fixtures/index.ts test-fixtures/index.test.ts
git commit -m "feat(test-fixtures): add fixture loader module with loadScenario and loadSnapshot"
```

---

## Task 7: Add TypeScript Path Alias for Test Fixtures

**Files:**
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`

### Step 1: Add path alias to tsconfig.json

Add to `compilerOptions.paths`:

```json
"@test-fixtures": ["./test-fixtures"],
"@test-fixtures/*": ["./test-fixtures/*"]
```

### Step 2: Add path alias to vite.config.ts

Add to `resolve.alias`:

```typescript
'@test-fixtures': resolve(__dirname, './test-fixtures'),
```

### Step 3: Verify import works

Create a quick test:

```typescript
// In any test file, verify this import works:
import { loadScenario } from '@test-fixtures';
```

### Step 4: Commit

```bash
git add tsconfig.json vite.config.ts
git commit -m "feat(config): add @test-fixtures path alias for fixture imports"
```

---

## Task 8: Create Initial Test Scenarios

**Files:**
- Create: `test-fixtures/scenarios/gw-finished.json`
- Create: `test-fixtures/scenarios/gw-in-progress.json`

**Note:** This task requires having captured snapshots in Firestore. If none exist, first run:
1. Deploy the captureFloawoSnapshot function
2. Trigger a manual capture
3. Then download and create scenarios

### Step 1: Download latest snapshot

Run: `npm run fixtures:download -- --latest`

### Step 2: Create gw-finished scenario

Run: `npm run fixtures:scenario <latest-snapshot-id> gw-finished`

### Step 3: Create gw-in-progress scenario (if available)

If you have a snapshot captured during a gameweek in progress:
Run: `npm run fixtures:scenario <in-progress-snapshot-id> gw-in-progress`

Otherwise, we'll create transformers in Layer 3 to modify the status.

### Step 4: Commit scenarios

```bash
git add test-fixtures/scenarios/
git commit -m "feat(test-fixtures): add initial curated test scenarios"
```

---

## Task 9: Verify End-to-End Workflow

**Files:** None (verification task)

### Step 1: List available snapshots

Run: `npm run fixtures:list`
Expected: Shows table of snapshots with IDs, gameweek, status

### Step 2: Download a snapshot

Run: `npm run fixtures:download -- --latest`
Expected: Downloads JSON to `test-fixtures/snapshots/`

### Step 3: Create a scenario

Run: `npm run fixtures:scenario <id> test-scenario`
Expected: Creates `test-fixtures/scenarios/test-scenario.json`

### Step 4: Load scenario in test

Create a quick verification test:

```typescript
// src/test-verify-fixtures.test.ts
import { describe, it, expect } from 'vitest';
import { loadScenario, listScenarios } from '@test-fixtures';

describe('Fixture Loading Verification', () => {
  it('can list available scenarios', () => {
    const scenarios = listScenarios();
    console.log('Available scenarios:', scenarios);
    expect(Array.isArray(scenarios)).toBe(true);
  });

  it('can load a scenario and access team data', () => {
    const scenarios = listScenarios();
    if (scenarios.length === 0) {
      console.log('No scenarios available yet - skipping');
      return;
    }

    const snapshot = loadScenario(scenarios[0]);
    expect(snapshot.gameweek).toBeGreaterThan(0);
    expect(snapshot.leagueId).toBe(634129);
    console.log(`Loaded scenario: GW${snapshot.gameweek}, Status: ${snapshot.gameweekStatus}`);
    console.log(`Teams: ${Object.keys(snapshot.teamData).length}`);
  });
});
```

Run: `npm test -- --run src/test-verify-fixtures.test.ts`
Expected: PASS with log output showing loaded data

### Step 5: Clean up verification test

Delete the verification test file (or keep it if useful):

```bash
rm src/test-verify-fixtures.test.ts
```

### Step 6: Final commit

```bash
git add .
git commit -m "feat(test-fixtures): complete Layer 2 local fixtures tooling"
```

---

## Summary

**Layer 2 Complete!** You now have:

| Task | What it does |
|------|--------------|
| 1 | Shared FPL snapshot types in `src/types/` |
| 2 | Directory structure with gitignore for snapshots |
| 3 | `npm run fixtures:list` - show Firestore snapshots |
| 4 | `npm run fixtures:download` - fetch and reassemble snapshots |
| 5 | `npm run fixtures:scenario` - create named scenarios |
| 6 | Fixture loader module with `loadScenario()` |
| 7 | Path alias `@test-fixtures` for imports |
| 8 | Initial curated scenarios |
| 9 | End-to-end verification |

**CLI Commands:**
```bash
npm run fixtures:list                           # List snapshots in Firestore
npm run fixtures:download -- --latest           # Download latest snapshot
npm run fixtures:download -- --gameweek=16      # Download all GW16 snapshots
npm run fixtures:scenario <id> <name>           # Create named scenario
```

**Usage in Tests:**
```typescript
import { loadScenario } from '@test-fixtures';

const snapshot = loadScenario('gw-finished');
expect(snapshot.gameweekStatus).toBe('finished');
```

**Next:** Proceed to Layer 3 (Test Utilities) to create transformer functions and mock providers.
