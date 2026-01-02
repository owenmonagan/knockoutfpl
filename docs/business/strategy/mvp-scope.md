# MVP Scope Freeze

> **Status:** DECISION DOCUMENT
> **Last Updated:** December 2025

---

## Purpose

This document defines the explicit boundary of MVP. Features are either IN or OUT. No "maybe" or "nice to have."

---

## IN: MVP Features

### Authentication
- [x] Email/password sign-in and sign-up
- [x] Google Sign-In as alternative option
- [x] Password reset flow via email

### FPL Connection
- [x] Enter FPL Team ID manually
- [x] Validate team exists via FPL API
- [x] Store team ID on user profile
- [x] Display team name from FPL

### League Browser
- [x] Show user's classic leagues (from cached entry data)
- [x] Filter to leagues with 4-64 members
- [x] Show existing tournaments for each league

### Tournament Creation
- [x] Single elimination format only
- [x] Automatic seeding by league rank only
- [x] Automatic round-to-gameweek mapping
- [x] Power-of-2 brackets only (4, 8, 16, 32, 64)
- [x] Byes for non-power-of-2 leagues (top seeds advance)

### Tournament Bracket
- [x] Visual bracket display
- [x] Show match pairings and results
- [x] Public shareable link (no auth required to view)
- [x] Desktop-first layout

### Scoring & Progression
- [x] Final gameweek scores only (no live updates)
- [x] Scheduled function fetches scores after GW complete
- [x] Higher seed wins ties
- [x] Automatic advancement to next round

### Infrastructure
- [x] Firebase Hosting
- [x] Cloud Functions for FPL API proxy
- [x] PostgreSQL via Data Connect
- [x] Basic error handling and loading states

---

## OUT: Not in MVP

### Authentication
- [ ] Social logins beyond Google (Twitter, Facebook, Apple)
- [ ] Account linking (connecting Google and email/password accounts)
- [ ] Email verification before sign-in

### FPL Connection
- [ ] Search for team by name
- [ ] Auto-detect team from browser cookies
- [ ] Multiple team IDs per user
- [ ] Team verification (prove you own it)

### League Browser
- [ ] Head-to-head leagues
- [ ] Private leagues search
- [ ] League favorites/bookmarks

### Tournament Creation
- [ ] Double elimination format
- [ ] Round robin format
- [ ] Manual seeding
- [ ] Custom seeding criteria
- [ ] Draft-style team selection
- [ ] Choose starting gameweek
- [ ] Non-power-of-2 without byes

### Tournament Bracket
- [ ] Mobile-optimized bracket view
- [ ] Bracket animations
- [ ] Live score updates during gameweek
- [ ] Score breakdown (who scored what)
- [ ] Match history/replays
- [ ] Bracket predictions

### Social Features
- [ ] Comments on matches
- [ ] Chat/messaging
- [ ] Notifications (email, push)
- [ ] Social sharing with previews
- [ ] Leaderboards across tournaments

### User Features
- [ ] User profiles
- [ ] Win/loss statistics
- [ ] Tournament history archive
- [ ] Achievements/badges
- [ ] Settings/preferences

### Monetization
- [ ] Premium tiers
- [ ] Payment processing
- [ ] Ad placements

### Admin
- [ ] Admin dashboard
- [ ] Manual score override
- [ ] Tournament moderation
- [ ] Analytics/reporting

---

## Scope Boundaries

### What "Single Elimination" Means
- Lose once, you're out
- No consolation bracket
- No third-place match

### What "Final Scores Only" Means
- We fetch scores AFTER `finished: true` on the gameweek
- No live point tracking during matches
- Display shows "In Progress" until gameweek complete

### What "Desktop-First" Means
- Bracket must work on 1024px+ screens
- Mobile may be degraded experience (horizontal scroll OK)
- No native app, no PWA features

### What "Public Links" Means
- Anyone with URL can view bracket
- No auth required to view
- Cannot see participant FPL team IDs (just names)

---

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Email/password + Google auth | Flexible sign-in options, password reset for user convenience | Dec 2025 |
| Single elim only | Core experience, other formats add complexity | Dec 2025 |
| Final scores only | Live scores require polling, edge cases, complexity | Dec 2025 |
| Desktop-first | Bracket visualization is complex on mobile | Dec 2025 |
| Higher seed wins ties | Simple, deterministic, matches cup competition norms | Dec 2025 |

---

## What Success Looks Like

MVP is successful if:

1. **User can complete core journey:** Sign up → Connect FPL → Create tournament → Share link → See results after gameweek
2. **No critical bugs:** Scores are accurate, brackets advance correctly
3. **Basic performance:** Pages load in <2s, no timeouts

MVP is NOT about:
- Beautiful design (functional is fine)
- Mobile experience
- Viral growth features
- Revenue

---

## Cutting Scope Further

If timeline pressure requires cuts, remove in this order:

1. **First to cut:** Public shareable links (require auth to view)
2. **Second:** Byes for non-power-of-2 (only support exact power-of-2 leagues)
3. **Third:** League browser (user enters league ID manually)
4. **Last resort:** Remove tournament creation UI (seed via script)

Core that CANNOT be cut:
- Auth
- FPL connection
- Bracket display
- Score fetching
- Round advancement

---

## Related

- [hypotheses.md](./hypotheses.md) - What we're trying to validate
- [metrics.md](./metrics.md) - How we'll measure success
- [../product/features/](../product/features/CLAUDE.md) - Detailed feature specs
