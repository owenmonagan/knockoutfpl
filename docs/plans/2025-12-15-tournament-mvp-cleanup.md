# Tournament MVP Cleanup Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove remaining challenge-related code and add tournament infrastructure to complete the migration from 1v1 challenges to tournament system.

**Context:** The tournament MVP core functionality is implemented. This plan cleans up obsolete challenge references and adds missing infrastructure.

---

## Phase 1: Delete Obsolete E2E Tests

### Task 1.1: Delete Challenge E2E Test File

**Files:**
- Delete: `e2e/challenge-lifecycle.spec.ts`

**Steps:**
```bash
cd /Users/owen/work/knockoutfpl/.worktrees/tournament-mvp
rm e2e/challenge-lifecycle.spec.ts
git add -A && git commit -m "chore: delete obsolete challenge E2E tests"
```

---

### Task 1.2: Delete Challenge E2E Helpers

**Files:**
- Delete: `e2e/helpers/challenge-helpers.ts`

**Steps:**
```bash
rm e2e/helpers/challenge-helpers.ts
git add -A && git commit -m "chore: delete challenge E2E helpers"
```

---

### Task 1.3: Update E2E Firestore Query Helper

**Files:**
- Modify: `e2e/helpers/firestore-query.ts`

**Step 1: Read file and remove challenge-specific queries**

**Step 2: Commit**
```bash
git add -A && git commit -m "chore: remove challenge queries from E2E helpers"
```

---

## Phase 2: Clean Up Components

### Task 2.1: Update Hero Component Text

**Files:**
- Modify: `src/components/landing/Hero.tsx`
- Modify: `src/components/landing/Hero.test.tsx`

**Step 1: Read files to see current challenge references**

**Step 2: Update marketing copy from "challenges" to "tournaments"**

Example changes:
- "Challenge your friends" → "Create tournaments"
- "1v1 FPL battles" → "Mini-league knockout tournaments"

**Step 3: Update tests to match new copy**

**Step 4: Run tests and commit**
```bash
npm run test -- Hero.test.tsx --run
git add -A && git commit -m "feat: update Hero copy for tournaments"
```

---

### Task 2.2: Update FPLConnectionCard Text

**Files:**
- Modify: `src/components/dashboard/FPLConnectionCard.tsx`
- Modify: `src/components/dashboard/FPLConnectionCard.test.tsx`

**Step 1: Read files and update any challenge-specific text**

**Step 2: Run tests and commit**
```bash
npm run test -- FPLConnectionCard.test.tsx --run
git add -A && git commit -m "chore: update FPLConnectionCard text for tournaments"
```

---

### Task 2.3: Delete or Update PreviewStateView

**Files:**
- Evaluate: `src/components/PreviewStateView.tsx`
- Evaluate: `src/components/PreviewStateView.test.tsx`

**Step 1: Read files to understand purpose**

If challenge-specific (likely), delete:
```bash
rm src/components/PreviewStateView.tsx src/components/PreviewStateView.test.tsx
```

If reusable for tournaments, update to work with tournament matches.

**Step 2: Commit**
```bash
git add -A && git commit -m "chore: remove challenge PreviewStateView component"
```

---

### Task 2.4: Update EmptyState Component

**Files:**
- Modify: `src/components/dashboard/EmptyState.tsx`
- Modify: `src/components/dashboard/EmptyState.test.tsx`

**Step 1: Read files and update any challenge-specific messaging**

**Step 2: Run tests and commit**

---

### Task 2.5: Clean Up TestDataPage

**Files:**
- Evaluate: `src/pages/TestDataPage.tsx`
- Evaluate: `src/pages/TestDataPage.test.tsx`

**Step 1: Read files - this is likely a dev-only page for seeding test data**

If challenge-specific, either:
- Delete entirely
- Update to seed tournament test data instead

**Step 2: Commit appropriate changes**

---

## Phase 3: Firebase Functions Cleanup

### Task 3.1: Evaluate Challenge Scoring Functions

**Files:**
- Evaluate: `functions/src/challengeScoring.ts`
- Evaluate: `functions/src/challengeScoring.test.ts`
- Modify: `functions/src/index.ts`

**Step 1: Read files to understand purpose**

The scoring logic may be reusable for tournaments:
- `calculateDifferentials` - likely useful
- Challenge-specific CRUD - delete

**Step 2: Either delete or refactor for tournament use**

**Step 3: Update `functions/src/index.ts` exports**

**Step 4: Run function tests and commit**
```bash
cd functions && npm test
git add -A && git commit -m "chore: clean up Firebase functions for tournaments"
```

---

## Phase 4: Add Tournament Firestore Rules

### Task 4.1: Add Tournament Collection Rules

**Files:**
- Modify: `firestore.rules`

**Step 1: Add tournament rules**

```javascript
// Tournaments collection
match /tournaments/{tournamentId} {
  // Anyone authenticated can read tournaments
  allow read: if isAuthenticated();

  // Creator can create tournaments
  allow create: if isAuthenticated()
    && request.resource.data.creatorUserId == request.auth.uid
    && request.resource.data.status == 'active';

  // Only Cloud Functions update tournaments (scores, advancement)
  // No client-side updates for security
  allow update: if false;

  // Only creator can delete (before tournament starts)
  allow delete: if isAuthenticated()
    && resource.data.creatorUserId == request.auth.uid
    && resource.data.currentRound == 1;
}
```

**Step 2: Optionally comment out or remove challenges rules**

**Step 3: Deploy and test**
```bash
firebase deploy --only firestore:rules
```

**Step 4: Commit**
```bash
git add -A && git commit -m "feat: add Firestore security rules for tournaments"
```

---

## Phase 5: Update E2E Dashboard Test

### Task 5.1: Update Dashboard E2E for Leagues

**Files:**
- Modify: `e2e/dashboard.spec.ts`

**Step 1: Read current test**

**Step 2: Update to test new tournament functionality:**
- Verify "Your Leagues" section appears
- Verify leagues load after FPL connection
- Verify league card click navigates to league page

**Step 3: Run E2E tests and commit**
```bash
npm run test:e2e:dashboard
git add -A && git commit -m "test: update dashboard E2E for tournaments"
```

---

## Phase 6: Final Verification

### Task 6.1: Run All Tests

```bash
npm run test -- --run
npm run test:e2e:smoke
```

### Task 6.2: Grep for Remaining Challenge References

```bash
grep -r "challenge" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

Address any remaining references.

### Task 6.3: TypeScript Check

```bash
npx tsc --noEmit
```

---

## Success Criteria

- [ ] No obsolete challenge E2E tests
- [ ] Hero component has tournament-focused copy
- [ ] No unused challenge components
- [ ] Firebase Functions cleaned up
- [ ] Tournament Firestore rules deployed
- [ ] Dashboard E2E tests updated
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Minimal "challenge" references remaining (only where appropriate)
