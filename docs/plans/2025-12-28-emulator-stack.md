# Emulator Stack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable local development with full Firebase emulator stack including Data Connect + PostgreSQL (PGLite) + Auth, so Cloud Functions can write to Data Connect with proper authentication.

**Architecture:** Replace the regular Firebase SDK in Cloud Functions with the Firebase Admin SDK's Data Connect module, using user impersonation to pass auth claims. Configure emulators to run together with proper auto-detection via environment variables.

**Tech Stack:** Firebase Admin SDK (firebase-admin), Data Connect Admin SDK, PGLite (bundled), Firebase Emulator Suite

---

## Background

The current issue is that `createTournament` Cloud Function fails with:
```
unauthenticated: this operation requires a signed-in user
```

This happens because:
1. The Data Connect mutations use `@auth(level: USER)` directive
2. The Cloud Function uses the regular Firebase SDK (`firebase/data-connect`)
3. The regular SDK doesn't pass the authenticated user's context to Data Connect

**Solution:** Use the Firebase Admin SDK with `impersonate: { authClaims }` to pass the caller's auth claims through to Data Connect.

---

### Task 1: Install firebase-admin/data-connect in Functions

**Files:**
- Modify: `functions/package.json`

**Step 1: Add firebase-admin/data-connect dependency**

The `firebase-admin` package already includes the data-connect module. Verify the current version supports it (v13+ is required).

Run: `cat functions/package.json | grep firebase-admin`
Expected: `"firebase-admin": "^13.0.0"` or higher

**Step 2: Update firebase-admin to latest if needed**

Run: `cd functions && npm install firebase-admin@latest`
Expected: Package updated to latest version (13.5.0+)

**Step 3: Verify installation**

Run: `cd functions && npm ls firebase-admin`
Expected: Shows firebase-admin@13.x.x

**Step 4: Commit**

```bash
git add functions/package.json functions/package-lock.json
git commit -m "chore(functions): update firebase-admin for Data Connect support"
```

---

### Task 2: Create Admin Data Connect Client

**Files:**
- Create: `functions/src/dataconnect-admin.ts`
- Keep: `functions/src/dataconnect.ts` (for reference/removal later)

**Step 1: Create the admin Data Connect client file**

Create `functions/src/dataconnect-admin.ts`:

```typescript
// functions/src/dataconnect-admin.ts
// Data Connect Admin SDK client for Cloud Functions with impersonation support

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getDataConnect, DataConnect } from 'firebase-admin/data-connect';

// Initialize Firebase Admin SDK
let app: App;
if (getApps().length === 0) {
  // In emulator, use default credentials
  // In production, uses Application Default Credentials (ADC)
  app = initializeApp();
} else {
  app = getApps()[0];
}

// Data Connect configuration matching dataconnect/dataconnect.yaml
const dataConnectConfig = {
  serviceId: 'knockoutfpl-dev-service',
  location: 'us-east1',
};

// Get Data Connect instance
export const dataConnectAdmin: DataConnect = getDataConnect(dataConnectConfig);

// Helper to create impersonation options from Firebase Auth claims
export function impersonateUser(authClaims: { [key: string]: unknown }) {
  return {
    impersonate: {
      authClaims,
    },
  };
}

// Export the auth claims type for convenience
export type AuthClaims = { [key: string]: unknown };
```

**Step 2: Verify the file was created**

Run: `cat functions/src/dataconnect-admin.ts | head -20`
Expected: Shows the import statements and config

**Step 3: Build to check for TypeScript errors**

Run: `cd functions && npm run build`
Expected: BUILD SUCCESS (no errors related to dataconnect-admin.ts)

**Step 4: Commit**

```bash
git add functions/src/dataconnect-admin.ts
git commit -m "feat(functions): add Admin SDK Data Connect client with impersonation"
```

---

### Task 3: Create Admin SDK Generated Mutations

The Admin SDK uses `executeGraphql` directly rather than generated SDKs. We'll create a wrapper that provides the same interface.

**Files:**
- Create: `functions/src/dataconnect-mutations.ts`

**Step 1: Create the mutations wrapper file**

Create `functions/src/dataconnect-mutations.ts`:

```typescript
// functions/src/dataconnect-mutations.ts
// Admin SDK mutations with impersonation support

import { dataConnectAdmin, AuthClaims } from './dataconnect-admin';

// GraphQL mutations matching dataconnect/connector/mutations.gql
const CREATE_TOURNAMENT_MUTATION = `
  mutation CreateTournament(
    $fplLeagueId: Int!
    $fplLeagueName: String!
    $creatorUid: String!
    $participantCount: Int!
    $totalRounds: Int!
    $startEvent: Int!
    $seedingMethod: String!
  ) {
    tournament_insert(
      data: {
        fplLeagueId: $fplLeagueId
        fplLeagueName: $fplLeagueName
        creatorUid: $creatorUid
        participantCount: $participantCount
        totalRounds: $totalRounds
        startEvent: $startEvent
        seedingMethod: $seedingMethod
      }
    )
  }
`;

const CREATE_ROUND_MUTATION = `
  mutation CreateRound(
    $tournamentId: UUID!
    $roundNumber: Int!
    $event: Int!
    $status: String!
  ) {
    round_insert(
      data: {
        tournamentId: $tournamentId
        roundNumber: $roundNumber
        event: $event
        status: $status
      }
    )
  }
`;

const CREATE_PARTICIPANT_MUTATION = `
  mutation CreateParticipant(
    $tournamentId: UUID!
    $entryId: Int!
    $teamName: String!
    $managerName: String!
    $seed: Int!
    $leagueRank: Int
    $leaguePoints: Int
    $rawJson: String!
  ) {
    participant_insert(
      data: {
        tournamentId: $tournamentId
        entryId: $entryId
        teamName: $teamName
        managerName: $managerName
        seed: $seed
        leagueRank: $leagueRank
        leaguePoints: $leaguePoints
        rawJson: $rawJson
        entryEntryId: $entryId
      }
    )
  }
`;

const CREATE_MATCH_MUTATION = `
  mutation CreateMatch(
    $tournamentId: UUID!
    $matchId: Int!
    $roundNumber: Int!
    $positionInRound: Int!
    $qualifiesToMatchId: Int
    $isBye: Boolean!
  ) {
    match_insert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        roundNumber: $roundNumber
        positionInRound: $positionInRound
        qualifiesToMatchId: $qualifiesToMatchId
        isBye: $isBye
      }
    )
  }
`;

const UPDATE_MATCH_MUTATION = `
  mutation UpdateMatch(
    $tournamentId: UUID!
    $matchId: Int!
    $roundNumber: Int!
    $positionInRound: Int!
    $qualifiesToMatchId: Int
    $isBye: Boolean!
    $status: String!
    $winnerEntryId: Int
  ) {
    match_upsert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        roundNumber: $roundNumber
        positionInRound: $positionInRound
        qualifiesToMatchId: $qualifiesToMatchId
        isBye: $isBye
        status: $status
        winnerEntryId: $winnerEntryId
      }
    )
  }
`;

const CREATE_MATCH_PICK_MUTATION = `
  mutation CreateMatchPick(
    $tournamentId: UUID!
    $matchId: Int!
    $entryId: Int!
    $slot: Int!
  ) {
    matchPick_insert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        entryId: $entryId
        slot: $slot
        entryEntryId: $entryId
      }
    )
  }
`;

// Type definitions for mutation inputs
export interface CreateTournamentInput {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
}

export interface CreateRoundInput {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
}

export interface CreateParticipantInput {
  tournamentId: string;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank?: number;
  leaguePoints?: number;
  rawJson: string;
}

export interface CreateMatchInput {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId?: number | null;
  isBye: boolean;
}

export interface UpdateMatchInput extends CreateMatchInput {
  status: string;
  winnerEntryId?: number | null;
}

export interface CreateMatchPickInput {
  tournamentId: string;
  matchId: number;
  entryId: number;
  slot: number;
}

// Mutation functions with impersonation
export async function createTournamentAdmin(
  input: CreateTournamentInput,
  authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_TOURNAMENT_MUTATION,
    input,
    { impersonate: { authClaims } }
  );
}

export async function createRoundAdmin(
  input: CreateRoundInput,
  authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_ROUND_MUTATION,
    input,
    { impersonate: { authClaims } }
  );
}

export async function createParticipantAdmin(
  input: CreateParticipantInput,
  authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_PARTICIPANT_MUTATION,
    input,
    { impersonate: { authClaims } }
  );
}

export async function createMatchAdmin(
  input: CreateMatchInput,
  authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_MATCH_MUTATION,
    input,
    { impersonate: { authClaims } }
  );
}

export async function updateMatchAdmin(
  input: UpdateMatchInput,
  authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_MATCH_MUTATION,
    input,
    { impersonate: { authClaims } }
  );
}

export async function createMatchPickAdmin(
  input: CreateMatchPickInput,
  authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_MATCH_PICK_MUTATION,
    input,
    { impersonate: { authClaims } }
  );
}
```

**Step 2: Build to check for TypeScript errors**

Run: `cd functions && npm run build`
Expected: BUILD SUCCESS

**Step 3: Commit**

```bash
git add functions/src/dataconnect-mutations.ts
git commit -m "feat(functions): add Admin SDK mutation wrappers with impersonation"
```

---

### Task 4: Update createTournament to Use Admin SDK

**Files:**
- Modify: `functions/src/createTournament.ts`

**Step 1: Update imports to use Admin SDK mutations**

Replace the old imports:

```typescript
// OLD (remove these lines)
import { dataConnect } from './dataconnect';
import {
  createTournament as dcCreateTournament,
  createRound,
  createParticipant,
  createMatch,
  createMatchPick,
  updateMatch,
} from './generated/dataconnect';

// NEW (add these lines)
import {
  createTournamentAdmin,
  createRoundAdmin,
  createParticipantAdmin,
  createMatchAdmin,
  updateMatchAdmin,
  createMatchPickAdmin,
  AuthClaims,
} from './dataconnect-mutations';
```

**Step 2: Update writeTournamentToDatabase function signature**

Change the function to accept auth claims:

```typescript
async function writeTournamentToDatabase(
  tournamentId: string,
  records: ReturnType<typeof buildTournamentRecords>,
  authClaims: AuthClaims
): Promise<void> {
```

**Step 3: Update mutation calls to use Admin SDK with impersonation**

Replace each mutation call. For example, change:

```typescript
// OLD
await dcCreateTournament(dataConnect, {
  fplLeagueId: records.tournament.fplLeagueId,
  // ...
});

// NEW
await createTournamentAdmin({
  fplLeagueId: records.tournament.fplLeagueId,
  fplLeagueName: records.tournament.fplLeagueName,
  creatorUid: records.tournament.creatorUid,
  participantCount: records.tournament.participantCount,
  totalRounds: records.tournament.totalRounds,
  startEvent: records.tournament.startEvent,
  seedingMethod: records.tournament.seedingMethod,
}, authClaims);
```

And similarly for all other mutations (createRound, createParticipant, createMatch, updateMatch, createMatchPick), adding `authClaims` as the second parameter.

**Step 4: Update the main function to pass auth claims**

In the `createTournament` onCall handler, extract auth claims and pass them:

```typescript
export const createTournament = onCall(async (request: CallableRequest<CreateTournamentRequest>) => {
  // 1. Validate auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in to create a tournament');
  }
  const uid = request.auth.uid;

  // Extract auth claims for impersonation
  const authClaims: AuthClaims = {
    sub: uid,
    email: request.auth.token.email,
    email_verified: request.auth.token.email_verified,
    // Include any other claims needed by @auth directives
  };

  // ... rest of function ...

  // 8. Write to database (pass authClaims)
  await writeTournamentToDatabase(tournamentId, records, authClaims);

  // ... return statement ...
});
```

**Step 5: Build to verify changes**

Run: `cd functions && npm run build`
Expected: BUILD SUCCESS

**Step 6: Run function tests**

Run: `cd functions && npm test`
Expected: All tests pass

**Step 7: Commit**

```bash
git add functions/src/createTournament.ts
git commit -m "feat(functions): use Admin SDK with impersonation for Data Connect"
```

---

### Task 5: Update Emulator Scripts

**Files:**
- Modify: `package.json` (root)

**Step 1: Update the emulators script to include dataconnect**

In root `package.json`, update the emulators script:

```json
{
  "scripts": {
    "emulators": "firebase emulators:start --only auth,functions,dataconnect --project knockoutfpl-dev",
    "emulators:all": "firebase emulators:start --project knockoutfpl-dev",
    "emulators:ui": "firebase emulators:start --import=./firebase-data --export-on-exit --project knockoutfpl-dev"
  }
}
```

**Step 2: Verify the script update**

Run: `cat package.json | grep -A1 '"emulators"'`
Expected: Shows updated emulators script with `--only auth,functions,dataconnect`

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: update emulator scripts to include dataconnect"
```

---

### Task 6: Configure Firebase Emulator for Data Connect

**Files:**
- Modify: `firebase.json`

**Step 1: Ensure dataconnect emulator has dataDir for persistence**

Add `dataDir` to the dataconnect emulator config in `firebase.json`:

```json
{
  "emulators": {
    "dataconnect": {
      "port": 9399,
      "dataDir": "./dataconnect-data"
    }
  }
}
```

**Step 2: Add dataconnect-data to .gitignore**

Run: `echo "dataconnect-data/" >> .gitignore`

**Step 3: Verify firebase.json changes**

Run: `cat firebase.json | grep -A3 '"dataconnect"'`
Expected: Shows dataconnect config with port 9399 and dataDir

**Step 4: Commit**

```bash
git add firebase.json .gitignore
git commit -m "chore: configure Data Connect emulator with data persistence"
```

---

### Task 7: Test Full Emulator Stack

**Files:**
- None (verification only)

**Step 1: Build functions**

Run: `cd functions && npm run build`
Expected: BUILD SUCCESS

**Step 2: Start the full emulator stack**

Run: `npm run emulators`

Expected output should include:
```
✔  functions[us-central1-createTournament]: http function initialized
✔  All emulators ready!
```

And show Data Connect emulator running on port 9399.

**Step 3: Verify emulator UI shows all emulators**

Open: http://127.0.0.1:4000/

Expected: UI shows Auth, Functions, and Data Connect emulators running

**Step 4: Stop emulators**

Press Ctrl+C to stop emulators.

**Step 5: Document any issues encountered**

If there are errors, note them for debugging.

---

### Task 8: Test createTournament with Full Stack

**Files:**
- None (E2E verification only)

**Step 1: Start emulators in background**

In one terminal:
```bash
npm run emulators
```

Wait for "All emulators ready!"

**Step 2: Start dev server**

In another terminal:
```bash
npm run dev
```

**Step 3: Open browser and navigate to login**

Open: http://localhost:5173/login

**Step 4: Login with test account**

- Email: `testuser@knockoutfpl.com`
- Password: `TestPass123!`

**Step 5: Navigate to leagues page**

After login, navigate to: http://localhost:5173/leagues

**Step 6: Select a league and create tournament**

Click on a league, then click "Create Tournament" button.

**Step 7: Verify tournament was created**

Check:
1. No errors in browser console
2. No errors in emulator terminal
3. Tournament data appears in the UI

**Step 8: Check Data Connect emulator for data**

In Emulator UI (http://127.0.0.1:4000/dataconnect), verify tournament record was created.

---

### Task 9: Update Tests to Mock Admin SDK

**Files:**
- Modify: `functions/src/__tests__/createTournament.test.ts` (if exists)

**Step 1: Check if function tests exist**

Run: `ls functions/src/__tests__/`

If tests exist, update mocks to use Admin SDK mutations.

**Step 2: Update mock imports**

```typescript
// Mock Admin SDK mutations
vi.mock('../dataconnect-mutations', () => ({
  createTournamentAdmin: vi.fn().mockResolvedValue(undefined),
  createRoundAdmin: vi.fn().mockResolvedValue(undefined),
  createParticipantAdmin: vi.fn().mockResolvedValue(undefined),
  createMatchAdmin: vi.fn().mockResolvedValue(undefined),
  updateMatchAdmin: vi.fn().mockResolvedValue(undefined),
  createMatchPickAdmin: vi.fn().mockResolvedValue(undefined),
}));
```

**Step 3: Run tests**

Run: `cd functions && npm test`
Expected: All tests pass

**Step 4: Commit if changes were made**

```bash
git add functions/src/__tests__/
git commit -m "test(functions): update mocks for Admin SDK mutations"
```

---

### Task 10: Clean Up Old SDK Files

**Files:**
- Remove: `functions/src/dataconnect.ts`
- Remove: `functions/src/generated/` directory
- Remove: `functions/lib/generated/` directory

**Step 1: Remove old dataconnect.ts**

Run: `rm functions/src/dataconnect.ts`

**Step 2: Remove old generated directory**

Run: `rm -rf functions/src/generated functions/lib/generated`

**Step 3: Verify build still works**

Run: `cd functions && npm run build`
Expected: BUILD SUCCESS

**Step 4: Run tests**

Run: `cd functions && npm test`
Expected: All tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "chore(functions): remove old SDK files, use Admin SDK only"
```

---

## Completion Checklist

- [ ] Task 1: firebase-admin updated in functions
- [ ] Task 2: Admin Data Connect client created
- [ ] Task 3: Admin SDK mutation wrappers created
- [ ] Task 4: createTournament uses Admin SDK with impersonation
- [ ] Task 5: Emulator scripts updated
- [ ] Task 6: Firebase emulator configured for Data Connect
- [ ] Task 7: Full emulator stack tested
- [ ] Task 8: E2E test with createTournament successful
- [ ] Task 9: Function tests updated
- [ ] Task 10: Old SDK files cleaned up

---

## Troubleshooting

### "unauthenticated" error persists
- Verify auth claims include `sub` (user ID)
- Check that Auth emulator is running alongside Data Connect
- Ensure `impersonate` option is being passed correctly

### Data Connect emulator not starting
- Check that port 9399 is not in use: `lsof -i :9399`
- Verify `dataconnect/dataconnect.yaml` exists and is valid

### PGLite database issues
- Delete `dataconnect-data/` and restart emulators for fresh database
- Check emulator logs for PostgreSQL errors

### Admin SDK import errors
- Ensure firebase-admin is v13.5.0 or later
- Run `cd functions && npm install` to ensure deps are installed

---

## Sources

- [Firebase Data Connect Admin SDK](https://firebase.google.com/docs/data-connect/admin-sdk)
- [Data Connect Emulator for CI/CD](https://firebase.google.com/docs/data-connect/data-connect-emulator-suite)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
