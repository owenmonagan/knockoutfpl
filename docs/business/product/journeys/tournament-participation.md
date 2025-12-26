# Tournament Participation Journey

> **Status:** DRAFT - needs flow diagrams and validation
> **Last Updated:** December 2025

---

## Overview

How a user views and follows an active tournament they're participating in.

```
Dashboard → My Tournaments → View Bracket → Track Scores → See Winner
```

---

## Prerequisites

<!-- TODO: Verify these are enforced -->

- User is authenticated
- User is a participant in the tournament OR
- User has direct link to tournament

---

## Discovery (DRAFT)

<!-- TODO: Verify how users find tournaments -->

**How users find tournaments they're in:**

| Entry Point | Behavior |
|-------------|----------|
| Dashboard | Shows list of user's tournaments |
| Direct link | Opens specific tournament |
| Leagues page | Shows tournaments for each league |

---

## Viewing the Bracket (DRAFT)

<!-- TODO: Verify this matches BracketView implementation -->

**URL:** `/tournament/:tournamentId`

**What user sees:**
- Tournament name and status
- Bracket visualization (rounds and matches)
- Current round highlighted
- User's matches highlighted (if participant)

**Navigation (mobile):**
- Round selector tabs/pills
- Swipe between rounds
- Tap match for details

**Navigation (desktop):**
- Full bracket visible
- Click match for details

---

## Match Status States (DRAFT)

<!-- TODO: Verify visual states match implementation -->

| State | Visual | Info Shown |
|-------|--------|------------|
| Upcoming | Muted | Gameweek number |
| Live (GW in progress) | Pulsing indicator | Provisional scores |
| Completed | Winner highlighted | Final scores, winner badge |
| Bye | Single participant | "BYE" badge |

---

## Score Updates (DRAFT)

<!-- TODO: Document score fetching behavior -->

**When scores update:**
- On page load
- Manual refresh button
- <!-- TODO: Polling during live gameweek? -->

**What user sees during update:**
- Loading indicator on scores
- Updated scores appear

**Score accuracy:**
- During gameweek: Provisional (may change)
- After gameweek: Final (locked)

---

## Progression (DRAFT)

<!-- TODO: Document how bracket advances -->

**When a round completes:**
1. All matches in round have finished gameweeks
2. Winners determined
3. Next round matchups populated
4. Bracket updates

**What user sees:**
- Winners shown in completed matches
- Next round shows new matchups
- User's next opponent visible (if advancing)

---

## Tournament Completion (DRAFT)

<!-- TODO: Document end state -->

**When final match completes:**
- Tournament status → `completed`
- Champion highlighted/celebrated
- Final bracket locked

**What user sees:**
- "Tournament Complete" banner
- Champion prominently displayed
- Full bracket history preserved

---

## User Perspective (DRAFT)

<!-- TODO: Personalize experience -->

**If user is a participant:**
- Their matches highlighted
- "Your Match" label
- Quick jump to their current match

**If user is eliminated:**
- Can still view bracket
- Their exit point shown

**If user is spectating (not in tournament):**
- Read-only view
- No personalization

---

## Edge Cases (DRAFT)

<!-- TODO: Document edge case handling -->

| Scenario | What User Sees |
|----------|----------------|
| Tournament hasn't started | First round with "Starts GW X" |
| User was eliminated | "Eliminated in Round X" badge |
| Tournament completed | Full history, champion shown |
| FPL API error | Error message, cached scores if available |

---

## Related

- [tournament-creation.md](./tournament-creation.md) - How tournaments are created
- [../specs/functional-spec.md](../specs/functional-spec.md) - Scoring and progression rules
- [../../technical/integrations/fpl-api.md](../../technical/integrations/fpl-api.md) - How scores are fetched
