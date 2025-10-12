# Knockout FPL - Product Vision & Roadmap

## Project Overview

A web application that allows fantasy premier league users to challenge each other to head-to-head matches using their classic fantasy premier league team.

For example: https://fantasy.premierleague.com/entry/158256/event/7 vs https://fantasy.premierleague.com/entry/71631/event/7, where entry 158256 got 78 points, which beats entry 71631 76 points.

There is an informal but existing fantasy premier league API. Eventually, we will expand this product into full knockout tournaments.

**Core Value Proposition:** Provide an exciting way to compete against other players without worrying about your season and league standings.

---

## 📍 Current Status: Advanced Matchup Visualization Prototype

**What's Working Now:**
- ✅ React 18 + Vite + TypeScript foundation
- ✅ shadcn/ui component library integrated
- ✅ Tailwind CSS styling system
- ✅ FPL API integration via Vite proxy (CORS bypass)
- ✅ Advanced team comparison with detailed matchup analysis
- ✅ Differential player identification and matchup creation
- ✅ Common player tracking (non-differentials)
- ✅ Visual matchup cards with population-style progress bars
- ✅ Player-by-player score breakdown by position
- ✅ Chip detection and display (BB, 3xC, FH, WC)
- ✅ Swing-based matchup ranking
- ✅ Industry-standard "Matchup" terminology throughout
- ✅ Matchup summary statistics (biggest swing, closest matchup, etc.)
- ✅ TDD workflow with TDD Guard + Vitest
- ✅ Playwright MCP for automated E2E testing
- ✅ Comprehensive test coverage

**Current Capabilities:**
Users can compare two FPL teams for any gameweek by entering team IDs. The app:
- Fetches live FPL data for both teams and all players
- Identifies differential players (unique to each team or different multipliers)
- Creates strategic matchups sorted by impact/price
- Displays visual "head-to-head" matchup cards with point swings
- Shows common players separately (collapsible section)
- Displays active chips for each manager
- Provides detailed matchup statistics and insights

This establishes a rich, engaging comparison experience that goes beyond simple score totals, highlighting the key battles that decided the outcome.

**Technical Highlights:**
- **Smart Matchup Algorithm:** Captain differentials matched first, then position-based matching (FWD → MID → DEF → GK) sorted by player price within positions
- **Visual Design:** Population chart-style progress bars that scale based on swing magnitude relative to the largest swing (not absolute points)
- **Differential Logic:** Identifies unique players OR players with different multipliers (e.g., one team captains Salah, other doesn't)
- **Type Safety:** Full TypeScript implementation with strict typing for FPL data structures
- **Component Architecture:** Modular, reusable components following shadcn/ui patterns

**What's Missing for MVP:**
- ❌ Firebase (Auth, Firestore, Cloud Functions)
- ❌ User authentication and accounts
- ❌ Challenge creation and persistence
- ❌ Shareable challenge links
- ❌ User profiles with win/loss records
- ❌ Dashboard for managing challenges

---

## 🎯 MVP: Full Challenge System

**Scope:** Two FPL managers challenge each other to a head-to-head match for a specific gameweek. Winner is determined by total points scored.

### Target User Flow
1. **Sign Up/Login** → Email/password via Firebase Auth
2. **Connect FPL Team** → User enters their FPL Team ID (e.g., 158256)
3. **Create Challenge** → Select gameweek, get shareable link
4. **Share & Accept** → Opponent clicks link, connects their FPL ID, accepts
5. **Wait for Gameweek** → Challenge locks at gameweek deadline
6. **View Results** → After gameweek ends, system fetches points and shows winner

### MVP Feature Checklist
- ⬜ Firebase Auth integration (email/password)
- ⬜ User profile with FPL team connection
- ⬜ Challenge creation with gameweek selection
- ⬜ Shareable challenge URLs
- ⬜ Challenge accept flow
- ⬜ Firestore database for users and challenges
- ⬜ Cloud Functions for FPL API proxying
- ⬜ Scheduled function to update completed gameweeks
- ⬜ Challenge dashboard (upcoming, active, completed)
- ⬜ Win/loss record tracking
- ⬜ Manual score refresh button

### What's OUT of MVP (Future Phases)
- ❌ Live scoring during matches
- ❌ Tournaments/brackets
- ❌ In-app messaging
- ❌ Push notifications
- ❌ Prizes/payments
- ❌ Mini-leagues

---

## 🎨 Frontend Pages & Key Components

### Pages
- `/` - Landing page with auth
- `/dashboard` - User's challenges overview
- `/create` - Create new challenge
- `/challenge/:id` - Challenge detail/accept page
- `/profile` - User profile with FPL ID

### Key Components (Implemented)
- ✅ `CompareTeams` - Main comparison form with team ID inputs
- ✅ `DifferentialView` - Parent component orchestrating matchup display
- ✅ `MatchupCard` - Individual player matchup with visual progress bars
- ✅ `Collapsible` - Common players section (collapsible UI)

### Future Components (Planned)
- ⬜ `ChallengeCard` - Display challenge status
- ⬜ `FPLTeamConnect` - Input/verify FPL Team ID
- ⬜ `ChallengeStatus` - Upcoming/Active/Complete badges

---

## 📝 Implementation Roadmap

### ✅ Phase 0: Technical Foundation + Advanced Visualization (COMPLETED)
- ✅ Initialize Vite + React + TypeScript
- ✅ Install shadcn/ui, configure Tailwind
- ✅ Setup TDD Guard + Vitest
- ✅ FPL API integration proof-of-concept
- ✅ Advanced team comparison with matchup visualization
- ✅ Differential player identification algorithm
- ✅ Strategic matchup creation (captain-first, position-based, price-sorted)
- ✅ Visual matchup cards with population-style progress bars
- ✅ Swing-based relative scaling for visual impact
- ✅ Common player tracking and collapsible display
- ✅ Chip detection and display (BB, 3xC, FH, WC)
- ✅ Matchup summary statistics
- ✅ Consistent "Matchup" terminology (industry-standard branding)
- ✅ Playwright MCP for E2E testing
- ✅ Comprehensive test coverage (28 passing tests)

**Note:** Phase 0 went beyond initial scope, implementing rich visualization features originally planned for Phase 7. This provides a compelling demo experience and validates the core value proposition.

### 🚧 Phase 1: Firebase Setup (IN PROGRESS)
- ✅ Create Firebase project (`knockoutfpl-dev`)
- ✅ Install Firebase SDK dependencies
- ✅ Configure Firebase Auth (SDK initialized with auth, db, functions)
- ✅ Setup Firestore database (schema defined, security rules created)
- ✅ Authentication service implemented (signUp, signIn, signOut, getCurrentUser)
- ✅ LoginForm component with TDD (email/password inputs, form submission)
- ✅ E2E verification with Playwright MCP (form interaction, no console errors)
- ✅ Test coverage: 42 tests passing (3 Firebase init, 4 auth service, 3 LoginForm, 32 existing)
- ⬜ Initialize Cloud Functions project structure
- ⬜ Migrate FPL API calls to Cloud Functions
- ⬜ Deploy initial Firebase setup

### 🎯 Phase 2: Auth & Profile (2 days)
- ⬜ Firebase Auth UI (sign up/login)
- ⬜ Protected routes
- ⬜ FPL Team ID connection flow
- ⬜ User profile page with connected team
- ⬜ Profile persistence in Firestore

### 🎯 Phase 3: Challenge Creation (2-3 days)
- ⬜ Create challenge page with gameweek selector
- ⬜ Generate unique challenge URLs
- ⬜ Save challenges to Firestore
- ⬜ Challenge detail page
- ⬜ Challenge accept flow for opponents
- ⬜ Update challenge status (pending → accepted → active)

### 🎯 Phase 4: Automated Scoring (1-2 days)
- ⬜ Cloud Function: scheduled gameweek checker
- ⬜ Fetch FPL scores when gameweek completes
- ⬜ Update challenge with final scores and winner
- ⬜ Update user win/loss records

### 🎯 Phase 5: Dashboard & History (1-2 days)
- ⬜ Dashboard page with challenge categories
- ⬜ List upcoming challenges
- ⬜ List active challenges
- ⬜ List completed challenges with results
- ⬜ Manual score refresh functionality
- ⬜ Win/loss statistics display

### 🎯 Phase 6: Polish & Deploy (1-2 days)
- ⬜ Comprehensive error handling
- ⬜ Loading states and skeleton screens
- ⬜ Responsive design refinement
- ⬜ Security rules for Firestore
- ⬜ E2E testing for critical flows
- ⬜ Production deployment to Firebase Hosting

**MVP Timeline:** 10-14 days from current state to full MVP

---

## 🚀 Post-MVP Roadmap

### Phase 7: Enhanced Experience
**Goal:** Make challenges more engaging and informative

**Already Implemented (Phase 0):**
- ✅ Rich FPL team display (starting XI with positions, captain badges)
- ✅ Player-by-player score breakdown (matchup cards)
- ✅ Chip display integration
- ✅ Visual impact representation (population-style progress bars)

**Remaining Features:**
- ⬜ Live scoring during gameweeks (provisional points)
- ⬜ Bench display for each team
- ⬜ Challenge reminders via email notifications
- ⬜ Head-to-head statistics (historical record between users)
- ⬜ Gameweek deadline countdown timers
- ⬜ Recent activity feed

**Estimated:** 1-2 weeks (reduced due to Phase 0 progress)

### Phase 8: Social Features
**Goal:** Build community and make it easier to find opponents

- Friend/following system
- Private challenges (friends only)
- Public challenge board (accept any open challenge)
- Mini-leagues for 3+ users (round robin format)
- In-challenge comments and trash talk
- User badges and achievements
- Leaderboards (most wins, best win rate, etc.)

**Estimated:** 3-4 weeks

### Phase 9: Tournament System
**Goal:** Multi-gameweek competitions with brackets

- Create tournaments (4, 8, 16, 32 players)
- Single-elimination brackets
- Automatic progression each gameweek
- Tournament lobbies and chat
- Prize tracking (bragging rights)
- Tournament history and champions
- Custom rules (chips allowed/banned, entry requirements)

**Estimated:** 4-6 weeks

### Phase 10: Monetization (Optional)
**Goal:** Sustainable business model (if desired)

- Premium features (advanced stats, unlimited challenges)
- Sponsored tournaments
- Entry fees for prize pools (requires legal review)
- Donations/tips
- Partnership opportunities with FPL content creators

**Estimated:** 2-3 weeks + legal consultation

---

## 📊 Success Metrics

### MVP Launch Goals
- 50+ registered users
- 100+ completed challenges
- < 2 second page load time
- 95%+ successful FPL API calls
- Zero critical bugs

### Post-MVP Goals
- 500+ monthly active users
- 70%+ user retention (return for next gameweek)
- Average 5+ challenges per user per season
- Positive user feedback and testimonials

---

**Current Focus:** Phase 0 completed with advanced visualization features. Ready to begin Phase 1 (Firebase Setup) to enable persistent challenges, authentication, and full MVP functionality.

**Key Achievement:** Built a compelling matchup visualization system that demonstrates the product's core value proposition and provides an engaging UX foundation for the full challenge system.
