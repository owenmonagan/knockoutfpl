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
