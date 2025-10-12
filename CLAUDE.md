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

---

For product features, implementation timeline, and roadmap, see [PRODUCT.md](./PRODUCT.md)
