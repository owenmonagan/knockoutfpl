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
