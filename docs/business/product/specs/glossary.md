# Glossary

> **Status:** DRAFT - terms need validation and examples
>
> **Usage:** These terms should be used consistently across all documentation and code.

---

## Core Concepts

### Tournament

<!-- TODO: Add concrete example -->

A knockout competition created from an FPL mini-league. Contains multiple rounds, each played during a single gameweek. One winner emerges at the end.

**Example:** "The Work League Christmas Knockout" - 8 participants, 3 rounds (QF → SF → Final)

**Related:** Round, Match, Participant

---

### Round

<!-- TODO: Verify round naming conventions -->

A stage of a tournament played during a single gameweek. Each round contains multiple matches. Winners advance to the next round.

**Example:** "Quarter-Finals (GW15)" - 4 matches, 8 participants → 4 winners

**Related:** Tournament, Match, Gameweek

---

### Match

<!-- TODO: Clarify bye match representation -->

A head-to-head competition between two participants within a round. The participant with more gameweek points wins and advances.

**Example:** "Alice (45 pts) vs Bob (42 pts)" - Alice wins and advances

**Special case:** A "bye" match has only one participant who automatically advances.

**Related:** Round, Participant, Score

---

### Participant

<!-- TODO: Clarify relationship to FPL team vs user -->

An FPL manager competing in a tournament. Identified by their FPL team ID. Seeded based on their mini-league rank at tournament creation.

**Example:** "Owen (Seed 3, FPL Team #158256)"

**Related:** Tournament, Seed, FPL Team

---

### Seed

<!-- TODO: Add seeding algorithm reference -->

A ranking assigned to participants based on their mini-league position at tournament creation. Seed 1 is the top-ranked player.

**Purpose:** Ensures top players don't face each other early. Seed 1 faces highest seed, Seed 2 faces second-highest, etc.

**Example:** In an 8-person tournament, Seed 1 faces Seed 8 in round 1.

**Related:** Participant, Bracket

---

### Bye

<!-- TODO: Clarify how byes are awarded -->

Automatic advancement to the next round without playing a match. Awarded when there's an odd number of participants or bracket requires it.

**Rule:** Byes are awarded to top seeds (lowest seed numbers).

**Example:** 5 participants → Seeds 1, 2, 3 get byes to round 2.

**Related:** Seed, Round, Bracket

---

### Bracket

<!-- TODO: Add visual example -->

The structure of all matches across all rounds. Shows who plays whom and progression path to the final.

**Example:** An 8-person single-elimination bracket has 7 total matches across 3 rounds.

**Related:** Tournament, Round, Match

---

## FPL Concepts

### Gameweek (GW)

A scoring period in Fantasy Premier League, typically spanning a weekend of matches. Runs from Friday to Monday.

**Important:** Scores are only final after the gameweek "finishes" in the FPL API.

**Example:** "GW15" - December 7-9, 2025

**Related:** Score, Round

---

### Mini-League

An FPL feature allowing users to create private leagues with friends. We pull member lists and rankings from mini-leagues to create tournaments.

**API:** `/api/entry/{teamId}/` returns `leagues.classic[]`

**Related:** Tournament, Participant

---

### FPL Team

A user's fantasy team in FPL, identified by a numeric team ID.

**Example:** `https://fantasy.premierleague.com/entry/158256/` - Team ID is 158256

**Related:** Participant, Score

---

### Score

The total points earned by an FPL team during a gameweek.

**Source:** FPL API `/api/entry/{teamId}/event/{gameweek}/picks/` → `entry_history.points`

**Note:** Scores can change during a gameweek (provisional) and become final when gameweek ends.

**Related:** Match, Gameweek

---

## Deprecated Terms

<!-- TODO: Remove these from codebase -->

### Challenge (DEPRECATED)

**Do not use.** Legacy term from 1v1 challenge feature. Replaced by "Tournament" and "Match" concepts.

---

### Matchup (DEPRECATED)

**Do not use.** Legacy term from challenge feature. Use "Match" instead.

---

### Differential (DEPRECATED)

**Do not use.** Legacy term from team comparison feature. Not relevant to tournament product.

---

## Related

- [functional-spec.md](./functional-spec.md) - How these concepts behave
- [../requirements/core-prd.md](../requirements/core-prd.md) - Product requirements
