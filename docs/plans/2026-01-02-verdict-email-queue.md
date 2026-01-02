# Verdict Email Queue Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create EmailQueue table, buildVerdictEmail function, and queueVerdicts function to queue pre-rendered verdict emails for users with finalized match results.

**Architecture:** For each finalized gameweek, find users with matches. If all matches are updated, build the email content (subject + HTML) and store it in the queue. The processEmailQueue function just sends what's already rendered.

**Tech Stack:** DataConnect (PostgreSQL), Firebase Cloud Functions

**Depends on:**
- `2026-01-02-event-finalization-tracking.md` (Event.finalizedAt)
- `2026-01-02-update-brackets-finalization.md` (Round.updatedAt, Match.updatedAt)

---

## Data Model

```
User (uid, email)
  │
  └── Participant (uid → User.uid, entryId, teamName)
        │
        └── MatchPick (entryId, slot)
              │
              └── Match (winnerEntryId, updatedAt)
                    │
                    ├── Round (event, roundNumber)
                    │     └── Tournament (fplLeagueName, totalRounds)
                    │
                    └── Pick (points) ← for scores
```

---

## Task 1: Create EmailQueue Schema

**Files:**
- Modify: `dataconnect/schema/schema.gql`

**Step 1: Add EmailQueue table after User table**

```graphql
# =============================================================================
# EMAIL LAYER
# =============================================================================

# Email queue for scheduled delivery
# Emails are pre-rendered at queue time for reliability
type EmailQueue @table(name: "email_queue", key: "id") {
  id: UUID! @default(expr: "uuidV4()")

  # Target
  userUid: String! @col(name: "user_uid")
  toEmail: String! @col(name: "to_email")

  # Email type and context
  type: String!              # 'matchup' | 'verdict'
  event: Int!                # Gameweek number

  # Pre-rendered content (built at queue time)
  subject: String!
  htmlBody: String! @col(name: "html_body")

  # Processing state
  status: String! @default(value: "pending")  # 'pending' | 'processing' | 'sent' | 'failed'
  errorMessage: String @col(name: "error_message")

  # Timestamps
  createdAt: Timestamp! @col(name: "created_at") @default(expr: "request.time")
  processedAt: Timestamp @col(name: "processed_at")

  # Relations
  user: User!
}
```

**Step 2: Verify schema compiles**

Run: `cd dataconnect && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add dataconnect/schema/schema.gql
git commit -m "feat(schema): add EmailQueue table with pre-rendered content"
```

---

## Task 2: Add EmailQueue Mutations

**Files:**
- Modify: `dataconnect/connector/mutations.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add CreateEmailQueue mutation**

```graphql
# Create email queue entry with pre-rendered content
mutation CreateEmailQueueEntry(
  $userUid: String!
  $toEmail: String!
  $type: String!
  $event: Int!
  $subject: String!
  $htmlBody: String!
) @auth(level: PUBLIC) {
  emailQueue_insert(
    data: {
      userUid: $userUid
      toEmail: $toEmail
      type: $type
      event: $event
      subject: $subject
      htmlBody: $htmlBody
      status: "pending"
    }
  )
}
```

**Step 2: Add TypeScript function**

```typescript
const CREATE_EMAIL_QUEUE_ENTRY_MUTATION = `
  mutation CreateEmailQueueEntry(
    $userUid: String!
    $toEmail: String!
    $type: String!
    $event: Int!
    $subject: String!
    $htmlBody: String!
  ) {
    emailQueue_insert(
      data: {
        userUid: $userUid
        toEmail: $toEmail
        type: $type
        event: $event
        subject: $subject
        htmlBody: $htmlBody
        status: "pending"
      }
    )
  }
`;

export interface CreateEmailQueueInput {
  userUid: string;
  toEmail: string;
  type: 'matchup' | 'verdict';
  event: number;
  subject: string;
  htmlBody: string;
}

export async function createEmailQueueEntry(
  input: CreateEmailQueueInput
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_EMAIL_QUEUE_ENTRY_MUTATION,
    { variables: input }
  );
}
```

**Step 3: Commit**

```bash
git add dataconnect/connector/mutations.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(mutations): add CreateEmailQueueEntry with content fields"
```

---

## Task 3: Add Query for User's Verdict Results

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add query to get full match results for building verdict email**

```graphql
# Get all match results for a user in a specific gameweek
# Includes all data needed to build verdict email content
query GetUserVerdictResults($entryId: Int!, $event: Int!) @auth(level: PUBLIC) {
  matchPicks(where: { entryId: { eq: $entryId } }) {
    tournamentId
    matchId
    entryId
    slot
    match {
      matchId
      status
      winnerEntryId
      isBye
      positionInRound
      round {
        event
        roundNumber
        tournament {
          id
          fplLeagueName
          totalRounds
        }
      }
      # Get all participants in this match for scores/names
      matchPicks {
        entryId
        slot
        participant {
          entryId
          teamName
          seed
        }
      }
    }
  }
}
```

**Step 2: Add TypeScript function and types**

```typescript
const GET_USER_VERDICT_RESULTS_QUERY = `
  query GetUserVerdictResults($entryId: Int!, $event: Int!) {
    matchPicks(where: { entryId: { eq: $entryId } }) {
      tournamentId
      matchId
      entryId
      slot
      match {
        matchId
        status
        winnerEntryId
        isBye
        positionInRound
        round {
          event
          roundNumber
          tournament {
            id
            fplLeagueName
            totalRounds
          }
        }
        matchPicks {
          entryId
          slot
          participant {
            entryId
            teamName
            seed
          }
        }
      }
    }
  }
`;

export interface VerdictMatchResult {
  tournamentId: string;
  tournamentName: string;
  totalRounds: number;
  roundNumber: number;
  matchId: number;
  isBye: boolean;
  userEntryId: number;
  userTeamName: string;
  userScore: number | null;
  opponentEntryId: number | null;
  opponentTeamName: string | null;
  opponentScore: number | null;
  winnerEntryId: number | null;
  isChampionship: boolean;  // Was this the final?
  won: boolean;
}

export async function getUserVerdictResults(
  entryId: number,
  event: number
): Promise<VerdictMatchResult[]> {
  const result = await dataConnectAdmin.executeGraphql<{
    matchPicks: Array<{
      tournamentId: string;
      matchId: number;
      entryId: number;
      slot: number;
      match: {
        matchId: number;
        status: string;
        winnerEntryId: number | null;
        isBye: boolean;
        positionInRound: number;
        round: {
          event: number;
          roundNumber: number;
          tournament: {
            id: string;
            fplLeagueName: string;
            totalRounds: number;
          };
        };
        matchPicks: Array<{
          entryId: number;
          slot: number;
          participant: {
            entryId: number;
            teamName: string;
            seed: number;
          };
        }>;
      };
    }>;
  }>(GET_USER_VERDICT_RESULTS_QUERY, { variables: { entryId, event } });

  // Filter to matches in this event and transform
  return result.data.matchPicks
    .filter(mp => mp.match.round.event === event)
    .map(mp => {
      const match = mp.match;
      const tournament = match.round.tournament;

      // Find user and opponent in match
      const userPick = match.matchPicks.find(p => p.entryId === entryId);
      const opponentPick = match.matchPicks.find(p => p.entryId !== entryId);

      const isChampionship = match.round.roundNumber === tournament.totalRounds;
      const won = match.winnerEntryId === entryId;

      return {
        tournamentId: mp.tournamentId,
        tournamentName: tournament.fplLeagueName,
        totalRounds: tournament.totalRounds,
        roundNumber: match.round.roundNumber,
        matchId: match.matchId,
        isBye: match.isBye,
        userEntryId: entryId,
        userTeamName: userPick?.participant.teamName ?? 'Unknown',
        userScore: null,  // Will be filled from Pick table
        opponentEntryId: opponentPick?.entryId ?? null,
        opponentTeamName: opponentPick?.participant.teamName ?? null,
        opponentScore: null,  // Will be filled from Pick table
        winnerEntryId: match.winnerEntryId,
        isChampionship,
        won,
      };
    });
}
```

**Step 3: Add query to get scores from Pick table**

```graphql
# Get scores for multiple entries in a specific event
query GetPickScores($entryIds: [Int!]!, $event: Int!) @auth(level: PUBLIC) {
  picks(where: { entryId: { in: $entryIds }, event: { eq: $event } }) {
    entryId
    event
    points
  }
}
```

**Step 4: Add TypeScript function for scores**

```typescript
const GET_PICK_SCORES_QUERY = `
  query GetPickScores($entryIds: [Int!]!, $event: Int!) {
    picks(where: { entryId: { in: $entryIds }, event: { eq: $event } }) {
      entryId
      event
      points
    }
  }
`;

export async function getPickScores(
  entryIds: number[],
  event: number
): Promise<Map<number, number>> {
  const result = await dataConnectAdmin.executeGraphql<{
    picks: Array<{ entryId: number; event: number; points: number }>;
  }>(GET_PICK_SCORES_QUERY, { variables: { entryIds, event } });

  const scoreMap = new Map<number, number>();
  for (const pick of result.data.picks) {
    scoreMap.set(pick.entryId, pick.points);
  }
  return scoreMap;
}
```

**Step 5: Commit**

```bash
git add dataconnect/connector/queries.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(queries): add GetUserVerdictResults and GetPickScores queries"
```

---

## Task 4: Create buildVerdictEmail Function

**Files:**
- Create: `functions/src/email/buildVerdictEmail.ts`

**Step 1: Create the email builder**

```typescript
/**
 * Build Verdict Email Content
 *
 * Generates subject line and HTML body for verdict emails.
 * Groups results into: Championships, Victories, Eliminations
 */

import { VerdictMatchResult } from '../dataconnect-mutations';

export interface VerdictEmailContent {
  subject: string;
  htmlBody: string;
}

interface GroupedResults {
  championships: VerdictMatchResult[];
  victories: VerdictMatchResult[];
  eliminations: VerdictMatchResult[];
}

function groupResults(results: VerdictMatchResult[]): GroupedResults {
  return {
    championships: results.filter(r => r.isChampionship && r.won),
    victories: results.filter(r => r.won && !r.isChampionship),
    eliminations: results.filter(r => !r.won && !r.isBye),
  };
}

function buildSubject(event: number, grouped: GroupedResults): string {
  const { championships, victories, eliminations } = grouped;

  if (championships.length > 0) {
    const extra = victories.length + eliminations.length;
    return extra > 0
      ? `GW${event}: You're a champion. Plus ${extra} more results.`
      : `GW${event}: You're a champion.`;
  }

  if (victories.length > 0 && eliminations.length > 0) {
    const vWord = victories.length === 1 ? 'victory' : 'victories';
    const eWord = eliminations.length === 1 ? 'elimination' : 'eliminations';
    return `GW${event}: ${victories.length} ${vWord}. ${eliminations.length} ${eWord}.`;
  }

  if (victories.length > 0) {
    return `GW${event}: All ${victories.length} matches won. The run continues.`;
  }

  return `GW${event}: Tough week. But you can still watch.`;
}

function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;
  switch (roundsFromEnd) {
    case 0: return 'Final';
    case 1: return 'Semi-final';
    case 2: return 'Quarter-final';
    default: return `Round of ${Math.pow(2, roundsFromEnd + 1)}`;
  }
}

function buildResultCard(result: VerdictMatchResult, type: 'championship' | 'victory' | 'elimination'): string {
  const roundName = getRoundName(result.roundNumber, result.totalRounds);
  const scoreDisplay = result.userScore !== null && result.opponentScore !== null
    ? `You ${result.userScore} - ${result.opponentScore} ${result.opponentTeamName}`
    : `vs ${result.opponentTeamName}`;

  let outcome = '';
  if (type === 'championship') {
    outcome = 'You won the whole thing.';
  } else if (type === 'victory') {
    const nextRound = getRoundName(result.roundNumber + 1, result.totalRounds);
    outcome = `You advance to the ${nextRound}.`;
  } else {
    outcome = 'Eliminated. You can still watch the bracket.';
  }

  const borderColor = type === 'championship' ? '#FFD700' : type === 'victory' ? '#22C55E' : '#6B7280';

  return `
    <div style="border-left: 4px solid ${borderColor}; padding: 12px 16px; margin: 8px 0; background: #F9FAFB;">
      <div style="font-weight: 600; color: #111827;">${result.tournamentName}</div>
      <div style="color: #6B7280; font-size: 14px;">${roundName}</div>
      <div style="margin-top: 8px; font-size: 16px;">${scoreDisplay}</div>
      <div style="margin-top: 4px; color: #374151; font-size: 14px;">${outcome}</div>
    </div>
  `;
}

function buildHtmlBody(event: number, grouped: GroupedResults): string {
  const { championships, victories, eliminations } = grouped;

  let sectionsHtml = '';

  // Championships section
  if (championships.length > 0) {
    sectionsHtml += `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #B45309; font-size: 14px; font-weight: 600; margin-bottom: 12px;">🏆 CHAMPION</h2>
        ${championships.map(r => buildResultCard(r, 'championship')).join('')}
      </div>
    `;
  }

  // Victories section
  if (victories.length > 0) {
    sectionsHtml += `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #15803D; font-size: 14px; font-weight: 600; margin-bottom: 12px;">✓ VICTORIES</h2>
        ${victories.map(r => buildResultCard(r, 'victory')).join('')}
      </div>
    `;
  }

  // Eliminations section
  if (eliminations.length > 0) {
    sectionsHtml += `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #6B7280; font-size: 14px; font-weight: 600; margin-bottom: 12px;">✗ ELIMINATIONS</h2>
        ${eliminations.map(r => buildResultCard(r, 'elimination')).join('')}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111827; font-size: 20px; margin: 0;">KNOCKOUT FPL</h1>
        </div>

        <div style="color: #6B7280; font-size: 14px; margin-bottom: 24px; text-align: center;">
          GAMEWEEK ${event} · FINAL RESULTS
        </div>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">

        ${sectionsHtml}

        <div style="text-align: center; margin-top: 32px;">
          <a href="https://knockoutfpl.com" style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View All Brackets
          </a>
        </div>

        <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px;">
          Knockout FPL
        </div>
      </div>
    </body>
    </html>
  `;
}

export function buildVerdictEmail(
  event: number,
  results: VerdictMatchResult[]
): VerdictEmailContent {
  const grouped = groupResults(results);

  return {
    subject: buildSubject(event, grouped),
    htmlBody: buildHtmlBody(event, grouped),
  };
}
```

**Step 2: Commit**

```bash
git add functions/src/email/buildVerdictEmail.ts
git commit -m "feat(email): add buildVerdictEmail content builder

Generates subject line and HTML body for verdict emails.
Groups results into Championships, Victories, Eliminations."
```

---

## Task 5: Add Helper Queries

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add query to check if verdict email already queued**

```graphql
# Check if user already has email queued for this event
query GetExistingEmailQueue(
  $userUid: String!
  $type: String!
  $event: Int!
) @auth(level: PUBLIC) {
  emailQueues(
    where: {
      userUid: { eq: $userUid }
      type: { eq: $type }
      event: { eq: $event }
    }
    limit: 1
  ) {
    id
    status
  }
}
```

**Step 2: Add query to get users with matches in event**

```graphql
# Get users who have matches in a specific gameweek
query GetUsersWithMatchesInEvent($event: Int!) @auth(level: PUBLIC) {
  rounds(where: { event: { eq: $event } }) {
    tournamentId
    roundNumber
    event
    updatedAt
    tournament {
      participants(where: { uid: { isNull: false } }) {
        uid
        entryId
        teamName
        user {
          uid
          email
        }
      }
    }
  }
}
```

**Step 3: Add TypeScript functions**

```typescript
const GET_EXISTING_EMAIL_QUEUE_QUERY = `
  query GetExistingEmailQueue($userUid: String!, $type: String!, $event: Int!) {
    emailQueues(
      where: {
        userUid: { eq: $userUid }
        type: { eq: $type }
        event: { eq: $event }
      }
      limit: 1
    ) {
      id
      status
    }
  }
`;

export async function emailAlreadyQueued(
  userUid: string,
  type: 'matchup' | 'verdict',
  event: number
): Promise<boolean> {
  const result = await dataConnectAdmin.executeGraphql<{
    emailQueues: Array<{ id: string; status: string }>;
  }>(GET_EXISTING_EMAIL_QUEUE_QUERY, { variables: { userUid, type, event } });

  return result.data.emailQueues.length > 0;
}

const GET_USERS_WITH_MATCHES_IN_EVENT_QUERY = `
  query GetUsersWithMatchesInEvent($event: Int!) {
    rounds(where: { event: { eq: $event } }) {
      tournamentId
      roundNumber
      event
      updatedAt
      tournament {
        participants(where: { uid: { isNull: false } }) {
          uid
          entryId
          teamName
          user {
            uid
            email
          }
        }
      }
    }
  }
`;

export interface UserWithMatches {
  uid: string;
  email: string;
  entryId: number;
}

export async function getUsersWithMatchesInEvent(
  event: number
): Promise<UserWithMatches[]> {
  const result = await dataConnectAdmin.executeGraphql<{
    rounds: Array<{
      tournamentId: string;
      roundNumber: number;
      event: number;
      updatedAt: string;
      tournament: {
        participants: Array<{
          uid: string | null;
          entryId: number;
          teamName: string;
          user: { uid: string; email: string } | null;
        }>;
      };
    }>;
  }>(GET_USERS_WITH_MATCHES_IN_EVENT_QUERY, { variables: { event } });

  // Dedupe users (may be in multiple tournaments)
  const userMap = new Map<string, UserWithMatches>();

  for (const round of result.data.rounds) {
    for (const participant of round.tournament.participants) {
      if (participant.uid && participant.user) {
        userMap.set(participant.uid, {
          uid: participant.user.uid,
          email: participant.user.email,
          entryId: participant.entryId,
        });
      }
    }
  }

  return Array.from(userMap.values());
}
```

**Step 4: Commit**

```bash
git add dataconnect/connector/queries.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(queries): add email queue helper queries"
```

---

## Task 6: Create queueVerdicts Cloud Function

**Files:**
- Create: `functions/src/queueVerdicts.ts`
- Modify: `functions/src/index.ts`

**Step 1: Create the function**

```typescript
/**
 * Queue Verdict Emails Scheduled Function
 *
 * Runs every 5 minutes to:
 * 1. Find finalized events
 * 2. For each user with matches in that event:
 *    a. Check if all their matches have updatedAt >= finalizedAt
 *    b. If yes, build the email and queue it
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  getFinalizedEvents,
  getUsersWithMatchesInEvent,
  getUserVerdictResults,
  getPickScores,
  emailAlreadyQueued,
  createEmailQueueEntry,
  getEventFinalization,
} from './dataconnect-mutations';
import { buildVerdictEmail } from './email/buildVerdictEmail';

const CURRENT_SEASON = '2024-25';

export const queueVerdicts = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[queueVerdicts] Starting verdict email queue check...');

    try {
      // 1. Get finalized events
      const finalizedEvents = await getFinalizedEvents(CURRENT_SEASON);

      if (finalizedEvents.length === 0) {
        console.log('[queueVerdicts] No finalized events');
        return;
      }

      let totalQueued = 0;

      for (const event of finalizedEvents) {
        console.log(`[queueVerdicts] Processing GW${event.event} (finalized: ${event.finalizedAt})`);

        const finalizedAt = new Date(event.finalizedAt);

        // 2. Get all users with matches in this event
        const users = await getUsersWithMatchesInEvent(event.event);
        console.log(`[queueVerdicts] Found ${users.length} users with matches`);

        for (const user of users) {
          try {
            // 3. Check if already queued
            const alreadyQueued = await emailAlreadyQueued(user.uid, 'verdict', event.event);
            if (alreadyQueued) {
              continue;
            }

            // 4. Get all match results for this user
            const results = await getUserVerdictResults(user.entryId, event.event);

            if (results.length === 0) {
              continue;
            }

            // 5. Check if ALL matches are resolved (winner determined or bye)
            const allResolved = results.every(r => r.isBye || r.winnerEntryId !== null);
            if (!allResolved) {
              console.log(`[queueVerdicts] User ${user.uid} has unresolved matches, skipping`);
              continue;
            }

            // 6. Get scores for all participants
            const allEntryIds = results.flatMap(r =>
              [r.userEntryId, r.opponentEntryId].filter((id): id is number => id !== null)
            );
            const scores = await getPickScores(allEntryIds, event.event);

            // 7. Attach scores to results
            for (const result of results) {
              result.userScore = scores.get(result.userEntryId) ?? null;
              if (result.opponentEntryId) {
                result.opponentScore = scores.get(result.opponentEntryId) ?? null;
              }
            }

            // 8. Build email content
            const emailContent = buildVerdictEmail(event.event, results);

            // 9. Queue the email
            await createEmailQueueEntry({
              userUid: user.uid,
              toEmail: user.email,
              type: 'verdict',
              event: event.event,
              subject: emailContent.subject,
              htmlBody: emailContent.htmlBody,
            });

            totalQueued++;
            console.log(`[queueVerdicts] Queued verdict for ${user.uid}: "${emailContent.subject}"`);

          } catch (error) {
            console.error(`[queueVerdicts] Error processing user ${user.uid}:`, error);
            // Continue with other users
          }
        }
      }

      console.log(`[queueVerdicts] Complete. Queued ${totalQueued} verdict emails.`);
    } catch (error) {
      console.error('[queueVerdicts] Fatal error:', error);
      throw error;
    }
  }
);
```

**Step 2: Export from index.ts**

```typescript
export { queueVerdicts } from './queueVerdicts';
```

**Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add functions/src/queueVerdicts.ts functions/src/index.ts
git commit -m "feat(functions): add queueVerdicts with pre-rendered content

Builds verdict email (subject + HTML) at queue time.
Email content is stored in EmailQueue for later sending."
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create EmailQueue schema with content fields | `schema.gql` |
| 2 | Add CreateEmailQueue mutation | `mutations.gql`, `dataconnect-mutations.ts` |
| 3 | Add verdict results and scores queries | `queries.gql`, `dataconnect-mutations.ts` |
| 4 | Create buildVerdictEmail function | `email/buildVerdictEmail.ts` |
| 5 | Add helper queries | `queries.gql`, `dataconnect-mutations.ts` |
| 6 | Create queueVerdicts function | `queueVerdicts.ts`, `index.ts` |

**Total commits:** 6

---

## Flow Diagram

```
queueVerdicts (every 5 mins)
    │
    ├── Get finalized events
    │
    └── For each finalized event:
          │
          ├── Get users with matches
          │
          └── For each user:
                │
                ├── Already queued? → Skip
                │
                ├── Get match results
                │
                ├── All resolved? → No → Skip
                │
                ├── Get scores from Pick table
                │
                ├── buildVerdictEmail(event, results)
                │     ├── Group: championships, victories, eliminations
                │     ├── Build subject line
                │     └── Build HTML body
                │
                └── Insert EmailQueue with subject + htmlBody
```

---

## Testing Checklist

- [ ] EmailQueue table created with subject/htmlBody columns
- [ ] buildVerdictEmail produces correct subject lines
- [ ] buildVerdictEmail produces valid HTML
- [ ] Championships sorted first, then victories, then eliminations
- [ ] Scores correctly attached from Pick table
- [ ] queueVerdicts skips already-queued users
- [ ] Handles users in multiple tournaments
