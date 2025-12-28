# Tournament Creation Fix - Picks Initialization

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix tournament creation by adding placeholder Pick records that satisfy foreign key constraints and enable future score lookups.

**Architecture:** Add `upsertPickAdmin` function to the mutations module, then modify `writeTournamentToDatabase` to create placeholder Pick records for each entry/gameweek combination after entries are created but before participants.

**Tech Stack:** TypeScript, Firebase Cloud Functions, Data Connect GraphQL mutations

---

## Context

**Bug Report:** `docs/reports/2025-12-28-tournament-creation-bug.md`

**Root Cause:** Tournament creation creates entries, tournament, rounds, participants, matches, and match_picks, but does NOT create Pick records. Picks are needed for:
1. Score lookups when gameweeks complete
2. Data consistency (even as placeholders with `isFinal: false`)

**Key Files:**
- `functions/src/dataconnect-mutations.ts` - Database mutation functions
- `functions/src/createTournament.ts` - Tournament creation logic
- `dataconnect/connector/mutations.gql` - GraphQL mutations (UpsertPick already exists at line 67)

---

## Task 1: Add upsertPickAdmin Function

**Files:**
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add the UPSERT_PICK_MUTATION constant**

Add after line 34 (after UPSERT_ENTRY_MUTATION):

```typescript
const UPSERT_PICK_MUTATION = `
  mutation UpsertPick(
    $entryId: Int!
    $event: Int!
    $points: Int!
    $totalPoints: Int
    $rank: Int
    $overallRank: Int
    $eventTransfersCost: Int
    $activeChip: String
    $rawJson: String!
    $isFinal: Boolean!
  ) {
    pick_upsert(
      data: {
        entryId: $entryId
        event: $event
        points: $points
        totalPoints: $totalPoints
        rank: $rank
        overallRank: $overallRank
        eventTransfersCost: $eventTransfersCost
        activeChip: $activeChip
        rawJson: $rawJson
        isFinal: $isFinal
        entryEntryId: $entryId
      }
    )
  }
`;
```

**Step 2: Add UpsertPickInput interface**

Add after `UpsertEntryInput` interface (around line 184):

```typescript
export interface UpsertPickInput {
  entryId: number;
  event: number;
  points: number;
  totalPoints?: number;
  rank?: number;
  overallRank?: number;
  eventTransfersCost?: number;
  activeChip?: string;
  rawJson: string;
  isFinal: boolean;
}
```

**Step 3: Add upsertPickAdmin function**

Add after `upsertEntryAdmin` function (around line 246):

```typescript
export async function upsertPickAdmin(
  input: UpsertPickInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPSERT_PICK_MUTATION,
    { variables: input }
  );
}
```

**Step 4: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add functions/src/dataconnect-mutations.ts
git commit -m "$(cat <<'EOF'
feat(functions): add upsertPickAdmin mutation function

Adds the ability to create/update Pick records via the admin SDK.
This is needed for tournament creation to initialize placeholder picks.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Update createTournament to Create Placeholder Picks

**Files:**
- Modify: `functions/src/createTournament.ts`

**Step 1: Add upsertPickAdmin to imports**

Modify line 12-20 to include `upsertPickAdmin`:

```typescript
import {
  upsertEntryAdmin,
  upsertPickAdmin,
  createTournamentAdmin,
  createRoundAdmin,
  createParticipantAdmin,
  createMatchAdmin,
  updateMatchAdmin,
  createMatchPickAdmin,
  AuthClaims,
} from './dataconnect-mutations';
```

**Step 2: Add pick creation logic to writeTournamentToDatabase**

In `writeTournamentToDatabase` function (starting at line 268), add pick creation after entries (after line 297, before tournament creation):

```typescript
  // 2. Create placeholder picks for tournament gameweeks
  console.log(`[createTournament] Creating placeholder picks for ${records.entries.length} entries x ${records.rounds.length} rounds...`);
  for (const entry of records.entries) {
    for (const round of records.rounds) {
      await upsertPickAdmin(
        {
          entryId: entry.entryId,
          event: round.event,
          points: 0,
          rawJson: '{}',
          isFinal: false,
        },
        authClaims
      );
    }
  }
```

**Step 3: Update comment numbering**

Update the comment numbers in the rest of the function:
- `// 2. Create tournament` → `// 3. Create tournament`
- `// 2. Create rounds` → `// 4. Create rounds`
- `// 3. Create participants` → `// 5. Create participants`
- `// 4. Create matches` → `// 6. Create matches`
- `// 5. Create match picks` → `// 7. Create match picks`

**Step 4: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add functions/src/createTournament.ts
git commit -m "$(cat <<'EOF'
fix(tournament): create placeholder picks during tournament creation

Fixes tournament creation by adding Pick records for each entry/gameweek
combination. Picks are created with isFinal: false and will be updated
with actual scores when gameweeks complete.

Bug: Tournament creation was failing because Pick records were missing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Manual E2E Verification

**Prerequisites:**
- Firebase emulators running
- Dev server running

**Step 1: Clear emulator database**

Stop emulators if running, delete emulator data, restart:
```bash
# Kill existing emulators
pkill -f "firebase.*emulator" || true

# Clear data and restart
rm -rf .firebase-emulators
firebase emulators:start --only auth,firestore,dataconnect,functions --project demo-knockoutfpl
```

**Step 2: Start dev server**

In a new terminal:
```bash
npm run dev
```

**Step 3: Create test user and login**

Navigate to `http://localhost:5173/login` and login with test credentials:
- Email: `testuser@knockoutfpl.com`
- Password: `TestPass123!`

**Step 4: Navigate to league and create tournament**

1. Navigate to a league page (e.g., `/league/123`)
2. Click "Create Tournament"
3. Verify success (should redirect to tournament page)

**Step 5: Verify database records**

Check emulator UI or logs for:
- [ ] All entries created
- [ ] All picks created (entries × rounds)
- [ ] Tournament created
- [ ] All rounds created
- [ ] All participants created
- [ ] All matches created
- [ ] All match_picks created

**Step 6: Document results**

If successful, update bug report status to "Resolved".
If failed, document the error and investigate.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add upsertPickAdmin function | `functions/src/dataconnect-mutations.ts` |
| 2 | Update createTournament to create picks | `functions/src/createTournament.ts` |
| 3 | Manual E2E verification | N/A |

**Total estimated steps:** 13
