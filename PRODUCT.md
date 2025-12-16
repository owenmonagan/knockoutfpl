# Knockout FPL - Product Vision & Roadmap

## Project Overview

A web application that allows fantasy premier league users to challenge each other to head-to-head matches using their classic fantasy premier league team.

For example: https://fantasy.premierleague.com/entry/158256/event/7 vs https://fantasy.premierleague.com/entry/71631/event/7, where entry 158256 got 78 points, which beats entry 71631 76 points.

There is an informal but existing fantasy premier league API. Eventually, we will expand this product into full knockout tournaments.

**Core Value Proposition:** Provide an exciting way to compete against other players without worrying about your season and league standings.

---

## 📍 Current Status: Authentication System Complete

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
- ✅ TDD workflow with Vitest
- ✅ Playwright E2E testing infrastructure (smoke, auth, navigation, dashboard tags)
- ✅ Comprehensive test coverage (79 unit tests, 9 E2E auth tests)
- ✅ Firebase Authentication (email/password signup/login)
- ✅ Protected routes and auth guards
- ✅ React Router with landing, login, signup, dashboard pages

**Current Capabilities:**

**Team Comparison (Public - No Auth Required):**
Users can compare two FPL teams for any gameweek by entering team IDs. The app:
- Fetches live FPL data for both teams and all players
- Identifies differential players (unique to each team or different multipliers)
- Creates strategic matchups sorted by impact/price
- Displays visual "head-to-head" matchup cards with point swings
- Shows common players separately (collapsible section)
- Displays active chips for each manager
- Provides detailed matchup statistics and insights

**Authentication System:**
Users can create accounts and access protected features:
- Email/password signup with validation (email format, password strength, password matching)
- Secure login/logout functionality
- Protected routes for authenticated-only pages
- Persistent auth state across sessions
- Comprehensive error handling for auth failures
- Form validation with user-friendly error messages

This establishes a rich, engaging comparison experience AND a secure authentication foundation for the full challenge system.

**Technical Highlights:**
- **Smart Matchup Algorithm:** Captain differentials matched first, then position-based matching (FWD → MID → DEF → GK) sorted by player price within positions
- **Visual Design:** Population chart-style progress bars that scale based on swing magnitude relative to the largest swing (not absolute points)
- **Differential Logic:** Identifies unique players OR players with different multipliers (e.g., one team captains Salah, other doesn't)
- **Type Safety:** Full TypeScript implementation with strict typing for FPL data structures
- **Component Architecture:** Modular, reusable components following shadcn/ui patterns

**What's Missing for MVP:**
- ⬜ User profile with FPL Team ID connection
- ⬜ Challenge creation and persistence (Firestore)
- ⬜ Shareable challenge links
- ⬜ Challenge accept flow
- ⬜ Cloud Functions for FPL API proxying
- ⬜ Scheduled function for automated scoring
- ⬜ User profiles with win/loss records
- ⬜ Dashboard with challenge management (upcoming/active/completed)

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
- ✅ Firebase Auth integration (email/password)
- ✅ Firestore database setup for users and challenges
- ⬜ User profile with FPL team connection
- ⬜ Challenge creation with gameweek selection
- ⬜ Shareable challenge URLs
- ⬜ Challenge accept flow
- ⬜ Cloud Functions for FPL API proxying
- ⬜ Scheduled function to update completed gameweeks
- ⬜ Challenge dashboard (upcoming, active, completed)
- ⬜ Win/loss record tracking
- ⬜ Manual score refresh button

**Progress: 2/11 core features complete (18%)**

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
- ✅ `/` - Landing page with auth (LandingPage)
- ✅ `/login` - Login page (LoginPage)
- ✅ `/signup` - Signup page (SignUpPage)
- ✅ `/dashboard` - User's challenges overview (DashboardPage with ProtectedRoute)
- ⬜ `/profile` - User profile with FPL ID
- ⬜ `/create` - Create new challenge
- ⬜ `/challenge/:id` - Challenge detail/accept page

### Key Components (Implemented)
- ✅ `CompareTeams` - Main comparison form with team ID inputs
- ✅ `DifferentialView` - Parent component orchestrating matchup display
- ✅ `MatchupCard` - Individual player matchup with visual progress bars
- ✅ `Collapsible` - Common players section (collapsible UI)
- ✅ `LoginForm` - Email/password login with validation
- ✅ `SignUpForm` - User registration with password matching validation
- ✅ `ProtectedRoute` - Auth guard for protected pages

### Future Components (Planned)
- ⬜ `ChallengeCard` - Display challenge status
- ⬜ `FPLTeamConnect` - Input/verify FPL Team ID
- ⬜ `ChallengeStatus` - Upcoming/Active/Complete badges
- ⬜ `ProfileForm` - Edit user profile and FPL connection

---

## 📝 Implementation Roadmap

### ✅ Phase 0: Technical Foundation + Advanced Visualization (COMPLETED)
- ✅ Initialize Vite + React + TypeScript
- ✅ Install shadcn/ui, configure Tailwind
- ✅ Setup Vitest for testing
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

### ✅ Phase 1: Firebase & Authentication (COMPLETED - 95%)
- ✅ Create Firebase project (`knockoutfpl-dev`)
- ✅ Install Firebase SDK dependencies (firebase ^12.4.0)
- ✅ Configure Firebase Auth, Firestore, Functions SDK
- ✅ Setup Firestore database schema (users, challenges collections)
- ✅ Firestore security rules defined
- ✅ Authentication service implemented (signUp, signIn, signOut, getCurrentUser)
- ✅ User service with Firestore integration (createUser, getUserById, updateUser)
- ✅ LoginForm component with full validation and error handling
- ✅ SignUpForm component with password matching and strength validation
- ✅ React Router setup (/, /login, /signup, /dashboard routes)
- ✅ ProtectedRoute component for auth guards
- ✅ Page components: LandingPage, LoginPage, SignUpPage, DashboardPage
- ✅ E2E test infrastructure with Playwright (tagged test organization)
- ✅ Comprehensive E2E auth tests (9 tests: smoke, validation, error handling)
- ✅ Test coverage: 79 unit tests + 9 E2E auth tests passing
- ⬜ Cloud Functions project structure (initialized but empty)
- ⬜ Migrate FPL API calls to Cloud Functions
- ⬜ Deploy initial Firebase setup

**Remaining for Phase 1:**
- Cloud Functions implementation for FPL API proxying
- Production deployment of auth system

### ✅ Phase 2: User Profile & FPL Connection (COMPLETED)
- ✅ Firebase Auth UI (sign up/login) - completed in Phase 1
- ✅ Protected routes - completed in Phase 1
- ✅ FPL Team ID connection flow (input validation, team verification)
- ✅ User profile page with connected FPL team display
- ✅ Update user document with FPL team info in Firestore
- ✅ Fetch and display FPL team name from API
- ✅ Profile edit functionality (change display name, update FPL ID)
- ✅ E2E tests for profile and FPL connection flow

**Note:** Auth work from original Phase 2 completed early in Phase 1.

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

**MVP Timeline:** 8-12 days from current state to full MVP (reduced from 10-14 due to Phase 1 progress)

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

**Current Focus:** Phase 1 (Firebase & Authentication) is 95% complete. Full authentication system with signup/login/protected routes is live. Phase 2 (User Profile & FPL Connection) is next to enable users to connect their FPL teams.

**Key Achievements:**
1. **Advanced Matchup Visualization** (Phase 0): Built a compelling player-by-player comparison system that demonstrates the product's core value proposition
2. **Complete Auth System** (Phase 1): Implemented secure Firebase authentication with comprehensive form validation, error handling, and E2E test coverage
3. **Robust Testing Infrastructure**: 79 unit tests + 9 E2E tests with tagged organization (smoke, auth, navigation, dashboard) for efficient test runs

**Next Milestone:** Complete FPL Team ID connection flow to enable users to link their fantasy teams to their accounts.
