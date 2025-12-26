# Tournament Product Requirements Document

> **Status:** DRAFT - migrated from docs/prds/product_overview.md, needs review
> **Last Updated:** December 2025

---

## Feature Overview (DRAFT)

<!-- TODO: Verify this matches current implementation plans -->

A **tournament** is a knockout competition created from an FPL mini-league. All league members are automatically included. Matches are played over gameweeks, with winners advancing until a champion is crowned.

**Key characteristics:**
- One round per gameweek
- Automatic seeding by mini-league rank
- Automatic score fetching and winner determination
- Bracket visualization

---

## User Stories (DRAFT)

<!-- TODO: Prioritize and validate these -->

### Tournament Creation

> As a mini-league member, I want to create a knockout tournament for my league so that we can compete in a bracket format.

**Acceptance criteria:**
- [ ] User can see list of their mini-leagues
- [ ] User can select a league to create tournament from
- [ ] User can choose starting gameweek
- [ ] System generates bracket with all league members
- [ ] Tournament is visible on user's dashboard

### Bracket Viewing

> As a tournament participant, I want to view the bracket so that I can see matchups and results.

**Acceptance criteria:**
- [ ] User can see all rounds of the bracket
- [ ] Each match shows both participants
- [ ] Completed matches show scores and winner
- [ ] Upcoming matches show gameweek
- [ ] User can navigate between rounds (mobile)

### Score Updates

> As a tournament participant, I want scores to update automatically so that I don't have to manually track them.

**Acceptance criteria:**
- [ ] Scores fetch from FPL API on page load
- [ ] Completed gameweeks show final scores
- [ ] Winners are determined automatically
- [ ] Bracket advances to next round when round completes

---

## Core Requirements (DRAFT)

<!-- TODO: Verify these match implementation -->

| Requirement | Decision |
|-------------|----------|
| Round timing | One round per gameweek |
| Tiebreaker | Higher mini-league rank wins |
| Odd players | Top seeds get byes |
| Bracket size | Exact league size (no padding) |
| Seeding | By mini-league rank (1st vs last) |
| Permissions | Any league member can create |
| Joining | Auto-include all league members |
| Scoring | Fetch on page load from FPL API |

---

## Bracket Generation Rules (DRAFT)

<!-- TODO: Verify algorithm matches implementation -->

### Seeding Logic

```
For N participants ranked 1 to N:
- Seed 1 plays Seed N
- Seed 2 plays Seed N-1
- Seed 3 plays Seed N-2
- etc.
```

### Bye Logic

```
For odd number of participants:
- Calculate byes needed to reach next power of 2
- Award byes to top seeds (lowest seed numbers)
- Example: 5 participants → 3 byes → Seeds 1, 2, 3 get byes
```

### Round Naming

| Rounds from Final | Name |
|-------------------|------|
| 1 | Final |
| 2 | Semi-Finals |
| 3 | Quarter-Finals |
| 4 | Round of 16 |
| 5 | Round of 32 |
| 6+ | Round N |

---

## Scope Boundaries (DRAFT)

<!-- TODO: Confirm these are still accurate -->

### MVP

- [x] View mini-leagues
- [ ] Create tournament
- [ ] Generate seeded bracket
- [ ] Fetch scores automatically
- [ ] Determine winners
- [ ] Advance bracket
- [ ] View bracket (mobile-first)

### Post-MVP

- [ ] Desktop bracket with connector lines
- [ ] Live scoring during gameweeks
- [ ] Tournament history
- [ ] Multiple tournaments per league
- [ ] Custom rules (chips banned, etc.)
- [ ] Notifications

---

## Open Questions (DRAFT)

<!-- TODO: Resolve these -->

- [ ] What happens if a user leaves FPL mid-tournament?
- [ ] Can a tournament be cancelled?
- [ ] What if FPL API is down when gameweek ends?
- [ ] Should we show "live" scores during a gameweek?
- [ ] How do we handle league members who don't have our app?

---

## Related

- [core-prd.md](./core-prd.md) - Overall product requirements
- [../specs/functional-spec.md](../specs/functional-spec.md) - Detailed rules and edge cases
- [../journeys/tournament-creation.md](../journeys/tournament-creation.md) - User flow for creating tournaments
