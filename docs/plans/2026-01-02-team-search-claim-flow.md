# Team Search & Claim Flow

> **Status:** Design complete
> **Related:** [Share UI](./2026-01-02-share-ui.md), [Claim Requirement](./2026-01-02-claim-requirement.md)

---

## Problem

Unauthenticated users land on a bracket but have no reason to sign up. They can see everything without an account.

---

## Solution

A "Find Your Team" overlay that creates personal investment before asking for signup.

---

## User Flow

1. Unauthenticated user visits `/league/{id}`
2. Bracket loads with a search overlay on top of the "Your Matches" section area
3. User types their FPL team name
4. Results list shows matching teams (handles duplicates) with team name + manager name for disambiguation
5. User taps to confirm their team
6. Overlay dismisses with animation
7. Their team highlights in the bracket, "Your Matches" section populates with their journey
8. Signup CTA slides in: "Sign up to get notified when results are in"

---

## Key Details

**Bracket visibility:** The bracket itself is always visible. Only the "Your Matches" section is gated behind the search. This preserves the shareable/public nature while creating a personal hook.

**Duplicate handling:** Multiple teams can have the same name. Results list shows both team name and manager name for disambiguation.

**Claiming:** When a user signs up via this flow, their FPL Team ID links to their account. This counts toward the [claim requirement](./2026-01-02-claim-requirement.md).

---

## Components

### `TeamSearchOverlay`

- Search input field (placeholder: "Find your team...")
- Debounced search against tournament participants
- Results list with team name + manager name
- "This is me" confirm button per result
- Dismisses on confirm or explicit close

### Updates to `YourMatchesSection`

- When unauthenticated: render `TeamSearchOverlay` on top
- After team confirmed: show matches for selected team
- Signup CTA appears below matches

---

## Data Requirements

- Query participants by team name (fuzzy/partial match)
- Track "previewed" team in local state (not persisted until signup)
- On signup: link FPL Team ID from preview to new user account

---

## Out of Scope

- Authenticated user experience (already works)
- Changes to bracket visualization
- FPL Team ID entry (search by name is primary)
