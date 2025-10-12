# Fantasy Premier League Knockout MVP Plan

## Project Overview

A web application that allows fantasy premier league users to challenge each other to head to head matches using their classic fantasy premier league team.

For example: https://fantasy.premierleague.com/entry/158256/event/7 vs https://fantasy.premierleague.com/entry/71631/event/7, where entry 158256 got 78 points, which beats entry 71631 76 points.

There is an informal but existing fantasy premier league API. Eventually, we will expand this product into full knockout tournaments.

**Core Value Proposition:** Provide an exciting way to compete against other players without worrying about your season and league standings.

---

## 🎯 MVP Core Features

**Scope:** Two FPL managers challenge each other to a head-to-head match for a specific gameweek. Winner is determined by total points scored.

**Core User Flow:**
1. **Sign Up/Login** → Email/password via Firebase Auth
2. **Connect FPL Team** → User enters their FPL Team ID (e.g., 158256)
3. **Create Challenge** → Select gameweek, get shareable link
4. **Share & Accept** → Opponent clicks link, connects their FPL ID, accepts
5. **Wait for Gameweek** → Challenge locks at gameweek deadline
6. **View Results** → After gameweek ends, system fetches points and shows winner

**Features:**
- ✅ Create 1v1 challenges for any gameweek
- ✅ Share challenge via URL
- ✅ Automatic score fetching after gameweek ends
- ✅ Challenge history (upcoming, active, completed)
- ✅ Simple win/loss record
- ✅ User profile with FPL ID verification
- ✅ Manual score refresh button

**What's OUT (Phase 2+):**
- ❌ Live scoring during matches
- ❌ Tournaments/brackets
- ❌ In-app messaging
- ❌ Push notifications
- ❌ Prizes/payments
- ❌ Mini-leagues

---

## 🏗️ Technical Architecture

**Tech Stack:**
- **Frontend:** React 18 + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **FPL API:** Unofficial public endpoints (proxied via Cloud Functions)
- **Hosting:** Firebase Hosting

### Frontend (React + Vite + TypeScript + shadcn/ui)

**Pages:**
- `/` - Landing page with auth
- `/dashboard` - User's challenges overview
- `/create` - Create new challenge
- `/challenge/:id` - Challenge detail/accept page
- `/profile` - User profile with FPL ID

**Key Components:**
- `ChallengeCard` - Display challenge status
- `FPLTeamConnect` - Input/verify FPL Team ID
- `ScoreDisplay` - Show both teams' points
- `ChallengeStatus` - Upcoming/Active/Complete badges

### Backend (Firebase)

**Firestore Collections:**

```typescript
users/
  {userId}/
    - fplTeamId: number
    - fplTeamName: string
    - email: string
    - displayName: string
    - wins: number
    - losses: number
    - createdAt: timestamp
    - updatedAt: timestamp

challenges/
  {challengeId}/
    - gameweek: number
    - status: 'pending' | 'accepted' | 'active' | 'completed'
    - creatorUserId: string
    - creatorFplId: number
    - creatorFplTeamName: string
    - creatorScore: number | null
    - opponentUserId: string | null
    - opponentFplId: number | null
    - opponentFplTeamName: string | null
    - opponentScore: number | null
    - winnerId: string | null
    - isDraw: boolean
    - gameweekDeadline: timestamp
    - gameweekFinished: boolean
    - completedAt: timestamp | null
    - createdAt: timestamp
```

**Cloud Functions:**

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

---

## 🔑 FPL API Integration

**Key Endpoints (via Cloud Functions):**

1. **Bootstrap Static:** `https://fantasy.premierleague.com/api/bootstrap-static/`
   - Get current gameweek (events array, filter `is_current: true`)

2. **Team Picks:** `https://fantasy.premierleague.com/api/entry/{teamId}/event/{gameweek}/picks/`
   - Get `entry_history.points` for final gameweek score
   - Use after gameweek `finished: true`

3. **Team Info:** `https://fantasy.premierleague.com/api/entry/{teamId}/`
   - Verify team exists, get team name

**Important API Considerations:**
- ⚠️ **CORS:** Must proxy through Cloud Functions
- ⚠️ **No Auth Needed:** Public endpoints work without login
- ⚠️ **Bonus Points:** Use final scores only (not live) for MVP
- ⚠️ **Rate Limits:** Not officially documented, implement basic caching

---

## 🚀 Longer-Term Roadmap

### Phase 2: Enhanced Experience
- Live scoring during gameweeks (provisional points)
- Rich FPL team display (players, formations, captain)
- Challenge reminders via email
- Head-to-head statistics and analytics
- Challenge activity feed

### Phase 3: Social Features
- Friend system for easy challenging
- Challenge activity feed
- Mini-leagues for 3+ users (round robin)
- Trash talk comments on challenges
- User profiles with stats and badges

### Phase 4: Tournaments
- Knockout brackets (4, 8, 16 players)
- Automatic bracket progression each gameweek
- Tournament leaderboards and prizes
- Custom tournament rules (chips allowed/banned)
- Entry fees (if legal/approved)

---


## 📝 Implementation Steps

### Setup (1 day)
- Initialize Vite + React + TypeScript
- Setup Firebase project (Auth, Firestore, Functions)
- Install shadcn/ui, configure Tailwind

### Auth & Profile (1 day)
- Firebase Auth integration
- FPL Team ID connection flow
- Profile page with win/loss record

### Cloud Functions (1 day)
- FPL API proxy functions
- Score fetching logic
- Scheduled gameweek completion checker

### Challenge Flow (2 days)
- Create challenge page
- Challenge accept page (shareable link)
- Challenge detail view with scores

### Dashboard (1 day)
- List challenges (upcoming, active, completed)
- Manual refresh scores button
- Basic stats display

### Polish (1 day)
- Error handling
- Loading states
- Responsive design
- Deploy to Firebase Hosting

**Total Estimate:** 7 days for functional MVP

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

## 🧪 Testing & Quality Assurance

### Automated Testing Setup

**Playwright MCP Integration:**
- Configured Playwright MCP server for automated browser testing
- Setup command: `claude mcp add playwright npx @playwright/mcp@latest`
- Enables autonomous testing via Claude Code with browser automation

**Test Artifacts:**
- Screenshots saved to `.playwright-mcp/`
- All critical user flows validated
- No console errors (after bug fix)
- Performance: Page loads < 500ms

---

## 🚀 Future Enhancements (Post-MVP)

### Phase 2: Enhanced Experience
- Live scoring during gameweeks
- Rich FPL team display (players, formations)
- Challenge reminders via email
- Head-to-head statistics

### Phase 3: Social Features
- Friend system
- Challenge activity feed
- Mini-leagues for multiple users
- Trash talk comments

### Phase 4: Tournaments
- Knockout brackets (4, 8, 16 players)
- Automatic bracket progression
- Tournament leaderboards
- Entry fees (if legal/approved)

---

**This MVP focuses on the absolute core: two people, one gameweek, winner takes glory. Simple, testable, and expandable.**
