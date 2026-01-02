/**
 * Queue Verdict Emails Scheduled Function
 *
 * Runs every 5 minutes to:
 * 1. Find finalized events
 * 2. For each user with matches in that event:
 *    a. Check if all their matches have updatedAt >= finalizedAt
 *    b. If yes, queue a verdict email
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  getFinalizedEvents,
  getUsersWithMatchesInEvent,
  getEntryMatchesInEvent,
  emailAlreadyQueued,
  createEmailQueueEntry,
} from './dataconnect-mutations';

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
        console.log(`[queueVerdicts] Found ${users.length} users with matches in GW${event.event}`);

        for (const user of users) {
          // 3. Check if already queued
          const alreadyQueued = await emailAlreadyQueued(user.uid, 'verdict', event.event);
          if (alreadyQueued) {
            continue;
          }

          // 4. Get all matches for this user in this event
          const matches = await getEntryMatchesInEvent(user.entryId, event.event);

          if (matches.length === 0) {
            continue;
          }

          // 5. Check if ALL matches are updated after finalization
          const allMatchesUpdated = matches.every(match => {
            // Byes don't need updating
            if (match.isBye) return true;

            const matchUpdatedAt = new Date(match.updatedAt);
            return matchUpdatedAt >= finalizedAt;
          });

          if (!allMatchesUpdated) {
            console.log(`[queueVerdicts] User ${user.uid} has stale matches, skipping`);
            continue;
          }

          // 6. Check all matches have results (winner determined or bye)
          const allMatchesResolved = matches.every(match => {
            return match.isBye || match.winnerEntryId !== null;
          });

          if (!allMatchesResolved) {
            console.log(`[queueVerdicts] User ${user.uid} has unresolved matches, skipping`);
            continue;
          }

          // 7. Queue the verdict email
          // TODO: Task 6 will replace this with actual rendered email content
          try {
            await createEmailQueueEntry({
              userUid: user.uid,
              toEmail: user.email,
              type: 'verdict',
              event: event.event,
              subject: `Your Knockout FPL Results for GW${event.event}`,
              htmlBody: `<p>Your match results for Gameweek ${event.event} are ready!</p>`,
            });
            totalQueued++;
            console.log(`[queueVerdicts] Queued verdict email for user ${user.uid} (GW${event.event})`);
          } catch (error) {
            // May fail due to unique constraint if race condition - that's OK
            console.log(`[queueVerdicts] Could not queue for ${user.uid}: ${error}`);
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
