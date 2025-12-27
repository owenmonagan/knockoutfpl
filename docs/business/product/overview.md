# Product Overview

What Knockout FPL does, its boundaries, and how features connect.

> **Scope:** This document describes MVP scope (December 2025). Features may expand in future versions.

---

## What is Knockout FPL?

Knockout FPL turns FPL mini-leagues into bracket-style elimination tournaments. Managers compete head-to-head each gameweek—higher score advances, lower score is eliminated. The platform handles everything automatically: bracket generation, score fetching, and round progression.

The core promise: **give FPL players something to play for every gameweek, regardless of their season rank.**

---

## Purpose of This Document

This overview answers:
- **What does the product do?** → Feature summaries below
- **What are the boundaries?** → Inline scope limits per feature
- **How do features connect?** → See [journeys/](./journeys/CLAUDE.md)

For detailed specifications, see [features/](./features/CLAUDE.md). For terminology, see [glossary.md](./glossary.md).

---

## Features

### Authentication

Google Auth only. Standard Firebase setup.

**Key behaviors:**
- One-click Google sign-in
- Session persists across browser refreshes
- Logout clears session and returns to landing page

*Scope limits: No email/password authentication. No other social providers.*

---

### FPL Connection

Links a manager's FPL Team ID to their Knockout FPL account. This enables us to get the user's mini-leagues.

**Key behaviors:**
- Manager enters their FPL Team ID (found in FPL site URL)
- System validates the ID exists via FPL API
- Team name pulled automatically from FPL
- No ownership verification—multiple accounts can link the same FPL Team ID

*Scope limits: No automatic FPL login integration (FPL has no public OAuth).*

---

### League Browser

Shows all FPL mini-leagues the connected manager belongs to. Entry point for creating or viewing tournaments.

**Key behaviors:**
- Fetches leagues from FPL API using linked Team ID
- Displays league name, member count, manager's rank
- Shows existing tournament if one has been created for the league
- Classic leagues only (not Head-to-Head)

*Scope limits: No league search. No joining leagues through Knockout FPL—must join via FPL first.*

---

### Tournament Creation

Creates a knockout tournament from an FPL classic league. One-click setup with automatic bracket generation.

**Key behaviors:**
- Select a league from League Browser
- One tournament per mini-league (if one already exists, view it instead)
- All league members are automatically participants (pulled from FPL)
- Bracket auto-generated with seeding based on current league rank
- Higher seeds face lower seeds in round 1
- Byes assigned automatically when participant count isn't a power of 2
- Tournament starts from the next gameweek

*Scope limits: No custom participant selection. No manual seeding. No scheduling tournaments for future gameweeks. No multiple concurrent tournaments per league.*

---

### Tournament Bracket

Visual representation of the tournament showing all matches and progression paths.

**Key behaviors:**
- Public URL: `knockoutfpl.com/league/{fpl_league_id}` — no sign-in required to view
- Tree layout from first round to final
- Shows matchups with manager names and FPL team names
- Displays scores once a round completes
- Highlights winners and elimination path
- Updates automatically as rounds progress

*Scope limits: No bracket editing after creation. No printable/exportable bracket.*

---

### Scoring & Progression

Automatic scoring and round advancement based on FPL gameweek results.

**Key behaviors:**
- Fetches final gameweek scores from FPL API after gameweek completes
- Higher score advances, lower score eliminated
- Ties broken by higher mini-league rank at tournament creation
- Next round matchups populated automatically
- Tournament marked complete when final is decided

*Scope limits: No live scoring during gameweek. No manual score overrides. No partial gameweek scoring.*

---

## User Flows

Three primary ways users interact with Knockout FPL:

### Flow 1: Creator

New user who creates a tournament for their league.

1. `knockoutfpl.com` → Sign in with Google
2. Enter FPL Team ID → Dashboard (league list)
3. Click "Create Tournament" on a league
4. Lands on bracket page with "Share this link" prompt

See: [journeys/new-user-first-tournament.md](./journeys/new-user-first-tournament.md)

### Flow 2: Link Viewer

Someone clicking a shared tournament link.

1. `knockoutfpl.com/league/634129` → Views bracket immediately (no auth required)
2. Each team in bracket has "Claim team" button
3. Clicking "Claim team" triggers Google sign-in (FPL Team ID already known from context)
4. After sign-in → Dashboard with their leagues

See: [journeys/shared-link-viewer.md](./journeys/shared-link-viewer.md)

### Flow 3: Returning User

Authenticated user checking back on tournaments.

1. `knockoutfpl.com` → Sign in with Google
2. Dashboard shows their leagues with "View" or "Create" for each
3. Click "View Tournament" to see bracket and current state

See: [journeys/returning-user.md](./journeys/returning-user.md)

---

## Related

- **[glossary.md](./glossary.md)** - Shared vocabulary for all terms used above
- **[features/](./features/CLAUDE.md)** - Detailed specifications for each feature
- **[journeys/](./journeys/CLAUDE.md)** - End-to-end user experiences showing how features connect
- **[../strategy/](../strategy/CLAUDE.md)** - Business context: why we're building this
