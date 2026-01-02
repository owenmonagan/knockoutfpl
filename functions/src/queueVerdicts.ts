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
