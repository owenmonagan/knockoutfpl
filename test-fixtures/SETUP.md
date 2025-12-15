# Test Fixtures Setup Guide

## Overview

The test fixtures system downloads FPL API snapshots from Firestore for use in tests. To download snapshots, you need Firebase credentials configured.

## Current Status

✅ **Implemented:**
- Download script (`scripts/fixtures-download.ts`)
- Scenario creation script (`scripts/fixtures-scenario.ts`)
- Directory structure created
- README documentation

❌ **Blocked - Missing Credentials:**
- Cannot download snapshots from Firestore
- Cannot create initial test scenarios

## Authentication Required

The download script needs Firebase Admin SDK credentials to read from Firestore. There are two options:

### Option 1: Service Account JSON (Recommended for Local Development)

1. **Generate a service account key from Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (knockoutfpl)
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `service-account.json` in project root

2. **Place the file in project root:**
   ```bash
   # Make sure it's in .gitignore (it already is)
   ls service-account.json
   ```

3. **The download script will automatically use it:**
   ```typescript
   // From scripts/fixtures-download.ts:10-16
   const serviceAccountPath = resolve(process.cwd(), 'service-account.json');

   if (existsSync(serviceAccountPath)) {
     const serviceAccount = JSON.parse(
       readFileSync(serviceAccountPath, 'utf-8')
     ) as ServiceAccount;
     initializeApp({ credential: cert(serviceAccount) });
   }
   ```

### Option 2: Application Default Credentials (gcloud CLI)

1. **Install gcloud CLI:**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk

   # Other platforms
   # See: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate:**
   ```bash
   gcloud auth application-default login
   ```

3. **The download script will use ADC:**
   ```typescript
   // From scripts/fixtures-download.ts:18-20
   else {
     // Use Application Default Credentials (works with gcloud auth)
     initializeApp({ projectId: 'knockoutfpl' });
   }
   ```

## Once Authenticated

After setting up credentials, you can:

### 1. List Available Snapshots

```bash
npm run fixtures:list
```

This will show all snapshots in Firestore with their gameweek and status.

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

### 4. Commit Scenarios

```bash
git add test-fixtures/scenarios/
git commit -m "feat(test-fixtures): add initial curated test scenarios"
```

## Current Error

When attempting to download without credentials:

```
❌ Error downloading snapshot: Could not load the default credentials.
Browse to https://cloud.google.com/docs/authentication/getting-started
for more information.
```

## Next Steps

1. Choose authentication method (Option 1 or 2 above)
2. Set up credentials
3. Download snapshots for different gameweek states
4. Create curated scenarios
5. Commit scenarios to git

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
