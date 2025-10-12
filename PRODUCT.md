# Knockout FPL - Product Vision & Roadmap

## Project Overview

A web application that allows fantasy premier league users to challenge each other to head-to-head matches using their classic fantasy premier league team.

For example: https://fantasy.premierleague.com/entry/158256/event/7 vs https://fantasy.premierleague.com/entry/71631/event/7, where entry 158256 got 78 points, which beats entry 71631 76 points.

There is an informal but existing fantasy premier league API. Eventually, we will expand this product into full knockout tournaments.

**Core Value Proposition:** Provide an exciting way to compete against other players without worrying about your season and league standings.

---

## 📍 Current Status: Technical Proof of Concept

**What's Working Now:**
- ✅ React 18 + Vite + TypeScript foundation
- ✅ shadcn/ui component library integrated
- ✅ Tailwind CSS styling system
- ✅ FPL API integration via Vite proxy (CORS bypass)
- ✅ Basic team comparison functionality (`CompareTeams` component)
- ✅ TDD workflow with TDD Guard + Vitest
- ✅ Playwright MCP for automated E2E testing
- ✅ Test coverage for core components

**Current Capabilities:**
Users can compare two FPL teams for any gameweek by entering team IDs. The app fetches real FPL data and displays the winner. This proves the FPL API integration works and establishes our development workflow.

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

### Key Components
- `ChallengeCard` - Display challenge status
- `FPLTeamConnect` - Input/verify FPL Team ID
- `ScoreDisplay` - Show both teams' points
- `ChallengeStatus` - Upcoming/Active/Complete badges

---

## 📝 Implementation Roadmap

### ✅ Phase 0: Technical Foundation (COMPLETED)
- ✅ Initialize Vite + React + TypeScript
- ✅ Install shadcn/ui, configure Tailwind
- ✅ Setup TDD Guard + Vitest
- ✅ FPL API integration proof-of-concept
- ✅ Basic team comparison component
- ✅ Playwright MCP for E2E testing

### 🚧 Phase 1: Firebase Setup (2-3 days)
- ⬜ Create Firebase project
- ⬜ Install Firebase SDK dependencies
- ⬜ Configure Firebase Auth
- ⬜ Setup Firestore database
- ⬜ Initialize Cloud Functions project
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

- Live scoring during gameweeks (provisional points)
- Rich FPL team display (starting XI, bench, captain)
- Player-by-player score breakdown
- Challenge reminders via email notifications
- Head-to-head statistics (historical record between users)
- Gameweek deadline countdown timers
- Recent activity feed

**Estimated:** 2-3 weeks

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

**Current Focus:** Complete Phase 0 (Technical Foundation) → Move to Phase 1 (Firebase Setup) for full MVP functionality.
