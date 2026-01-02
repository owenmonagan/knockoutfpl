# Claim Requirement for Progression

> **Status:** Design complete
> **Related:** [Team Search](./2026-01-02-team-search-claim-flow.md), [Share UI](./2026-01-02-share-ui.md)

---

## Problem

Creators can set up a tournament and never share it. No built-in viral pressure. The goal is to enforce a referral factor of N+1.

---

## Solution

Round 1 runs free, but Round 2+ requires 3 teams to be "claimed" (linked to user accounts).

**Rationale:** Prove value first (Round 1 completes), then require virality to continue. The creator experiences the product working before being asked to share.

---

## How It Works

1. Tournament created → Round 1 proceeds normally
2. After Round 1 completes, system checks claim count
3. **If <3 teams claimed:**
   - Tournament shows "Paused" state
   - Creator sees: "2 more league members need to sign up to continue the tournament"
   - Prominent share CTA with the [shareable image](./2026-01-02-share-ui.md)
   - Bracket shows Round 1 results but Round 2 matchups are locked/blurred
4. **If ≥3 teams claimed:**
   - Tournament proceeds automatically
   - Normal flow resumes

---

## What Counts as a Claim

- A user signs up and links their FPL Team ID
- That FPL Team ID matches a participant in the tournament
- Creator's team counts as claim #1 (they're already signed up)

The [Team Search flow](./2026-01-02-team-search-claim-flow.md) is the primary path for new claims.

---

## Edge Cases

**Small tournaments:** If a tournament has <3 participants total, the requirement is waived. (Already handled by the 2-minimum participant rule.)

**Creator frustration:** Risk that league-mates don't engage. Mitigations:
- Clear, friendly messaging ("Get your league involved")
- Easy sharing via [Share UI](./2026-01-02-share-ui.md)
- Round 1 already proves value

---

## Data Requirements

- Track which FPL Team IDs are claimed (linked to a User account) per tournament
- Query: count of claimed teams in tournament X
- Tournament status: add "paused_for_claims" state (or similar)

---

## Components

### `TournamentPausedBanner`

- Displays when claim threshold not met
- Shows current claim count ("1 of 3 members signed up")
- Prominent share button (opens [Share UI](./2026-01-02-share-ui.md))
- Friendly messaging: "Get your league involved to continue"

### Updates to bracket view

- Round 2+ matchups blurred/locked when paused
- Round 1 results remain visible

### Backend changes

- Check claim count after Round 1 progression
- Gate Round 2 progression on claim threshold
- Include claim count in tournament queries

---

## Messaging Tone

Framed as "get your league involved" not "we're holding your tournament hostage."

Examples:
- "Your tournament is ready! Get 2 more league members to sign up to keep it going."
- "Round 1 complete! Invite your league to see Round 2."

---

## Out of Scope

- Variable claim thresholds (always 3 for now)
- Claim requirements beyond Round 2 gate
- Creator override/bypass option

---

## Deferred: Manager Customization

Logged-in managers could have personalization options (avatar, display name, team motto, bracket theme). Noted for future exploration but explicitly out of scope. Rationale: viral loop features are higher leverage for the north star metric (impressions via signups).
