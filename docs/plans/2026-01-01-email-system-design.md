# Email System Design

> **Status:** Design complete
> **Created:** 2026-01-01

---

## Overview

Two emails per gameweek cycle, regardless of how many tournaments a user is in.

| Email | Trigger | Purpose |
|-------|---------|---------|
| The Matchup | FPL deadline (squads lock) | Build anticipation for all active matches |
| The Verdict | Gameweek points finalized | Deliver all results |

**Key principle:** One email per trigger. No spam — just two well-timed moments of drama.

---

## Prioritization Logic

Matches are ranked by "closest to trophy" (fewest rounds remaining to win the tournament).

- Semi-final (1 round to trophy) beats Quarter-final (2 rounds)
- Quarter-final beats Round of 16 (3 rounds)
- And so on

The match closest to glory gets headline treatment.

---

## Email 1: The Matchup

**Trigger:** FPL deadline (when squads lock, typically Saturday 11am UK)

**Subject line examples:**
- "GW24: 3 matches. 3 chances to survive."
- "GW24: Semi-final vs Dave. Plus 2 more battles."
- "GW24: You vs Uncle Terry. One survives."

### Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│  GAMEWEEK 24 · SQUADS LOCKED                                        │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│  YOUR HEADLINE MATCH                                                │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  WORK FRIENDS KNOCKOUT                                     │     │
│  │  Semi-final · 4 remain · 1 round from the final            │     │
│  │                                                            │     │
│  │  You vs Dave's Dumpster Fire                               │     │
│  │                                                            │     │
│  │  Dave's form: W-W-L-W-W (last 5 GWs)                       │     │
│  │  Last round: Beat Sara 71-63                               │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ───────────────────────────────────────────────────────────────    │
│                                                                     │
│  ALSO THIS WEEK                                                     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  FAMILY CUP · Quarter-final                                │     │
│  │  You vs Uncle Terry · 2 rounds from trophy                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  REDDIT KNOCKOUT · Round of 32                             │     │
│  │  You vs xXSalahLad99Xx · 4 rounds from trophy              │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│               ┌────────────────────────────────┐                    │
│               │       View All Brackets        │                    │
│               └────────────────────────────────┘                    │
│                                                                     │
│  Good luck.                                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Headline Match Card Content

| Field | Description |
|-------|-------------|
| Tournament name | e.g., "WORK FRIENDS KNOCKOUT" |
| Round | e.g., "Semi-final" |
| Participants remaining | e.g., "4 remain" |
| Rounds to trophy | e.g., "1 round from the final" |
| Opponent name | e.g., "Dave's Dumpster Fire" |
| Opponent form | Last 5 gameweek results: W-W-L-W-W |
| Opponent's last result | e.g., "Beat Sara 71-63" |

### "Also This Week" Card Content

Compact format:
- Tournament name
- Round
- Opponent name
- Rounds to trophy

---

## Email 2: The Verdict

**Trigger:** Gameweek points finalized (FPL marks gameweek as complete, typically Monday/Tuesday)

**Subject line examples:**
- "GW24: 2 victories. 1 elimination."
- "GW24: You're a champion. Plus 2 more results."
- "GW24: All 3 matches won. The run continues."
- "GW24: Eliminated from Family Cup. But still alive in 2."

### Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│  GAMEWEEK 24 · FINAL RESULTS                                        │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│  🏆 CHAMPION                                                        │
│                                                                     │
│  ╔════════════════════════════════════════════════════════════╗     │
│  ║  WORK FRIENDS KNOCKOUT                                     ║     │
│  ║                                                            ║     │
│  ║  You 78 ━━━━━━ 71 Dave's Dumpster Fire                     ║     │
│  ║                                                            ║     │
│  ║  You won the whole thing.                                  ║     │
│  ╚════════════════════════════════════════════════════════════╝     │
│                                                                     │
│  ───────────────────────────────────────────────────────────────    │
│                                                                     │
│  ✓ VICTORIES                                                        │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  FAMILY CUP · Quarter-final                                │     │
│  │  You 67 - 52 Uncle Terry                                   │     │
│  │  You advance to the Semi-final.                            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ───────────────────────────────────────────────────────────────    │
│                                                                     │
│  ✗ ELIMINATIONS                                                     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  REDDIT KNOCKOUT · Round of 32                             │     │
│  │  You 45 - 51 xXSalahLad99Xx                                │     │
│  │  Eliminated. You can still watch the bracket.              │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│               ┌────────────────────────────────┐                    │
│               │       View All Brackets        │                    │
│               └────────────────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Section Order

1. **Championship** (gold border, trophy icon) — only if you won a final this gameweek
2. **Victories** (checkmark, green accent) — rounds you advanced
3. **Eliminations** (X mark, muted styling) — tournaments you exited

### Result Card Content

| Field | Description |
|-------|-------------|
| Tournament name | e.g., "FAMILY CUP" |
| Round | e.g., "Quarter-final" |
| Final score | e.g., "You 67 - 52 Uncle Terry" |
| Outcome | e.g., "You advance to the Semi-final." |

---

## Edge Cases

### Single Match Scenarios

One match, one result → Same structure, just no "Also this week" or grouping sections. Simpler, cleaner email.

### All Eliminations

- Softer subject line: "GW24: Tough week. But you can still watch."
- No victories section, just eliminations
- Include: "You're still in the running for [other tournaments]" if they have upcoming matches in future gameweeks

### Championship + Elimination in Same Gameweek

- Lead with championship (celebrate the big win)
- Elimination below feels less painful in context

### Tied Match (Resolved by Tiebreaker)

- Show as normal win/loss
- Add note: "Won on tiebreaker (higher seed)" or "Lost on tiebreaker"

### Bye Rounds

- User automatically advances, no opponent
- Include in Matchup: "You have a bye this round. Auto-advance to [next round]."
- Exclude from Verdict (no result to report)

### Tournament Starts Mid-Season

- User joins tournament that began in an earlier gameweek
- Their first Matchup email comes at the deadline of their first active round

### No Matches This Gameweek

- No email sent

---

## Technical Triggers

| Event | Source | Action |
|-------|--------|--------|
| FPL deadline passes | FPL API `events[].deadline_time` | Queue Matchup emails for all users with active matches |
| Gameweek finalized | FPL API `events[].finished` becomes `true` | Queue Verdict emails for all users with results |

### Timing Buffer

- **Matchup:** Send within 5 minutes of deadline
- **Verdict:** Send within 30 minutes of `finished: true` (allows for bonus point finalization)

---

## What's Out of Scope

Removed from the original `tournament-experience.md` spec:

- **"It's Live" email** (first kickoff) — redundant, Matchup already sent at deadline
- **"Halftime Report" email** (Sunday morning) — cut for simplicity
- **Separate "Champion Crowned" email** — folded into Verdict
- **Push notifications** — separate feature, not part of email system

---

## Related

- See [../business/product/features/tournament-experience.md](../business/product/features/tournament-experience.md) for original (now superseded) email spec
- See [../business/product/features/scoring-progression.md](../business/product/features/scoring-progression.md) for gameweek finalization logic
