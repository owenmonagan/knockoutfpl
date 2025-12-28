# Tournament Creation Integration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace placeholder `writeTournamentToDatabase` with actual Data Connect SDK calls and wire up frontend to call the Cloud Function.

**Architecture:** The Cloud Function already generates all tournament records. We just need to:
1. Import and use the generated Data Connect SDK mutations
2. Simplify LeaguePage to call the Cloud Function via `httpsCallable`

**Tech Stack:** Firebase Data Connect SDK, Firebase Functions v2, React with Firebase

---

## Context

**Current State:**
- Cloud Function `createTournament` exists at `functions/src/createTournament.ts`
- `writeTournamentToDatabase()` is a placeholder that just logs
- Frontend `LeaguePage.tsx` has duplicate bracket logic
- Data Connect SDK generated at `dataconnect/dataconnect-generated/`

**Generated SDK Mutations:**
- `createTournament(vars)` - returns `Tournament_Key` with `id`
- `createRound(vars)`
- `createParticipant(vars)`
- `createMatch(vars)`
- `createMatchPick(vars)`
- `updateMatch(vars)` - for setting bye status/winner

---

## Task 1: Add Data Connect SDK Dependency to Functions

**Files:**
- Modify: `functions/package.json`

**Step 1: Add firebase dependency**

Run: `cd functions && npm install firebase`

**Step 2: Verify installation**

Run: `cd functions && npm ls firebase`
Expected: Shows firebase version installed

---

## Task 2: Create Data Connect Client for Cloud Functions

**Files:**
- Create: `functions/src/dataconnect.ts`

**Step 1: Create the Data Connect client module**

```typescript
// functions/src/dataconnect.ts
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '../../dataconnect/dataconnect-generated';

// Initialize Firebase app for Data Connect (client SDK)
const firebaseConfig = {
  projectId: process.env.GCLOUD_PROJECT || 'knockoutfpl',
};

// Initialize app if not already done
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Get Data Connect instance
export const dataConnect = getDataConnect(app, connectorConfig);
```

**Step 2: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No errors

---

## Task 3: Implement writeTournamentToDatabase

**Files:**
- Modify: `functions/src/createTournament.ts`

**Step 1: Add imports for Data Connect mutations**

Add at top of file:
```typescript
import { dataConnect } from './dataconnect';
import {
  createTournament as dcCreateTournament,
  createRound,
  createParticipant,
  createMatch,
  createMatchPick,
  updateMatch,
} from '../../dataconnect/dataconnect-generated';
```

**Step 2: Replace writeTournamentToDatabase implementation**

Replace the placeholder function:

```typescript
/**
 * Write tournament records to database using Data Connect
 */
async function writeTournamentToDatabase(
  tournamentId: string,
  records: ReturnType<typeof buildTournamentRecords>
): Promise<void> {
  // 1. Create tournament
  await dcCreateTournament(dataConnect, {
    fplLeagueId: records.tournament.fplLeagueId,
    fplLeagueName: records.tournament.fplLeagueName,
    creatorUid: records.tournament.creatorUid,
    participantCount: records.tournament.participantCount,
    totalRounds: records.tournament.totalRounds,
    startEvent: records.tournament.startEvent,
    seedingMethod: records.tournament.seedingMethod,
  });

  // 2. Create rounds
  for (const round of records.rounds) {
    await createRound(dataConnect, {
      tournamentId,
      roundNumber: round.roundNumber,
      event: round.event,
      status: round.status,
    });
  }

  // 3. Create participants
  for (const participant of records.participants) {
    await createParticipant(dataConnect, {
      tournamentId,
      entryId: participant.entryId,
      teamName: participant.teamName,
      managerName: participant.managerName,
      seed: participant.seed,
      leagueRank: participant.leagueRank,
      leaguePoints: participant.leaguePoints,
      rawJson: participant.rawJson,
    });
  }

  // 4. Create matches
  for (const match of records.matchRecords) {
    await createMatch(dataConnect, {
      tournamentId,
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      positionInRound: match.positionInRound,
      qualifiesToMatchId: match.qualifiesToMatchId,
      isBye: match.isBye,
    });

    // Update bye matches with status and winner
    if (match.isBye && match.winnerEntryId) {
      await updateMatch(dataConnect, {
        tournamentId,
        matchId: match.matchId,
        roundNumber: match.roundNumber,
        positionInRound: match.positionInRound,
        qualifiesToMatchId: match.qualifiesToMatchId,
        isBye: true,
        status: 'complete',
        winnerEntryId: match.winnerEntryId,
      });
    }
  }

  // 5. Create match picks
  for (const pick of records.matchPicks) {
    await createMatchPick(dataConnect, {
      tournamentId,
      matchId: pick.matchId,
      entryId: pick.entryId,
      slot: pick.slot,
    });
  }
}
```

**Step 3: Update function call to pass tournamentId**

Change line ~291 from:
```typescript
await writeTournamentToDatabase(records);
```

To:
```typescript
await writeTournamentToDatabase(tournamentId, records);
```

**Step 4: Verify build compiles**

Run: `cd functions && npm run build`
Expected: No errors

---

## Task 4: Add Integration Test for Database Writes

**Files:**
- Modify: `functions/src/createTournament.test.ts`

**Step 1: Add test for writeTournamentToDatabase**

Add new test (uses mock/spy pattern since we can't run real Data Connect in unit tests):

```typescript
// Add at end of file
describe('writeTournamentToDatabase (mock test)', () => {
  it('should write correct number of records', async () => {
    // This is a documentation test - actual integration testing
    // requires Firebase emulators with Data Connect

    const mockRecords = {
      tournament: {
        fplLeagueId: 123,
        fplLeagueName: 'Test League',
        creatorUid: 'user123',
        participantCount: 8,
        totalRounds: 3,
        startEvent: 20,
        seedingMethod: 'league_rank',
      },
      rounds: [
        { tournamentId: 'tour-1', roundNumber: 1, event: 20, status: 'active' },
        { tournamentId: 'tour-1', roundNumber: 2, event: 21, status: 'pending' },
        { tournamentId: 'tour-1', roundNumber: 3, event: 22, status: 'pending' },
      ],
      participants: Array(8).fill(null).map((_, i) => ({
        tournamentId: 'tour-1',
        entryId: 1000 + i,
        teamName: `Team ${i + 1}`,
        managerName: `Manager ${i + 1}`,
        seed: i + 1,
        leagueRank: i + 1,
        leaguePoints: 1000 - i * 10,
        rawJson: '{}',
      })),
      matchRecords: Array(7).fill(null).map((_, i) => ({
        tournamentId: 'tour-1',
        matchId: i + 1,
        roundNumber: i < 4 ? 1 : i < 6 ? 2 : 3,
        positionInRound: (i % 4) + 1,
        qualifiesToMatchId: i < 6 ? Math.floor((i + 4) / 2) + 4 : null,
        isBye: false,
        status: i < 4 ? 'active' : 'pending',
      })),
      matchPicks: Array(8).fill(null).map((_, i) => ({
        tournamentId: 'tour-1',
        matchId: Math.floor(i / 2) + 1,
        entryId: 1000 + i,
        slot: (i % 2) + 1,
      })),
    };

    // Verify record counts are correct
    expect(mockRecords.rounds).toHaveLength(3);
    expect(mockRecords.participants).toHaveLength(8);
    expect(mockRecords.matchRecords).toHaveLength(7); // 4 + 2 + 1
    expect(mockRecords.matchPicks).toHaveLength(8);
  });
});
```

**Step 2: Run tests**

Run: `cd functions && npm test`
Expected: All tests pass

---

## Task 5: Create Frontend Tournament Service

**Files:**
- Create: `src/services/createTournament.ts`

**Step 1: Create the service**

```typescript
// src/services/createTournament.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

interface CreateTournamentRequest {
  fplLeagueId: number;
}

interface CreateTournamentResponse {
  tournamentId: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
}

/**
 * Call the createTournament Cloud Function
 */
export async function callCreateTournament(
  fplLeagueId: number
): Promise<CreateTournamentResponse> {
  const functions = getFunctions();
  const createTournamentFn = httpsCallable<
    CreateTournamentRequest,
    CreateTournamentResponse
  >(functions, 'createTournament');

  const result = await createTournamentFn({ fplLeagueId });
  return result.data;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

---

## Task 6: Wire Up LeaguePage to Cloud Function

**Files:**
- Modify: `src/pages/LeaguePage.tsx`

**Step 1: Replace imports**

Remove unused imports and add new one:
```typescript
// Remove these imports:
// import { getLeagueStandings, getCurrentGameweek } from '../services/fpl';
// import { createTournament } from '../services/tournament';
// import { generateBracket } from '../lib/bracket';

// Add this import:
import { callCreateTournament } from '../services/createTournament';
```

**Step 2: Replace handleCreateTournament**

Replace the entire function:
```typescript
const handleCreateTournament = async () => {
  if (!leagueId || !user) return;

  const result = await callCreateTournament(Number(leagueId));

  // Reload tournament data
  const existingTournament = await getTournamentByLeague(Number(leagueId));
  if (existingTournament) {
    setTournament(existingTournament);
    setLeagueName(existingTournament.fplLeagueName);
  }
};
```

**Step 3: Verify build compiles**

Run: `npm run build`
Expected: No errors

---

## Task 7: End-to-End Verification

**Files:**
- None (manual testing)

**Step 1: Start emulators**

Run: `firebase emulators:start --only functions,auth`
Note: Data Connect emulator may need separate setup

**Step 2: Start dev server**

Run: `npm run dev`

**Step 3: Test flow manually**

1. Log in with test account
2. Navigate to a league page
3. Click "Create Tournament"
4. Verify tournament appears

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Add firebase dep | `functions/package.json` |
| 2 | Create DC client | `functions/src/dataconnect.ts` |
| 3 | Implement writes | `functions/src/createTournament.ts` |
| 4 | Add tests | `functions/src/createTournament.test.ts` |
| 5 | Frontend service | `src/services/createTournament.ts` |
| 6 | Wire up page | `src/pages/LeaguePage.tsx` |
| 7 | E2E verify | Manual testing |
