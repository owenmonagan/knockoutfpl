# Knockout FPL - Firebase Cloud Functions

## Overview

This directory contains Firebase Cloud Functions for Knockout FPL:

1. **FPL API Proxy Functions** - Proxy requests to the FPL API to avoid CORS issues
2. **Tournament Management** - Create tournaments and update brackets

---

## Function List

| Function | Type | Description |
|----------|------|-------------|
| `getFPLBootstrapData` | Callable | Proxy for FPL bootstrap data |
| `getFPLTeamInfo` | Callable | Proxy for team entry data |
| `getFPLGameweekScore` | Callable | Proxy for team GW picks |
| `fplProxy` | HTTP | Generic FPL API proxy |
| `createTournament` | Callable | Create a new knockout tournament |
| `updateBrackets` | Scheduled | Update bracket scores when gameweeks complete |

---

## Development

### Build

```bash
cd functions
npm run build
```

### Deploy

```bash
firebase deploy --only functions
```

### Test Locally

```bash
# Start emulators
firebase emulators:start --only functions

# In another terminal, run tests
npm test
```

---

## Test Data

For capturing FPL API snapshots for testing, use the local script:

```bash
npx tsx scripts/capture-snapshot.ts
```

This captures data directly from the FPL API and saves to `test-fixtures/snapshots/`.

See `docs/plans/2025-12-28-test-data-strategy.md` for details on test data approach.
