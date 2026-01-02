# Email Sending Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create processEmailQueue function to send pre-rendered emails via Resend API.

**Architecture:** Scheduled function polls EmailQueue for pending emails, sends them via Resend, and updates status. Emails are already pre-rendered (subject + HTML) so sending is straightforward.

**Tech Stack:** Firebase Cloud Functions, Resend API, DataConnect

**Depends on:**
- `2026-01-02-verdict-email-queue.md` (EmailQueue table with pre-rendered content)

---

## External Setup Required

Before implementation, you need:

1. **Resend Account:** https://resend.com (free tier: 3,000 emails/month, 100/day)
2. **API Key:** Create at https://resend.com/api-keys
3. **Domain Verification:** Verify `knockoutfpl.com` for sending (or use onboarding domain for testing)
4. **Firebase Secret:** Store API key as `RESEND_API_KEY`

---

## Task 1: Install Resend SDK

**Files:**
- Modify: `functions/package.json`

**Step 1: Add resend dependency**

```bash
cd functions && npm install resend
```

**Step 2: Verify package.json**

```json
{
  "dependencies": {
    "resend": "^2.0.0"
  }
}
```

**Step 3: Commit**

```bash
git add functions/package.json functions/package-lock.json
git commit -m "chore(deps): add resend email SDK"
```

---

## Task 2: Add Firebase Secret for API Key

**Step 1: Set the secret**

```bash
firebase functions:secrets:set RESEND_API_KEY
# Enter your Resend API key when prompted
```

**Step 2: Verify secret exists**

```bash
firebase functions:secrets:access RESEND_API_KEY
```

**Note:** This is a manual step, no code commit needed.

---

## Task 3: Add Queries for Email Queue

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add query to get pending emails**

```graphql
# Get pending emails ready to send (batch)
query GetPendingEmails($limit: Int!) @auth(level: PUBLIC) {
  emailQueues(
    where: { status: { eq: "pending" } }
    orderBy: { createdAt: ASC }
    limit: $limit
  ) {
    id
    userUid
    toEmail
    type
    event
    subject
    htmlBody
    status
    createdAt
  }
}
```

**Step 2: Add TypeScript function**

```typescript
const GET_PENDING_EMAILS_QUERY = `
  query GetPendingEmails($limit: Int!) {
    emailQueues(
      where: { status: { eq: "pending" } }
      orderBy: { createdAt: ASC }
      limit: $limit
    ) {
      id
      userUid
      toEmail
      type
      event
      subject
      htmlBody
      status
      createdAt
    }
  }
`;

export interface PendingEmail {
  id: string;
  userUid: string;
  toEmail: string;
  type: 'matchup' | 'verdict';
  event: number;
  subject: string;
  htmlBody: string;
  status: string;
  createdAt: string;
}

export async function getPendingEmails(limit: number = 50): Promise<PendingEmail[]> {
  const result = await dataConnectAdmin.executeGraphql<{
    emailQueues: PendingEmail[];
  }>(GET_PENDING_EMAILS_QUERY, { variables: { limit } });

  return result.data.emailQueues;
}
```

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(queries): add GetPendingEmails query"
```

---

## Task 4: Add Mutations to Update Email Status

**Files:**
- Modify: `dataconnect/connector/mutations.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add mutation to mark email as processing**

```graphql
# Mark emails as processing (prevents double-send)
mutation MarkEmailsProcessing($ids: [UUID!]!) @auth(level: PUBLIC) {
  emailQueue_updateMany(
    where: { id: { in: $ids } }
    data: { status: "processing" }
  ) {
    count
  }
}
```

**Step 2: Add mutation to mark email as sent**

```graphql
# Mark email as sent
mutation MarkEmailSent($id: UUID!, $processedAt: Timestamp!) @auth(level: PUBLIC) {
  emailQueue_update(
    id: $id
    data: {
      status: "sent"
      processedAt: $processedAt
    }
  )
}
```

**Step 3: Add mutation to mark email as failed**

```graphql
# Mark email as failed with error message
mutation MarkEmailFailed($id: UUID!, $errorMessage: String!, $processedAt: Timestamp!) @auth(level: PUBLIC) {
  emailQueue_update(
    id: $id
    data: {
      status: "failed"
      errorMessage: $errorMessage
      processedAt: $processedAt
    }
  )
}
```

**Step 4: Add TypeScript functions**

```typescript
const MARK_EMAILS_PROCESSING_MUTATION = `
  mutation MarkEmailsProcessing($ids: [UUID!]!) {
    emailQueue_updateMany(
      where: { id: { in: $ids } }
      data: { status: "processing" }
    ) {
      count
    }
  }
`;

export async function markEmailsProcessing(ids: string[]): Promise<number> {
  const result = await dataConnectAdmin.executeGraphql<{
    emailQueue_updateMany: { count: number };
  }>(MARK_EMAILS_PROCESSING_MUTATION, { variables: { ids } });

  return result.data.emailQueue_updateMany.count;
}

const MARK_EMAIL_SENT_MUTATION = `
  mutation MarkEmailSent($id: UUID!, $processedAt: Timestamp!) {
    emailQueue_update(
      id: $id
      data: {
        status: "sent"
        processedAt: $processedAt
      }
    )
  }
`;

export async function markEmailSent(id: string): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    MARK_EMAIL_SENT_MUTATION,
    { variables: { id, processedAt: new Date().toISOString() } }
  );
}

const MARK_EMAIL_FAILED_MUTATION = `
  mutation MarkEmailFailed($id: UUID!, $errorMessage: String!, $processedAt: Timestamp!) {
    emailQueue_update(
      id: $id
      data: {
        status: "failed"
        errorMessage: $errorMessage
        processedAt: $processedAt
      }
    )
  }
`;

export async function markEmailFailed(id: string, errorMessage: string): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    MARK_EMAIL_FAILED_MUTATION,
    { variables: { id, errorMessage, processedAt: new Date().toISOString() } }
  );
}
```

**Step 5: Commit**

```bash
git add dataconnect/connector/mutations.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(mutations): add email status update mutations"
```

---

## Task 5: Create Resend Email Client

**Files:**
- Create: `functions/src/email/resendClient.ts`

**Step 1: Create the client wrapper**

```typescript
/**
 * Resend Email Client
 *
 * Wrapper around Resend SDK for sending emails.
 */

import { Resend } from 'resend';

// Lazy initialization to avoid loading API key at import time
let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const client = getClient();

    const result = await client.emails.send({
      from: 'Knockout FPL <noreply@knockoutfpl.com>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Step 2: Commit**

```bash
git add functions/src/email/resendClient.ts
git commit -m "feat(email): add Resend client wrapper"
```

---

## Task 6: Create processEmailQueue Cloud Function

**Files:**
- Create: `functions/src/processEmailQueue.ts`
- Modify: `functions/src/index.ts`

**Step 1: Create the function**

```typescript
/**
 * Process Email Queue Scheduled Function
 *
 * Runs every 1 minute to:
 * 1. Fetch pending emails (batch of 50)
 * 2. Mark them as processing (prevents double-send)
 * 3. Send each via Resend
 * 4. Update status (sent or failed)
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import {
  getPendingEmails,
  markEmailsProcessing,
  markEmailSent,
  markEmailFailed,
} from './dataconnect-mutations';
import { sendEmail } from './email/resendClient';

// Define the secret for Resend API key
const resendApiKey = defineSecret('RESEND_API_KEY');

const BATCH_SIZE = 50;

export const processEmailQueue = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Europe/London',
    retryCount: 3,
    secrets: [resendApiKey],
  },
  async () => {
    console.log('[processEmailQueue] Starting email queue processing...');

    try {
      // 1. Fetch pending emails
      const pending = await getPendingEmails(BATCH_SIZE);

      if (pending.length === 0) {
        console.log('[processEmailQueue] No pending emails');
        return;
      }

      console.log(`[processEmailQueue] Found ${pending.length} pending emails`);

      // 2. Mark as processing (prevents double-send from concurrent runs)
      const ids = pending.map(e => e.id);
      const markedCount = await markEmailsProcessing(ids);
      console.log(`[processEmailQueue] Marked ${markedCount} emails as processing`);

      // 3. Send each email
      let sentCount = 0;
      let failedCount = 0;

      for (const email of pending) {
        const result = await sendEmail({
          to: email.toEmail,
          subject: email.subject,
          html: email.htmlBody,
        });

        if (result.success) {
          await markEmailSent(email.id);
          sentCount++;
          console.log(`[processEmailQueue] Sent email ${email.id} to ${email.toEmail} (${result.messageId})`);
        } else {
          await markEmailFailed(email.id, result.error ?? 'Unknown error');
          failedCount++;
          console.error(`[processEmailQueue] Failed to send ${email.id}: ${result.error}`);
        }

        // Small delay between sends to be nice to Resend API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`[processEmailQueue] Complete. Sent: ${sentCount}, Failed: ${failedCount}`);
    } catch (error) {
      console.error('[processEmailQueue] Fatal error:', error);
      throw error;
    }
  }
);
```

**Step 2: Export from index.ts**

```typescript
export { processEmailQueue } from './processEmailQueue';
```

**Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add functions/src/processEmailQueue.ts functions/src/index.ts
git commit -m "feat(functions): add processEmailQueue scheduled function

Sends pre-rendered emails from EmailQueue via Resend API.
Runs every minute, processes up to 50 emails per run."
```

---

## Task 7: Add Retry Logic for Failed Emails

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add query for failed emails eligible for retry**

```graphql
# Get failed emails that can be retried (failed more than 5 mins ago)
query GetRetryableEmails($retryAfter: Timestamp!, $limit: Int!) @auth(level: PUBLIC) {
  emailQueues(
    where: {
      status: { eq: "failed" }
      processedAt: { lt: $retryAfter }
    }
    orderBy: { processedAt: ASC }
    limit: $limit
  ) {
    id
    userUid
    toEmail
    type
    event
    subject
    htmlBody
    errorMessage
    processedAt
  }
}
```

**Step 2: Add mutation to reset failed email for retry**

```graphql
# Reset failed email to pending for retry
mutation ResetEmailForRetry($id: UUID!) @auth(level: PUBLIC) {
  emailQueue_update(
    id: $id
    data: {
      status: "pending"
      errorMessage: null
    }
  )
}
```

**Step 3: Add TypeScript functions**

```typescript
const GET_RETRYABLE_EMAILS_QUERY = `
  query GetRetryableEmails($retryAfter: Timestamp!, $limit: Int!) {
    emailQueues(
      where: {
        status: { eq: "failed" }
        processedAt: { lt: $retryAfter }
      }
      orderBy: { processedAt: ASC }
      limit: $limit
    ) {
      id
      userUid
      toEmail
      type
      event
      subject
      htmlBody
      errorMessage
      processedAt
    }
  }
`;

export interface FailedEmail {
  id: string;
  userUid: string;
  toEmail: string;
  type: string;
  event: number;
  subject: string;
  htmlBody: string;
  errorMessage: string | null;
  processedAt: string;
}

export async function getRetryableEmails(
  retryAfterMinutes: number = 5,
  limit: number = 10
): Promise<FailedEmail[]> {
  const retryAfter = new Date(Date.now() - retryAfterMinutes * 60 * 1000);

  const result = await dataConnectAdmin.executeGraphql<{
    emailQueues: FailedEmail[];
  }>(GET_RETRYABLE_EMAILS_QUERY, {
    variables: { retryAfter: retryAfter.toISOString(), limit }
  });

  return result.data.emailQueues;
}

const RESET_EMAIL_FOR_RETRY_MUTATION = `
  mutation ResetEmailForRetry($id: UUID!) {
    emailQueue_update(
      id: $id
      data: {
        status: "pending"
        errorMessage: null
      }
    )
  }
`;

export async function resetEmailForRetry(id: string): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    RESET_EMAIL_FOR_RETRY_MUTATION,
    { variables: { id } }
  );
}
```

**Step 4: Commit**

```bash
git add dataconnect/connector/queries.gql dataconnect/connector/mutations.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(email): add retry logic for failed emails"
```

---

## Task 8: Create retryFailedEmails Function (Optional)

**Files:**
- Create: `functions/src/retryFailedEmails.ts`
- Modify: `functions/src/index.ts`

**Step 1: Create the function**

```typescript
/**
 * Retry Failed Emails Scheduled Function
 *
 * Runs every 15 minutes to:
 * 1. Find emails that failed more than 5 minutes ago
 * 2. Reset them to pending for retry
 *
 * The processEmailQueue function will pick them up on next run.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getRetryableEmails, resetEmailForRetry } from './dataconnect-mutations';

const MAX_RETRIES_PER_RUN = 10;
const RETRY_AFTER_MINUTES = 5;

export const retryFailedEmails = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Europe/London',
    retryCount: 1,
  },
  async () => {
    console.log('[retryFailedEmails] Checking for failed emails to retry...');

    try {
      const failed = await getRetryableEmails(RETRY_AFTER_MINUTES, MAX_RETRIES_PER_RUN);

      if (failed.length === 0) {
        console.log('[retryFailedEmails] No failed emails to retry');
        return;
      }

      console.log(`[retryFailedEmails] Found ${failed.length} emails to retry`);

      for (const email of failed) {
        await resetEmailForRetry(email.id);
        console.log(`[retryFailedEmails] Reset email ${email.id} for retry (was: ${email.errorMessage})`);
      }

      console.log(`[retryFailedEmails] Reset ${failed.length} emails for retry`);
    } catch (error) {
      console.error('[retryFailedEmails] Error:', error);
      throw error;
    }
  }
);
```

**Step 2: Export from index.ts**

```typescript
export { retryFailedEmails } from './retryFailedEmails';
```

**Step 3: Commit**

```bash
git add functions/src/retryFailedEmails.ts functions/src/index.ts
git commit -m "feat(functions): add retryFailedEmails scheduled function"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Install Resend SDK | `package.json` |
| 2 | Set Firebase secret | (manual) |
| 3 | Add GetPendingEmails query | `queries.gql`, `dataconnect-mutations.ts` |
| 4 | Add status update mutations | `mutations.gql`, `dataconnect-mutations.ts` |
| 5 | Create Resend client wrapper | `email/resendClient.ts` |
| 6 | Create processEmailQueue function | `processEmailQueue.ts`, `index.ts` |
| 7 | Add retry logic queries/mutations | `queries.gql`, `mutations.gql` |
| 8 | Create retryFailedEmails function | `retryFailedEmails.ts`, `index.ts` |

**Total commits:** 7

---

## Flow Diagram

```
processEmailQueue (every 1 min)
    │
    ├── Get pending emails (limit 50)
    │
    ├── Mark as "processing"
    │
    └── For each email:
          │
          ├── sendEmail(to, subject, html)
          │     └── Resend API
          │
          ├── Success → markEmailSent
          │
          └── Failure → markEmailFailed
                          │
                          ▼
              retryFailedEmails (every 15 mins)
                          │
                          └── Reset to "pending" after 5 mins
```

---

## Rate Limits

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day

**Our Processing:**
- 50 emails per minute max
- 100ms delay between sends
- ~5 seconds per batch

**Safe for:** Up to 100 users getting 1 email each per gameweek = ~4 emails/week/user = 400 emails/week = 1,600/month

---

## Testing Checklist

- [ ] Resend API key set as Firebase secret
- [ ] processEmailQueue fetches pending emails
- [ ] Emails marked as "processing" before send
- [ ] Successful emails marked as "sent"
- [ ] Failed emails marked as "failed" with error message
- [ ] Failed emails reset for retry after 5 minutes
- [ ] No duplicate sends (processing status prevents)
- [ ] Email arrives in inbox with correct subject/content

---

## Manual Testing

**1. Queue a test email:**

```typescript
// In Firebase console or test script
await createEmailQueueEntry({
  userUid: 'test-user',
  toEmail: 'your-email@example.com',
  type: 'verdict',
  event: 19,
  subject: 'GW19: Test Email',
  htmlBody: '<h1>Test</h1><p>This is a test email.</p>',
});
```

**2. Trigger processEmailQueue:**

```bash
firebase functions:shell
> processEmailQueue()
```

**3. Verify:**
- Email received in inbox
- EmailQueue status = "sent"
- No errors in function logs
