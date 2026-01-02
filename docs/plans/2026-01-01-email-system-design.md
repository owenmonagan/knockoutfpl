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

# Technical Implementation

## Architecture Overview

```
Cloud Scheduler
    │
    ├── checkDeadline (every 5 mins)
    │       └── Sets deadlinePassedAt → queues Matchup emails
    │
    ├── checkFinished (every 15 mins)
    │       └── Sets fplFinishedAt when FPL marks gameweek complete
    │
    ├── refreshBrackets (every 15 mins)
    │       └── Fetches scores, resolves matches, sets bracketRefreshedAt
    │
    ├── queueVerdicts (every 5 mins)
    │       └── Only runs after bracketRefreshedAt is set → queues Verdict emails
    │
    └── processEmailQueue (every 1 min)
            └── Sends pending emails via Resend API
```

**Critical guarantee:** Verdict emails never send until bracket refresh completes. This ensures match results are accurate.

---

## Dependency Tracking

The `GameweekStatus` table tracks pipeline state:

```
┌──────────┬─────────────────┬───────────────────┬───────────────┐
│ gameweek │ fplFinishedAt   │ bracketRefreshedAt│ verdictsQueued│
├──────────┼─────────────────┼───────────────────┼───────────────┤
│ 24       │ 2026-01-01 22:00│ 2026-01-01 22:15  │ true          │
│ 25       │ null            │ null              │ false         │
└──────────┴─────────────────┴───────────────────┴───────────────┘
```

**Job dependencies:**

| Job | Runs | Precondition | Action |
|-----|------|--------------|--------|
| checkDeadline | Every 5 mins | Deadline passed | Set `deadlinePassedAt`, queue Matchup emails |
| checkFinished | Every 15 mins | FPL `finished: true` | Set `fplFinishedAt` |
| refreshBrackets | Every 15 mins | `fplFinishedAt` is set | Fetch scores, resolve matches, set `bracketRefreshedAt` |
| queueVerdicts | Every 5 mins | `bracketRefreshedAt` is set | Queue Verdict emails, set `verdictsQueued = true` |
| processEmailQueue | Every 1 min | Pending emails exist | Send via Resend, update status |

---

## Schema (DataConnect/PostgreSQL)

### GameweekStatus Table

```graphql
type GameweekStatus @table {
  id: Int! @default(expr: "request.data.gameweek")
  gameweek: Int! @unique

  # Matchup pipeline
  deadlinePassedAt: Timestamp
  matchupsQueued: Boolean! @default(value: false)

  # Verdict pipeline
  fplFinishedAt: Timestamp
  bracketRefreshedAt: Timestamp
  verdictsQueued: Boolean! @default(value: false)
}
```

### EmailQueue Table

```graphql
type EmailQueue @table {
  id: UUID! @default(expr: "uuidV4()")
  user: User!
  type: String!              # 'matchup' | 'verdict'
  gameweek: Int!
  status: String!            # 'pending' | 'processing' | 'sent' | 'failed'
  errorMessage: String       # if failed, why
  createdAt: Timestamp! @default(expr: "request.time")
  processedAt: Timestamp

  @@unique([user, type, gameweek])  # prevent duplicate emails
}
```

**Key constraints:**
- `@@unique([user, type, gameweek])` — One matchup and one verdict email per user per gameweek
- `GameweekStatus` uses gameweek number as ID for simple lookup

---

## Cloud Functions

### checkDeadline (Every 5 mins)

```typescript
// functions/src/email/checkDeadline.ts

export const checkDeadline = onSchedule('every 5 minutes', async () => {
  // 1. Get current gameweek from FPL
  const bootstrap = await fetchBootstrapData();
  const currentEvent = bootstrap.events.find(e => e.is_current);
  if (!currentEvent) return;

  const gameweek = currentEvent.id;
  const deadline = new Date(currentEvent.deadline_time);
  const now = new Date();

  // 2. Check if deadline just passed
  if (now < deadline) return;

  // 3. Check if already processed
  const status = await getGameweekStatus(gameweek);
  if (status?.matchupsQueued) return;

  // 4. Mark deadline passed
  if (!status?.deadlinePassedAt) {
    await setDeadlinePassed(gameweek, now);
  }

  // 5. Queue matchup emails
  await queueMatchupEmails(gameweek);
});
```

### checkFinished (Every 15 mins)

```typescript
// functions/src/email/checkFinished.ts

export const checkFinished = onSchedule('every 15 minutes', async () => {
  const bootstrap = await fetchBootstrapData();

  for (const event of bootstrap.events) {
    if (!event.finished) continue;

    const status = await getGameweekStatus(event.id);
    if (status?.fplFinishedAt) continue;

    await setFplFinished(event.id, new Date());
  }
});
```

### refreshBrackets (Every 15 mins)

```typescript
// functions/src/email/refreshBrackets.ts

export const refreshBrackets = onSchedule('every 15 minutes', async () => {
  // Find gameweeks ready for refresh
  // WHERE fplFinishedAt IS NOT NULL AND bracketRefreshedAt IS NULL
  const ready = await getGameweeksNeedingRefresh();

  for (const gameweek of ready) {
    try {
      await refreshTournamentBrackets(gameweek);
      await setBracketRefreshed(gameweek, new Date());
    } catch (error) {
      console.error(`Failed to refresh GW${gameweek}:`, error);
      // Will retry next run
    }
  }
});
```

### queueVerdicts (Every 5 mins)

```typescript
// functions/src/email/queueVerdicts.ts

export const queueVerdicts = onSchedule('every 5 minutes', async () => {
  // Find gameweeks ready for verdict emails
  // WHERE bracketRefreshedAt IS NOT NULL AND verdictsQueued = false
  const ready = await getGameweeksReadyForVerdicts();

  for (const gameweek of ready) {
    await queueVerdictEmails(gameweek);
    await setVerdictsQueued(gameweek, true);
  }
});
```

### processEmailQueue (Every 1 min)

```typescript
// functions/src/email/processQueue.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const processEmailQueue = onSchedule('every 1 minutes', async () => {
  // 1. Fetch pending emails (batch of 50)
  const pending = await getPendingEmails(50);
  if (pending.length === 0) return;

  // 2. Mark as processing (prevents double-send)
  const ids = pending.map(e => e.id);
  await markAsProcessing(ids);

  // 3. Process each email
  for (const email of pending) {
    try {
      const content = email.type === 'matchup'
        ? await buildMatchupEmail(email.user, email.gameweek)
        : await buildVerdictEmail(email.user, email.gameweek);

      await resend.emails.send({
        from: 'Knockout FPL <noreply@knockoutfpl.com>',
        to: email.user.email,
        subject: content.subject,
        html: content.html,
      });

      await markAsSent(email.id);
    } catch (error) {
      await markAsFailed(email.id, error.message);
    }
  }
});
```

---

## Email Content Builders

### buildMatchupEmail

```typescript
// functions/src/email/builders/matchup.ts

export async function buildMatchupEmail(
  user: User,
  gameweek: number
): Promise<{ subject: string; html: string }> {
  // 1. Get all active matches for this user
  const matches = await getUserMatchesForGameweek(user.fplTeamId, gameweek);

  if (matches.length === 0) {
    throw new Error(`No matches found for user ${user.id} in GW${gameweek}`);
  }

  // 2. Sort by priority (closest to trophy first)
  const sorted = matches.sort((a, b) => a.roundsToTrophy - b.roundsToTrophy);
  const headline = sorted[0];
  const others = sorted.slice(1);

  // 3. Build subject line
  const subject = others.length > 0
    ? `GW${gameweek}: ${headline.roundName} vs ${headline.opponentName}. Plus ${others.length} more.`
    : `GW${gameweek}: ${headline.roundName} vs ${headline.opponentName}. One survives.`;

  // 4. Build HTML
  const html = renderMatchupEmail({ gameweek, headline, others });

  return { subject, html };
}
```

### buildVerdictEmail

```typescript
// functions/src/email/builders/verdict.ts

export async function buildVerdictEmail(
  user: User,
  gameweek: number
): Promise<{ subject: string; html: string }> {
  // 1. Get all results for this user
  const results = await getUserResultsForGameweek(user.fplTeamId, gameweek);

  if (results.length === 0) {
    throw new Error(`No results found for user ${user.id} in GW${gameweek}`);
  }

  // 2. Group by outcome
  const championships = results.filter(r => r.isChampionship && r.won);
  const victories = results.filter(r => r.won && !r.isChampionship);
  const eliminations = results.filter(r => !r.won);

  // 3. Build subject line
  const subject = buildVerdictSubject(championships, victories, eliminations, gameweek);

  // 4. Build HTML
  const html = renderVerdictEmail({ gameweek, championships, victories, eliminations });

  return { subject, html };
}

function buildVerdictSubject(
  championships: Result[],
  victories: Result[],
  eliminations: Result[],
  gameweek: number
): string {
  if (championships.length > 0) {
    const extra = victories.length + eliminations.length;
    return extra > 0
      ? `GW${gameweek}: You're a champion. Plus ${extra} more results.`
      : `GW${gameweek}: You're a champion.`;
  }

  if (victories.length > 0 && eliminations.length > 0) {
    return `GW${gameweek}: ${victories.length} ${victories.length === 1 ? 'victory' : 'victories'}. ${eliminations.length} ${eliminations.length === 1 ? 'elimination' : 'eliminations'}.`;
  }

  if (victories.length > 0) {
    return `GW${gameweek}: All ${victories.length} matches won. The run continues.`;
  }

  return `GW${gameweek}: Tough week. But you can still watch.`;
}
```

---

## External Dependencies

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Resend | Email delivery | 3,000 emails/month, 100/day |

---

## Guarantees

- **Verdicts never send before bracket refresh** — `queueVerdicts` checks `bracketRefreshedAt` is set
- **No duplicate emails** — Unique constraint on `[user, type, gameweek]`
- **Failed emails can retry** — Status tracked, can re-queue failed emails
- **Full audit trail** — `EmailQueue` table logs all sent/failed emails

---

## Not Included (Future)

- Email preferences/unsubscribe (needs User table column + preferences UI)
- React Email templates (using inline HTML for MVP)
- Push notifications (separate feature)
- Email analytics/tracking (opens, clicks)

---

## Related

- See [../business/product/features/tournament-experience.md](../business/product/features/tournament-experience.md) for original (now superseded) email spec
- See [../business/product/features/scoring-progression.md](../business/product/features/scoring-progression.md) for gameweek finalization logic
