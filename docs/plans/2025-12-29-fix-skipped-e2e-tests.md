# Fix Skipped E2E Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable all 14 currently skipped E2E tests to pass by setting up PostgreSQL for Data Connect, seeding test data, and implementing public bracket routes.

**Architecture:** Fix tests in three phases: (1) Infrastructure - set up PostgreSQL and Data Connect emulator, (2) Data - create test data seeding scripts, (3) Routes - implement public bracket viewing. Each phase unlocks a category of tests.

**Tech Stack:** PostgreSQL 15, Firebase Data Connect Emulator, Playwright E2E tests, TypeScript

---

## Summary of Skipped Tests

| Category | Count | Root Cause | Fix Phase |
|----------|-------|------------|-----------|
| Data Connect/PostgreSQL | 5 | Data Connect emulator needs PostgreSQL | Task 1-3 |
| Seeded Tournament Data | 4 | Tests need pre-existing tournament state | Task 4-6 |
| Public Route Access | 5 | Anonymous bracket viewing not implemented | Task 7-9 |

---

## Task 1: Install and Configure PostgreSQL

**Files:**
- Create: `docker-compose.yml`
- Modify: `package.json` (add scripts)
- Create: `scripts/init-postgres.sh`

**Step 1: Create Docker Compose configuration**

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: knockoutfpl-postgres
    environment:
      POSTGRES_DB: knockoutfpl_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

**Step 2: Create PostgreSQL init script**

```bash
#!/bin/bash
# scripts/init-postgres.sh

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Create database if it doesn't exist
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'knockoutfpl_dev'" | grep -q 1 || \
  psql -h localhost -U postgres -c "CREATE DATABASE knockoutfpl_dev"

echo "Database knockoutfpl_dev ready!"
```

**Step 3: Add npm scripts**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "db:start": "docker-compose up -d postgres",
    "db:stop": "docker-compose down",
    "db:logs": "docker-compose logs -f postgres",
    "emulators:e2e": "docker-compose up -d postgres && firebase emulators:start --only auth,functions,dataconnect --project knockoutfpl-dev"
  }
}
```

**Step 4: Verify PostgreSQL starts**

Run: `npm run db:start`
Expected: Container starts, postgres available on port 5432

**Step 5: Commit**

```bash
git add docker-compose.yml scripts/init-postgres.sh package.json
git commit -m "feat(e2e): add PostgreSQL Docker setup for Data Connect

- Add docker-compose.yml with PostgreSQL 15
- Add init script for database creation
- Add npm scripts for database lifecycle"
```

---

## Task 2: Configure Data Connect Emulator for PostgreSQL

**Files:**
- Create: `dataconnect/dataconnect.local.yaml`
- Modify: `firebase.json` (update emulator config)
- Modify: `playwright.config.ts` (use new emulator command)

**Step 1: Create local Data Connect config**

```yaml
# dataconnect/dataconnect.local.yaml
# Local development override - uses Docker PostgreSQL instead of Cloud SQL
specVersion: "v1beta"
serviceId: "knockoutfpl-dev-service"
location: "us-east1"
schema:
  source: "./schema"
  datasource:
    postgresql:
      database: "knockoutfpl_dev"
connectorDirs: ["./connector"]
```

**Step 2: Update firebase.json emulator config**

```json
{
  "emulators": {
    "dataconnect": {
      "port": 9399,
      "dataDir": "./dataconnect-data",
      "postgresql": {
        "host": "localhost",
        "port": 5432,
        "user": "postgres",
        "password": "postgres",
        "database": "knockoutfpl_dev"
      }
    }
  }
}
```

**Step 3: Update playwright.config.ts webServer**

Replace emulators command:

```typescript
webServer: [
  {
    command: 'npm run emulators:e2e',
    url: 'http://127.0.0.1:9099',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  // ... dev server unchanged
],
```

**Step 4: Verify Data Connect connects to PostgreSQL**

Run: `npm run emulators:e2e`
Expected: Emulator UI shows Data Connect connected, no PostgreSQL errors

**Step 5: Commit**

```bash
git add dataconnect/dataconnect.local.yaml firebase.json playwright.config.ts
git commit -m "feat(e2e): configure Data Connect emulator with PostgreSQL

- Add local Data Connect config for Docker PostgreSQL
- Update firebase.json emulator PostgreSQL settings
- Update Playwright to use new emulator command"
```

---

## Task 3: Verify FPL Connection Flow Works

**Files:**
- Modify: `e2e/knockout-demo.spec.ts` (remove test.fixme from 2 tests)

**Step 1: Start full test environment**

Run: `npm run emulators:e2e` (in terminal 1)
Run: `npm run dev` (in terminal 2)

**Step 2: Manually test the FPL connection flow**

1. Navigate to `http://localhost:5173/signup`
2. Create a new account
3. Go to `/connect`, enter FPL Team ID: 158256
4. Click "Find My Team"
5. Navigate to `/leagues`
6. Verify leagues are displayed (not "No mini leagues found")

**Step 3: Remove test.fixme from knockout-demo.spec.ts**

```typescript
// Line 30: Change from:
test.fixme('complete flow: signup → connect → leagues → knockout', async ({ page }) => {

// To:
test('complete flow: signup → connect → leagues → knockout @critical @smoke', async ({ page }) => {

// Line 95: Change from:
test.fixme('login flow: existing user → dashboard → leagues', async ({ page }) => {

// To:
test('login flow: existing user → dashboard → leagues @critical', async ({ page }) => {
```

**Step 4: Run the tests**

Run: `npx playwright test knockout-demo.spec.ts --grep "complete flow|login flow"`
Expected: Both tests PASS

**Step 5: Commit**

```bash
git add e2e/knockout-demo.spec.ts
git commit -m "test(e2e): enable knockout demo flow tests

Tests now pass with PostgreSQL + Data Connect emulator setup."
```

---

## Task 4: Create Test Data Seeding Infrastructure

**Files:**
- Create: `e2e/fixtures/seed-tournaments.ts`
- Create: `e2e/fixtures/test-data.ts`
- Modify: `package.json` (add seed script)

**Step 1: Create test data definitions**

```typescript
// e2e/fixtures/test-data.ts
export const TEST_TOURNAMENTS = {
  activeTournament: {
    fplLeagueId: 314,
    fplLeagueName: 'Test League Active',
    status: 'active',
    currentRound: 1,
    totalRounds: 4,
    startGameweek: 15,
    participants: [
      { fplTeamId: 158256, teamName: 'o-win', seed: 1 },
      { fplTeamId: 100001, teamName: 'Test Team 2', seed: 2 },
      // ... 16 participants total
    ],
  },

  eliminatedUserTournament: {
    fplLeagueId: 315,
    fplLeagueName: 'Test League Eliminated',
    status: 'active',
    currentRound: 2,
    totalRounds: 4,
    startGameweek: 14,
    // Test user (158256) lost in round 1
    rounds: [
      {
        roundNumber: 1,
        matches: [
          {
            player1: { fplTeamId: 158256, score: 45 },
            player2: { fplTeamId: 100002, score: 67 },
            winnerId: 100002, // Test user lost
          },
          // ... other matches
        ],
      },
    ],
  },

  completedTournament: {
    fplLeagueId: 316,
    fplLeagueName: 'Test League Winner',
    status: 'completed',
    currentRound: 4,
    totalRounds: 4,
    startGameweek: 10,
    winnerId: 158256, // Test user won
  },
};

export const TEST_USERS = {
  withFplConnected: {
    email: 'testuser@knockoutfpl.com',
    fplTeamId: 158256,
    fplTeamName: 'o-win',
  },
  withNoTournaments: {
    email: 'notournaments@knockoutfpl.com',
    fplTeamId: 158257,
    fplTeamName: 'Empty User',
  },
};
```

**Step 2: Create seeding script**

```typescript
// e2e/fixtures/seed-tournaments.ts
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { TEST_TOURNAMENTS, TEST_USERS } from './test-data';

const app = initializeApp({
  projectId: 'knockoutfpl-dev',
});

const db = getFirestore(app);

async function seedTournaments() {
  console.log('Seeding test tournaments...');

  for (const [key, tournament] of Object.entries(TEST_TOURNAMENTS)) {
    const docRef = db.collection('tournaments').doc(key);
    await docRef.set({
      ...tournament,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Created tournament: ${key}`);
  }

  console.log('Seeding complete!');
}

seedTournaments().catch(console.error);
```

**Step 3: Add seed script to package.json**

```json
{
  "scripts": {
    "e2e:seed": "FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx e2e/fixtures/seed-tournaments.ts"
  }
}
```

**Step 4: Run seed script**

Run: `npm run emulators:e2e` (in terminal 1)
Run: `npm run e2e:seed`
Expected: "Seeding complete!" with 3 tournaments created

**Step 5: Commit**

```bash
git add e2e/fixtures/test-data.ts e2e/fixtures/seed-tournaments.ts package.json
git commit -m "feat(e2e): add test tournament seeding infrastructure

- Define test tournament scenarios (active, eliminated, winner)
- Create seeding script for Firebase emulator
- Add npm script for seeding"
```

---

## Task 5: Update Playwright Config for Data Seeding

**Files:**
- Modify: `playwright.config.ts` (add globalSetup)
- Create: `e2e/global-setup.ts`

**Step 1: Create global setup script**

```typescript
// e2e/global-setup.ts
import { execSync } from 'child_process';

async function globalSetup() {
  console.log('Running E2E global setup...');

  // Wait for emulators to be ready
  await waitForEmulators();

  // Seed test data
  console.log('Seeding test data...');
  execSync('npm run e2e:seed', { stdio: 'inherit' });

  console.log('Global setup complete!');
}

async function waitForEmulators() {
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch('http://localhost:9099');
      if (response.ok) {
        console.log('Emulators ready!');
        return;
      }
    } catch {
      // Not ready yet
    }
    attempts++;
    await new Promise(r => setTimeout(r, 1000));
  }

  throw new Error('Emulators did not start in time');
}

export default globalSetup;
```

**Step 2: Update playwright.config.ts**

Add globalSetup:

```typescript
export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  // ... rest of config
});
```

**Step 3: Verify setup runs before tests**

Run: `npx playwright test --grep @smoke`
Expected: Global setup runs, seeds data, then tests execute

**Step 4: Commit**

```bash
git add e2e/global-setup.ts playwright.config.ts
git commit -m "feat(e2e): add global setup for test data seeding

- Create global-setup.ts that waits for emulators and seeds data
- Update Playwright config to use globalSetup"
```

---

## Task 6: Enable Tournament Status Tests

**Files:**
- Modify: `e2e/journeys/returning-user.spec.ts` (remove test.fixme from 2 tests)
- Modify: `e2e/journeys/onboarding.spec.ts` (remove test.fixme from 2 tests)

**Step 1: Update returning-user.spec.ts**

```typescript
// Line 208: Change from:
test.fixme('should indicate eliminated status when user is out @dashboard @critical', async ({ page }) => {

// To:
test('should indicate eliminated status when user is out @dashboard @critical', async ({ page }) => {
  // Login as test user
  await loginAndWait(page);

  // Navigate to the eliminated tournament
  await page.goto('/knockout/315'); // eliminatedUserTournament
  await page.waitForLoadState('networkidle');

  // Verify user's match shows losing status
  await expect(page.locator('.opacity-50').filter({ hasText: /o-win/i })).toBeVisible();
});

// Line 240: Similar update for winner celebration test
test('should show winner celebration when tournament complete @dashboard @critical', async ({ page }) => {
  await loginAndWait(page);

  // Navigate to the completed tournament where user won
  await page.goto('/knockout/316'); // completedTournament
  await page.waitForLoadState('networkidle');

  // Verify tournament complete status
  await expect(page.getByText(/champion|winner|completed/i)).toBeVisible();
});
```

**Step 2: Update onboarding.spec.ts**

```typescript
// Line 153: Enable tournament display test
test('should display existing tournaments if user is in any @critical', async ({ page }) => {
  // Login as test user who has tournaments
  await page.goto('/login');
  await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: /log in/i }).click();

  await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });
  await page.goto('/dashboard');

  // Verify tournament cards are displayed
  await expect(page.getByText(/active|tournament/i)).toBeVisible({ timeout: 10000 });
});

// Line 163: Enable empty state test
test('should show "arena awaits" state when no tournaments exist', async ({ page }) => {
  // Login as user with no tournaments
  await page.goto('/login');
  await page.getByLabel('Email').fill('notournaments@knockoutfpl.com');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: /log in/i }).click();

  await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });
  await page.goto('/dashboard');

  // Verify empty state
  await expect(page.getByText(/arena awaits|no tournaments/i)).toBeVisible();
});
```

**Step 3: Run the tests**

Run: `npx playwright test --grep "eliminated|winner|existing tournaments|arena awaits"`
Expected: All 4 tests PASS

**Step 4: Commit**

```bash
git add e2e/journeys/returning-user.spec.ts e2e/journeys/onboarding.spec.ts
git commit -m "test(e2e): enable tournament status tests

Now passing with seeded tournament data:
- Eliminated user status
- Winner celebration
- Existing tournaments display
- Empty state for no tournaments"
```

---

## Task 7: Implement Public Bracket Route

**Files:**
- Modify: `src/router.tsx` (make /league/:id and /knockout/:id public)
- Modify: `src/pages/KnockoutPage.tsx` (handle anonymous viewing)
- Modify: `src/pages/LeaguePage.tsx` (handle anonymous viewing)

**Step 1: Update router.tsx**

```typescript
// Move these routes outside of ProtectedRoute
<Route path="/league/:leagueId" element={<LeaguePage />} />
<Route path="/knockout/:leagueId" element={<KnockoutPage />} />
```

**Step 2: Update KnockoutPage for anonymous viewing**

```typescript
// In KnockoutPage.tsx, add conditional rendering for anonymous users
const { user } = useAuth();

// Show bracket for all users, but different CTAs
{!user && (
  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
    <p>Sign in to claim your team and track your progress!</p>
    <Link to="/signup">
      <Button>Enter the Arena</Button>
    </Link>
  </div>
)}
```

**Step 3: Run router type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add src/router.tsx src/pages/KnockoutPage.tsx src/pages/LeaguePage.tsx
git commit -m "feat: enable public bracket viewing for shared links

- Make /league/:id and /knockout/:id publicly accessible
- Show sign-up CTA for anonymous users viewing brackets
- Bracket data still loads without authentication"
```

---

## Task 8: Enable Anonymous Viewing Tests

**Files:**
- Modify: `e2e/journeys/shared-link-viewer.spec.ts` (remove test.fixme from 4 tests)

**Step 1: Update shared-link-viewer.spec.ts**

```typescript
// Line 72: Enable public bracket viewing test
test('should display bracket without authentication @critical', async ({ page }) => {
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Should NOT redirect to login
  await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);

  // Bracket should be visible
  await expect(page.getByText(/REMAIN|\d+ teams/i)).toBeVisible({ timeout: 15000 });
});

// Line 84: Enable participants test
test('should show all participants and matchups', async ({ page }) => {
  await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Verify seeds are displayed
  await expect(page.getByText('(1)')).toBeVisible();
  await expect(page.getByText('(16)')).toBeVisible();
});

// Line 96: Enable round status test
test('should display current round status and scores', async ({ page }) => {
  await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Verify gameweek info
  await expect(page.getByText(/GW\s*\d+/)).toBeVisible({ timeout: 15000 });

  // Verify scores (2-3 digit numbers)
  const scores = page.locator('text=/^\\d{2,3}$/');
  await expect(scores.first()).toBeVisible();
});

// Also update lines 43-63 to remove redirect expectation
test('should NOT redirect anonymous users to login @smoke', async ({ page }) => {
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Should stay on league page (not redirect to login)
  await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);
});
```

**Step 2: Run anonymous viewing tests**

Run: `npx playwright test shared-link-viewer.spec.ts --grep "Anonymous"`
Expected: All anonymous viewer tests PASS

**Step 3: Commit**

```bash
git add e2e/journeys/shared-link-viewer.spec.ts
git commit -m "test(e2e): enable anonymous bracket viewing tests

Public routes now work, tests verify:
- Bracket displays without auth
- All participants visible
- Round status and scores shown"
```

---

## Task 9: Enable Remaining Feature Tests

**Files:**
- Modify: `e2e/journeys/shared-link-viewer.spec.ts` (claim team test - line 111)
- Modify: `e2e/journeys/new-user-first-tournament.spec.ts` (share functionality tests)

**Step 1: Keep claim team as fixme (requires feature work)**

```typescript
// Line 111: Keep as fixme - requires "Claim team" feature implementation
test.fixme('should show claim team buttons on each participant', async () => {
  // This requires the "Claim team" feature to be built
  // See: docs/business/product/journeys/shared-link-viewer.md
});
```

**Step 2: Keep share functionality as fixme (requires feature work)**

```typescript
// new-user-first-tournament.spec.ts Line 262
// Keep as fixme - share UI not yet implemented
test.fixme('should display share prompt with copy link functionality @tournament', async ({ page }) => {
  // Share functionality is a future feature
});
```

**Step 3: Update duplicate tournament test**

```typescript
// Line 217: This test can be enabled once data persistence works
test('should prevent duplicate tournament for same league @tournament', async ({ page }) => {
  await signupAndConnect(page, 'Duplicate Preventer');

  // First navigation
  const leagueCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
  await leagueCard.getByRole('button', { name: 'Start Knockout' }).click();
  await page.waitForLoadState('networkidle');

  // Second navigation - should show same tournament
  await page.goto('/leagues');
  await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

  const leagueCardAgain = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
  await leagueCardAgain.getByRole('button', { name: 'Start Knockout' }).click();

  // Should show existing tournament (same bracket)
  await expect(page.getByText(/Active|16 REMAIN|\d+ teams/)).toBeVisible({ timeout: 10000 });
});
```

**Step 4: Run all tests**

Run: `npm run test:e2e`
Expected: All tests pass except 3 intentionally skipped (claim team, share, match status)

**Step 5: Commit**

```bash
git add e2e/journeys/shared-link-viewer.spec.ts e2e/journeys/new-user-first-tournament.spec.ts
git commit -m "test(e2e): enable duplicate tournament prevention test

Remaining fixme tests require feature work:
- Claim team buttons (feature not built)
- Share functionality (feature not built)
- Match status (requires more complex seeding)"
```

---

## Verification Checklist

After completing all tasks:

- [ ] PostgreSQL starts via Docker: `npm run db:start`
- [ ] Emulators connect to PostgreSQL: `npm run emulators:e2e`
- [ ] Data seeding works: `npm run e2e:seed`
- [ ] All E2E tests run: `npm run test:e2e`
- [ ] Previously skipped tests now pass (11 of 14)
- [ ] 3 remaining fixme tests are documented as requiring feature work

---

## Test Status After Implementation

| Test File | Test Name | Status |
|-----------|-----------|--------|
| knockout-demo.spec.ts | complete flow | **ENABLED** |
| knockout-demo.spec.ts | login flow | **ENABLED** |
| returning-user.spec.ts | eliminated status | **ENABLED** |
| returning-user.spec.ts | winner celebration | **ENABLED** |
| onboarding.spec.ts | existing tournaments | **ENABLED** |
| onboarding.spec.ts | arena awaits | **ENABLED** |
| shared-link-viewer.spec.ts | bracket without auth | **ENABLED** |
| shared-link-viewer.spec.ts | participants and matchups | **ENABLED** |
| shared-link-viewer.spec.ts | round status and scores | **ENABLED** |
| shared-link-viewer.spec.ts | claim team buttons | FIXME (feature) |
| shared-link-viewer.spec.ts | match status | FIXME (seeding) |
| new-user-first-tournament.spec.ts | duplicate prevention | **ENABLED** |
| new-user-first-tournament.spec.ts | share functionality | FIXME (feature) |

---

## Commands Reference

```bash
# Start PostgreSQL
npm run db:start

# Start emulators with PostgreSQL
npm run emulators:e2e

# Seed test data
npm run e2e:seed

# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test knockout-demo.spec.ts

# Run with UI for debugging
npm run test:e2e:ui
```
