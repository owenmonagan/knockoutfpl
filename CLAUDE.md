# Knockout FPL - Development Guide

> **Note:** For product vision, features, and roadmap, see [PRODUCT.md](./PRODUCT.md)

This document describes our development process, technical stack, and implementation guidelines.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **Backend:** Firebase (Auth, DataConnect, Cloud Functions)
- **FPL API:** Unofficial public endpoints (proxied via Cloud Functions)
- **Hosting:** Firebase Hosting
- **Testing:** Playwright MCP for automated browser testing

---

## 🧪 Testing Approach

**Playwright MCP Integration:**
- Configured Playwright MCP server for automated browser testing
- Setup command: `claude mcp add playwright npx @playwright/mcp@latest`
- Enables autonomous testing via Claude Code with browser automation
- Screenshots saved to `.playwright-mcp/`

**Quality Standards:**
- All critical user flows must be validated
- No console errors in production
- Performance: Page loads < 500ms

### E2E Testing Strategy

**Follow the Testing Pyramid:**

```
        /\
       /  \  ← 5-10% E2E Tests (Playwright MCP)
      /____\    Slow, strategic, milestone-based
     /      \
    /        \ ← 15-20% Integration Tests
   /__________\   Test component interactions
  /            \
 /              \ ← 70-80% Unit Tests (Vitest)
/________________\  Fast, run frequently
```

**Philosophy:**
- **Unit tests (Vitest)**: Run frequently during development
- **E2E tests (Playwright MCP)**: Run at feature completion milestones
- **DO NOT** run E2E tests on every code change (too slow)
- **DO** run E2E tests before committing user-facing features

#### When to Use Playwright MCP

**ALWAYS verify with Playwright MCP after:**

1. **Forms Implementation**
   - Login/signup forms
   - Tournament creation forms
   - FPL league ID input
   - Form validation and submission flows

2. **Authentication Flows**
   - User registration complete flow
   - Login → Dashboard navigation
   - Logout and session handling
   - Protected route access

3. **Navigation & Routing**
   - New pages or route additions
   - Navigation menu changes
   - Conditional rendering based on auth state
   - Deep linking and URL parameters

4. **API Integration**
   - FPL API data fetching and display
   - Firebase API operations (read/write)
   - Error handling for API failures
   - Loading states during async operations

5. **Critical User Journeys**
   - Signup → Dashboard
   - Import league → Create tournament → View bracket
   - Dashboard data loading and real-time updates

**OPTIONAL for Playwright MCP:**
- Pure utility functions (no UI)
- Styling/CSS changes (unless affecting usability)
- Refactoring with no behavior changes
- Type definitions or configuration

#### E2E Verification Workflow

**Recommended flow:**

```bash
# 1. Development Cycle
Write tests → Implement → Refactor → Repeat

# 2. Feature Complete Milestone
All unit tests passing ✓

# 3. E2E Verification
npm run dev  # Start dev server
# Use Playwright MCP tools to verify user flow
# Check console for errors
# Verify expected behavior

# 4. Commit
git add . && git commit -m "Feature: ..."
```

**E2E Verification Checklist:**
- [ ] Navigate to feature page/component
- [ ] Interact with UI (click, type, submit)
- [ ] Verify expected behavior (navigation, data display, state changes)
- [ ] Test error cases (invalid input, network failures)
- [ ] Check console for errors: `mcp__playwright__browser_console_messages`
- [ ] Verify loading states appear/disappear correctly
- [ ] Test mobile viewport if applicable

#### Available Playwright MCP Tools

```typescript
// Navigation
mcp__playwright__browser_navigate({ url: 'http://localhost:5173/login' })

// Page state capture (better than screenshots)
mcp__playwright__browser_snapshot()

// User interactions
mcp__playwright__browser_click({ element: 'Submit button', ref: '...' })
mcp__playwright__browser_type({ element: 'Email input', text: 'user@example.com' })
mcp__playwright__browser_fill_form({ fields: [...] })

// Verification
mcp__playwright__browser_console_messages({ onlyErrors: true })
mcp__playwright__browser_evaluate({ function: '() => document.title' })

// Visual verification
mcp__playwright__browser_take_screenshot({ filename: 'feature-test.png' })
```

#### Example: Login Form E2E Verification

```typescript
// After unit tests pass for LoginForm component:

// 1. Start dev server
npm run dev

// 2. Use Playwright MCP
await browser_navigate('http://localhost:5173/login')
await browser_snapshot()  // Capture initial state

// 3. Fill form
await browser_fill_form([
  { name: 'email', type: 'textbox', ref: '[data-testid="email"]', value: 'test@example.com' },
  { name: 'password', type: 'textbox', ref: '[data-testid="password"]', value: 'password123' }
])

// 4. Submit and verify
await browser_click({ element: 'Login button', ref: 'button[type="submit"]' })
await browser_wait_for({ text: 'Dashboard' })  // Wait for navigation

// 5. Check console
const messages = await browser_console_messages({ onlyErrors: true })
// Verify no errors

// ✓ E2E verification complete!
```

#### Quick Reference

**Use `/e2e-verify` command** for guided E2E verification workflow.

**Smart E2E Reminder Hook:**
A hook automatically suggests E2E verification when:
- Unit tests are passing ✓
- Critical files modified (forms, auth, navigation, services)

**When in doubt:** Run unit tests constantly, run E2E tests at milestones.

---

### Integrated E2E Workflow

We now have **automated Playwright E2E tests** that integrate seamlessly with your development workflow. Tests are organized by feature and can be run selectively based on what you're working on.

#### E2E Test Organization

Tests are organized in `e2e/` by feature:

```
e2e/
├── auth.spec.ts        # Authentication flows (signup, login, logout)
├── navigation.spec.ts  # Routing and protected routes
└── dashboard.spec.ts   # Dashboard functionality
```

Each test is tagged for selective running:
- **@smoke** - Critical smoke tests (fast, should always pass)
- **@critical** - Critical user flows
- **@auth** - Authentication-related tests
- **@navigation** - Navigation and routing tests
- **@dashboard** - Dashboard functionality tests

#### Running E2E Tests

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run by feature/tag:**
```bash
npm run test:e2e:smoke       # Only smoke tests
npm run test:e2e:auth        # Only auth tests
npm run test:e2e:navigation  # Only navigation tests
npm run test:e2e:dashboard   # Only dashboard tests
npm run test:e2e:critical    # Only critical tests
```

**Interactive mode (recommended for development):**
```bash
npm run test:e2e:watch       # Opens Playwright UI
```

**Run unit + smoke E2E tests:**
```bash
npm run test:critical        # Fast confidence check
```

**Run full test suite:**
```bash
npm run test:all             # Unit tests + all E2E tests
```

#### Selective E2E Watcher (Experimental)

The **selective E2E watcher** watches your source files and automatically triggers relevant E2E tests when critical files change:

```bash
npm run test:e2e:selective
```

**How it works:**
1. Watches `src/` for file changes
2. Matches changed files against patterns in `.e2e-watch.json`
3. Runs unit tests first (if they fail, skips E2E)
4. Runs only relevant E2E tests based on file-to-tag mapping
5. Debounces to avoid excessive test runs

**File-to-Tag Mapping:**
- `src/components/auth/**` → `@auth` tests
- `src/pages/LoginPage.*` → `@auth` tests
- `src/services/auth.*` → `@auth` tests
- `src/pages/DashboardPage.*` → `@dashboard` tests
- `src/services/{fpl,user}.*` → `@dashboard` tests
- `src/router.*` → `@navigation` tests
- `src/components/auth/ProtectedRoute.*` → `@navigation` + `@auth` tests

Configure mappings in `.e2e-watch.json`.

#### Recommended Development Workflow

**For New Features:**

```bash
# Terminal 1: Unit test watcher (constant feedback)
npm run test:watch

# Terminal 2: Dev server
npm run dev

# Your development cycle:
1. Write unit test
2. Implement code
3. Refactor
4. Repeat until feature complete

# When feature milestone complete:
npm run test:e2e:smoke    # Quick E2E sanity check
# OR
npm run test:e2e:auth     # Run specific feature E2E tests

# Before committing:
npm run test:critical      # Unit + smoke E2E tests
```

**For Selective E2E Integration:**

```bash
# Terminal 1: Selective E2E watcher
npm run test:e2e:selective

# Terminal 2: Unit test watcher
npm run test:watch

# Terminal 3: Dev server
npm run dev

# E2E tests auto-run when you modify critical files
# Example: Edit src/components/auth/LoginForm.tsx
#   → Runs unit tests first
#   → Runs @auth E2E tests if unit tests pass
```

**For Deep E2E Work:**

```bash
# Use Playwright UI for interactive test development
npm run test:e2e:watch

# Debug specific test
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

#### E2E Test Writing Guidelines

**1. Use Tags:**
```typescript
test('should login successfully @auth @critical', async ({ page }) => {
  // Test code
});
```

**2. Group Related Tests:**
```typescript
test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for all tests in group
  });

  test('signup @auth @smoke', async ({ page }) => { ... });
  test('login @auth @critical', async ({ page }) => { ... });
});
```

**3. Check Console Errors:**
```typescript
test('should have no console errors @smoke', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/');
  expect(consoleErrors).toHaveLength(0);
});
```

**4. Use Descriptive Selectors:**
```typescript
// Good: Semantic selectors
await page.getByLabel('Email').fill('user@example.com');
await page.getByRole('button', { name: 'Log In' }).click();

// Avoid: Fragile CSS selectors
await page.locator('.btn-primary').click();
```

**5. Wait for Network Idle:**
```typescript
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');
```

#### E2E Test Best Practices

✅ **DO:**
- Write smoke tests that are fast and stable
- Tag tests appropriately for selective running
- Test critical user flows end-to-end
- Check for console errors
- Use semantic selectors (labels, roles, text)
- Group related tests with `test.describe()`

❌ **DON'T:**
- Run full E2E suite on every code change (too slow)
- Write E2E tests for things covered by unit tests
- Use brittle CSS class selectors
- Forget to wait for network/loading states
- Mix concerns (one test = one user flow)

#### Pre-commit E2E Testing

Before committing, run:
```bash
npm run test:critical    # Unit + smoke E2E tests
```

A pre-commit hook (see below) can enforce this automatically.

---

## 🏗️ Technical Architecture

### Frontend Structure

**Component Library:**
- Using **shadcn/ui** for consistent, accessible UI components
- Tailwind CSS for utility-first styling
- TypeScript for type safety

**Key Design Patterns:**
- Component composition over inheritance
- Custom hooks for shared logic
- Context API for state management (where appropriate)

### Backend (Firebase)

**Services:**
- **Firebase Auth:** Email/password authentication
- **Firebase DataConnect:** PostgreSQL-backed database for users and tournaments
- **Cloud Functions:** API proxying and scheduled tasks
- **Firebase Hosting:** Static site deployment

---

## 📊 Database Schema (DataConnect)

DataConnect uses a GraphQL schema with PostgreSQL as the underlying database. Schema is defined in `dataconnect/schema/schema.gql`.

### Tables

#### `User` Table
```graphql
type User @table {
  id: ID!                      # Firebase Auth UID
  fplTeamId: Int              # e.g., 158256
  fplTeamName: String         # e.g., "Owen's Team" (from FPL API)
  email: String!
  displayName: String
  wins: Int! @default(value: 0)
  losses: Int! @default(value: 0)
  createdAt: Timestamp! @default(expr: "request.time")
  updatedAt: Timestamp! @default(expr: "request.time")
}
```

#### `Tournament` Table
```graphql
type Tournament @table {
  id: UUID! @default(expr: "uuidV4()")
  fplLeagueId: Int!            # FPL classic league ID
  fplLeagueName: String!       # League name from FPL API
  creator: User!               # References User table
  startGameweek: Int!          # First round gameweek
  currentRound: Int!           # 1-indexed
  totalRounds: Int!            # Calculated from participant count
  status: String!              # 'active' | 'completed'
  winnerId: Int                # FPL team ID of winner
  createdAt: Timestamp! @default(expr: "request.time")
  updatedAt: Timestamp! @default(expr: "request.time")
}
```

#### `Participant` Table
```graphql
type Participant @table {
  id: UUID! @default(expr: "uuidV4()")
  tournament: Tournament!
  fplTeamId: Int!
  fplTeamName: String!
  seed: Int!
  eliminatedRound: Int         # null if still active
}
```

#### `Match` Table
```graphql
type Match @table {
  id: UUID! @default(expr: "uuidV4()")
  tournament: Tournament!
  round: Int!
  position: Int!               # Position within round
  player1: Participant
  player2: Participant
  player1Score: Int
  player2Score: Int
  winner: Participant
  gameweek: Int!
}
```

**Access Control:**
- Queries and mutations are defined in `dataconnect/connector/` directory
- Access is controlled via Firebase Auth integration

---

## 🔑 FPL API Integration

### Cloud Functions

**Proxy Functions:**

```javascript
// Proxy to avoid CORS issues
functions.https.onCall('getFPLTeamData', async (data) => {
  const { teamId, gameweek } = data;
  // Fetch from fantasy.premierleague.com/api/entry/{teamId}/event/{gameweek}/picks/
  // Return entry_history.points and team name
});

functions.https.onCall('getCurrentGameweek', async () => {
  // Fetch from bootstrap-static/, find is_current: true
  // Return current gameweek number and deadline
});

// Scheduled function to update completed gameweeks
functions.pubsub.schedule('every 2 hours').onRun(async () => {
  // Find active tournaments where current round gameweek has finished
  // Fetch scores for all matches in the round
  // Determine winners and advance to next round
  // Mark tournament complete when final is done
});
```

### Key Endpoints

**1. Bootstrap Static:** `https://fantasy.premierleague.com/api/bootstrap-static/`
- Get current gameweek (events array, filter `is_current: true`)

**2. Team Picks:** `https://fantasy.premierleague.com/api/entry/{teamId}/event/{gameweek}/picks/`
- Get `entry_history.points` for final gameweek score
- Use after gameweek `finished: true`

**3. Team Info:** `https://fantasy.premierleague.com/api/entry/{teamId}/`
- Verify team exists, get team name

### API Considerations
- ⚠️ **CORS:** Must proxy through Cloud Functions
- ⚠️ **No Auth Needed:** Public endpoints work without login
- ⚠️ **Bonus Points:** Use final scores only (not live) for MVP
- ⚠️ **Rate Limits:** Not officially documented, implement basic caching

---

## 📁 Project Structure

```
knockoutfpl/
├── src/
│   ├── components/      # Reusable UI components (shadcn/ui)
│   ├── services/        # Firebase and API services
│   ├── lib/             # Utilities and helpers
│   ├── App.tsx          # Main application component
│   └── index.css        # Global styles (Tailwind)
├── dataconnect/
│   ├── schema/          # GraphQL schema definitions
│   ├── connector/       # Queries and mutations
│   └── dataconnect-generated/  # Generated TypeScript SDK
├── functions/           # Firebase Cloud Functions
├── e2e/                 # Playwright E2E tests
├── .playwright-mcp/     # Playwright test artifacts
├── CLAUDE.md           # This file (development guide)
└── PRODUCT.md          # Product vision and roadmap
```

---

## 🚀 Development Workflow

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Run Tests:**
   ```bash
   npm test
   ```

3. **Watch Mode (Auto-test on changes):**
   ```bash
   npm run test:watch
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

---

## 💡 Best Practices

### Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Keep components small and focused
- Use descriptive variable and function names

### Component Development

**shadcn/ui First Approach:**
- **ALWAYS** look for a shadcn/ui component BEFORE using raw HTML elements
- We should **almost NEVER use `<div>`** - find the correct shadcn component first
- Only use `<div>` for truly custom concepts that don't have a shadcn equivalent
- Use the default style from [shadcn/ui docs](https://ui.shadcn.com/docs)

**Adding Components:**
```bash
npx shadcn@latest add label
npx shadcn@latest add button
npx shadcn@latest add card
# etc.
```

**Usage Examples:**
```tsx
// Labels
<Label htmlFor="email">Your email address</Label>

// Buttons
<Button variant="outline">Button</Button>
<Button variant="default">Submit</Button>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

**Other Guidelines:**
- Keep state as local as possible
- Extract shared logic into custom hooks
- Use Tailwind utility classes only for spacing and layout tweaks

### Testing
- Test critical user flows end-to-end
- Use Playwright MCP for browser automation
- Validate accessibility standards
- Check for console errors

### Firebase
- Always validate user permissions in security rules
- Use Cloud Functions for sensitive operations
- Implement proper error handling
- Cache external API calls appropriately

### Test Credentials

For E2E testing and manual verification, use these test account credentials:

**Test Account:**
- **Email:** `testuser@knockoutfpl.com`
- **Password:** `TestPass123!`
- **Display Name:** Test User
- **Created:** October 13, 2025

**Usage:**
- Use this account for Playwright MCP E2E verification
- Use for manual testing of features
- Account is pre-configured in Firebase Auth (local emulator or dev environment)

**To login:**
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to login page
# http://localhost:5173/login (or whatever port Vite assigns)

# 3. Enter credentials:
# Email: testuser@knockoutfpl.com
# Password: TestPass123!
```

---

For product features, implementation timeline, and roadmap, see [PRODUCT.md](./PRODUCT.md)
