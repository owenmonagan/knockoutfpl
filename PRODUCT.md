# Knockout FPL - Product Vision & Roadmap

## Project Overview

A web application that creates knockout tournaments from Fantasy Premier League classic leagues. Import your FPL league, and we'll generate a single-elimination bracket where managers compete head-to-head each gameweek until one champion remains.

**Core Value Proposition:** Transform your FPL league into an exciting knockout tournament - adding elimination drama without affecting your actual league standings.

---

## Current Status: Tournament Foundation Complete

**What's Working Now:**
- React 18 + Vite + TypeScript foundation
- shadcn/ui component library integrated
- Tailwind CSS styling system
- FPL API integration via Vite proxy (CORS bypass)
- Firebase Authentication (email/password signup/login)
- Protected routes and auth guards
- Tournament bracket visualization (BracketView, RoundSection, MatchCard)
- League import components (LeagueCard, LeagueList)
- Testing infrastructure (79 unit tests, Playwright E2E)

**Current Capabilities:**

**Team Comparison (Public - No Auth Required):**
Users can compare two FPL teams for any gameweek:
- Fetches live FPL data for both teams
- Identifies differential players (unique to each team)
- Visual matchup cards with point swings
- Chip detection and display (BB, 3xC, FH, WC)

**Authentication System:**
- Email/password signup/login via Firebase Auth
- Protected routes for authenticated pages
- Persistent auth state across sessions

**Tournament Visualization:**
- Bracket display with round progression
- Match cards showing head-to-head results
- Support for byes in uneven brackets
- Round naming (Quarter-Finals, Semi-Finals, Final)

---

## MVP: League-to-Tournament Conversion

**Scope:** Users import their FPL classic league and generate a knockout tournament bracket.

### Target User Flow
1. **Sign Up/Login** - Email/password via Firebase Auth
2. **Import FPL League** - Enter league ID, fetch all managers
3. **Create Tournament** - System generates seeded bracket from league standings
4. **View Bracket** - See who plays who each gameweek
5. **Track Progress** - After each gameweek, winners advance automatically
6. **Crown Champion** - Final winner determined after last round

### MVP Feature Checklist
- Firebase Auth integration (email/password)
- FPL League import (fetch managers from league API)
- Bracket generation (seeding based on league rank)
- Tournament persistence (Firestore)
- Bracket visualization (already built)
- Gameweek score fetching (Cloud Functions)
- Automatic winner progression
- Tournament dashboard (my tournaments, active/completed)

### What's OUT of MVP
- Live scoring during gameweeks
- Multiple tournaments per league
- Custom seeding
- Tournament chat/comments
- Push notifications

---

## Frontend Pages & Key Components

### Pages
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - User's tournaments overview
- `/leagues` - Browse/import FPL leagues
- `/tournament/:id` - Tournament bracket view

### Key Components (Implemented)
- `CompareTeams` - Team comparison utility
- `DifferentialView` - Matchup display
- `MatchupCard` - Individual player matchups
- `LoginForm` / `SignUpForm` - Authentication
- `ProtectedRoute` - Auth guard
- `BracketView` - Tournament bracket display
- `RoundSection` - Round of matches
- `MatchCard` - Individual match result
- `LeagueCard` / `LeagueList` - League browsing
- `CreateTournamentButton` - Tournament creation

---

## Implementation Roadmap

### Phase 0: Technical Foundation (COMPLETED)
- Vite + React + TypeScript setup
- shadcn/ui and Tailwind CSS
- FPL API integration
- Team comparison features
- Playwright E2E testing

### Phase 1: Firebase & Authentication (COMPLETED)
- Firebase project setup
- Authentication service
- User service with Firestore
- Protected routes
- E2E auth tests

### Phase 2: Tournament UI Components (COMPLETED)
- BracketView component
- RoundSection component
- MatchCard component
- CreateTournamentButton
- Tournament TypeScript types

### Phase 3: League Import (Next)
- FPL League API integration
- League search/browse UI
- Manager list display
- League validation

### Phase 4: Tournament Creation
- Bracket generation algorithm
- Seeding logic (by league rank)
- Bye assignment for non-power-of-2 sizes
- Save tournament to Firestore

### Phase 5: Score Processing
- Cloud Function for FPL score fetching
- Scheduled gameweek completion check
- Winner progression logic
- Tournament completion detection

### Phase 6: Dashboard & Polish
- Tournament list (active/completed)
- Tournament detail view
- Error handling
- Loading states
- Production deployment

---

## Post-MVP Roadmap

### Enhanced Experience
- Live scoring during gameweeks
- Historical head-to-head records
- Tournament statistics
- Gameweek deadline countdown

### Social Features
- Share tournament links
- Tournament leaderboards
- Comments/trash talk
- User profiles with tournament history

### Advanced Tournaments
- Multiple tournaments per league
- Custom rules (chips banned, etc.)
- Double elimination option
- Consolation brackets

---

## Success Metrics

### MVP Launch Goals
- 50+ registered users
- 20+ tournaments created
- < 2 second page load time
- 95%+ successful FPL API calls
- Zero critical bugs

### Post-MVP Goals
- 500+ monthly active users
- 100+ active tournaments
- Positive user feedback

---

**Current Focus:** Tournament foundation is built. Next step is FPL League import functionality to enable users to create tournaments from their existing leagues.
