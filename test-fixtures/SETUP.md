# Test Fixtures Setup Guide

## Overview

The test fixtures system downloads FPL API snapshots from Firebase for use in tests.

## Current Status

✅ **Fully Implemented:**
- Download script (`scripts/fixtures-download.ts`)
- List script (`scripts/fixtures-list.ts`)
- Scenario creation script (`scripts/fixtures-scenario.ts`)
- Directory structure created
- README documentation
- Firebase CLI credentials support (automatic)

## Authentication

The scripts automatically use your Firebase CLI credentials if you're logged in. No additional setup required!

### Automatic: Firebase CLI (Recommended)

If you're already logged into Firebase CLI, the scripts will automatically use your credentials:

```bash
# Check if you're logged in
firebase projects:list

# If not logged in:
firebase login
```

The scripts create Application Default Credentials from your Firebase CLI token automatically.

### Alternative: Service Account JSON

For CI/CD or if you prefer explicit credentials:

1. **Generate a service account key from Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (knockoutfpl-dev)
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `service-account.json` in project root

2. **The scripts will automatically use it** (takes priority over Firebase CLI credentials)

### Alternative: gcloud CLI

```bash
# Install gcloud
brew install --cask google-cloud-sdk

# Authenticate
gcloud auth application-default login
```

## Usage

### 1. List Available Snapshots

```bash
npm run fixtures:list
```

This will show all available snapshots with their gameweek and status.

### 2. Download Snapshots

```bash
# Download latest snapshot
npm run fixtures:download -- --latest

# Download specific gameweek
npm run fixtures:download -- --gameweek=16

# Download specific snapshot by ID
npm run fixtures:download -- --id=gw16-2025-12-15T14-00
```

Downloaded snapshots are saved to `test-fixtures/snapshots/` (gitignored).

### 3. Create Test Scenarios

After downloading a snapshot, create named scenarios:

```bash
# Create a scenario from a downloaded snapshot
npm run fixtures:scenario gw16-2025-12-15T14-00 gw-finished

# This creates: test-fixtures/scenarios/gw-finished.json
```

**Recommended scenarios to create:**

| Scenario Name | Description | Source |
|---------------|-------------|--------|
| `gw-not-started` | Gameweek hasn't started yet | Snapshot before deadline |
| `gw-in-progress` | Gameweek in progress, matches being played | Snapshot during matches |
| `gw-finished` | Gameweek complete, all scores finalized | Snapshot after all matches |

### 4. Use in Tests

```typescript
import { loadScenario, listScenarios } from '@test-fixtures';

// Load a scenario
const snapshot = loadScenario('gw-in-progress');

// Access data
console.log(snapshot.gameweek);        // 16
console.log(snapshot.gameweekStatus);  // 'in_progress'
console.log(snapshot.teamData);        // Team data for all league members
```

### 5. Commit Scenarios

```bash
git add test-fixtures/scenarios/
git commit -m "feat(test-fixtures): add initial curated test scenarios"
```

## Security Notes

- ⚠️ **Never commit `service-account.json` to git** (already in `.gitignore`)
- Downloaded snapshots are gitignored (they're large and reproducible)
- Only commit curated scenarios (small, hand-picked examples)
- Scenarios should have sensitive data removed if necessary

## Questions?

See:
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Authentication](https://cloud.google.com/docs/authentication/getting-started)
- [test-fixtures/README.md](./README.md) for usage documentation
