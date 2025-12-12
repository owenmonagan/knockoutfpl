# Knockout FPL - Development Guide

> **Note:** For product vision, features, and roadmap, see [PRODUCT.md](./PRODUCT.md)

This document describes our development process, technical stack, and implementation guidelines.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **FPL API:** Unofficial public endpoints (proxied via Cloud Functions)
- **Hosting:** Firebase Hosting
- **Testing:** Playwright MCP for automated browser testing
- **Development:** TDD Guard for test-driven development workflow

---

## 🧪 Development Methodology

### Test-Driven Development (TDD)

We use **TDD Guard** to maintain a test-driven workflow:

- **TDD Guard Integration:** Automatically runs tests on file changes
- **Configuration:** See `.tdd-guard.json` for setup
- **Workflow:**
  1. Write failing test
  2. Implement minimal code to pass
  3. Refactor and improve
  4. Repeat

### Micro-TDD Philosophy

We practice **micro-TDD**: working in the smallest possible increments to maximize quality and confidence.

**What is Micro-TDD?**
- **One tiny behavior** = **One test** = **One implementation**
- Each Red-Green-Refactor cycle should take **1-3 minutes**
- Break down features into atomic behaviors
- Example progression:
  ```
  ✓ Button renders
  ✓ Button has correct text
  ✓ Button has correct variant
  ✓ Button responds to click
  ✓ Button shows loading state when processing
  ✓ Button calls onSubmit handler
  ```

**Core Principles:**

1. **Never Skip Ahead**
   - Resist the urge to implement multiple behaviors at once
   - Each test must be the simplest next step
   - Trust that small steps compound quickly

2. **Never Ask to Continue**
   - TDD is expected to be slow and thorough
   - 2-3 hours for a complete component is normal and desired
   - Keep going until ALL work is complete
   - Speed comes from confidence, not shortcuts

3. **Red-Green-Refactor Discipline**
   - **Red:** Write the smallest possible failing test
   - **Green:** Write minimal code to make it pass (no more, no less)
   - **Refactor:** Clean up while tests stay green
   - **Repeat:** Immediately move to next micro-behavior

4. **Complete Everything**
   - Finish entire components/features in one session
   - Don't leave partial implementations
   - Each passing test is permanent progress
   - Slow and steady prevents bugs and rework

**Why Micro-TDD?**
- **Prevents bugs:** Each behavior is independently verified
- **Builds confidence:** Every change is immediately validated
- **Enables refactoring:** Comprehensive test coverage
- **Reduces debugging:** Problems are caught at the smallest scope
- **Documents intent:** Tests serve as living specifications

**Hook Reminder:**
A hook fires on every prompt to remind Claude to follow micro-TDD discipline.

### Testing Approach

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
/________________\  Fast, constant during TDD
```

**Philosophy:**
- **Unit tests (Vitest)**: Run constantly during TDD Red-Green-Refactor cycle
- **E2E tests (Playwright MCP)**: Run at feature completion milestones
- **DO NOT** run E2E tests on every code change (too slow, breaks TDD flow)
- **DO** run E2E tests before committing user-facing features

#### When to Use Playwright MCP

**ALWAYS verify with Playwright MCP after:**

1. **Forms Implementation**
   - Login/signup forms
   - Challenge creation forms
   - FPL team ID input
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
   - Signup → FPL connection → Dashboard
   - Create challenge → Opponent accepts → View results
   - Dashboard data loading and real-time updates

**OPTIONAL for Playwright MCP:**
- Pure utility functions (no UI)
- Styling/CSS changes (unless affecting usability)
- Refactoring with no behavior changes
- Type definitions or configuration

#### E2E Verification Workflow

**Recommended flow:**

```bash
# 1. TDD Cycle (Unit Tests)
Write test (Red) → Implement (Green) → Refactor (Green) → Repeat

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

### Integrated E2E TDD Workflow

We now have **automated Playwright E2E tests** that integrate seamlessly with your TDD workflow. Tests are organized by feature and can be run selectively based on what you're working on.

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

#### Recommended TDD Workflow

**For New Features:**

```bash
# Terminal 1: Unit test watcher (constant feedback)
npm run test:watch   # or: tdd-guard

# Terminal 2: Dev server
npm run dev

# Your TDD cycle:
1. Write unit test (Red)
2. Implement code (Green)
3. Refactor (Green)
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
- **Firestore:** NoSQL database for users and challenges
- **Cloud Functions:** API proxying and scheduled tasks
- **Firebase Hosting:** Static site deployment

---

## 📊 Database Schema (Firestore)

### Collections Structure

#### `users` Collection
```typescript
{
  userId: string;              // Firebase Auth UID (document ID)
  fplTeamId: number;          // e.g., 158256
  fplTeamName: string;        // e.g., "Owen's Team" (from FPL API)
  email: string;
  displayName: string;
  wins: number;               // Total wins
  losses: number;             // Total losses
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `fplTeamId` (for quick lookup/validation)

#### `challenges` Collection
```typescript
{
  challengeId: string;         // Auto-generated (document ID)
  gameweek: number;            // 1-38
  status: 'pending' | 'accepted' | 'active' | 'completed';

  // Creator (person who created the challenge)
  creatorUserId: string;
  creatorFplId: number;
  creatorFplTeamName: string;
  creatorScore: number | null;

  // Opponent (person who accepts)
  opponentUserId: string | null;     // null until accepted
  opponentFplId: number | null;
  opponentFplTeamName: string | null;
  opponentScore: number | null;

  // Results
  winnerId: string | null;    // userId of winner
  isDraw: boolean;            // true if scores are equal

  // Timestamps
  gameweekDeadline: Timestamp;       // When gameweek locks
  gameweekFinished: boolean;         // From FPL API
  completedAt: Timestamp | null;     // When scores were fetched
  createdAt: Timestamp;
}
```

**Indexes:**
- `creatorUserId` + `status` (for user's challenges)
- `opponentUserId` + `status` (for user's challenges)
- `status` + `gameweekFinished` (for scheduled function)

**Security Rules:**
- Users can read challenges they're part of (creator or opponent)
- Users can create challenges
- Only the opponent can update a pending challenge to accept
- Only Cloud Functions can update scores and status to completed

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
  // Find active challenges where gameweek has finished
  // Fetch both teams' scores
  // Update challenge with scores and winner
  // Update user win/loss records
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
├── functions/           # Firebase Cloud Functions
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

3. **TDD Guard (Auto-test on changes):**
   ```bash
   tdd-guard
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
