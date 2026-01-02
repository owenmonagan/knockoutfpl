/**
 * Check Event Status Scheduled Function
 *
 * Runs every 15 minutes to:
 * 1. Find events that are finished but not finalized
 * 2. Poll FPL /event-status/ endpoint
 * 3. Set finalizedAt when scores are truly final
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { fetchEventStatus } from './fpl-scores';
import {
  getEventsNeedingFinalization,
  upsertEventAdmin,
} from './dataconnect-mutations';
import { sendDiscordAlert } from './discord';

const CURRENT_SEASON = '2024-25';

// Discord webhook URL from environment config
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

export const checkEventStatus = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[checkEventStatus] Starting event status check...');

    // 1. Find events that need finalization check
    const pendingEvents = await getEventsNeedingFinalization(CURRENT_SEASON);

    if (pendingEvents.length === 0) {
      console.log('[checkEventStatus] No events pending finalization');
      return;
    }

    console.log(`[checkEventStatus] Found ${pendingEvents.length} events pending finalization`);

    // 2. Fetch current event status from FPL
    const status = await fetchEventStatus();

    if (!status) {
      console.error('[checkEventStatus] Failed to fetch event status from FPL');
      return;
    }

    console.log(`[checkEventStatus] Event ${status.event} status:`, {
      isFinalized: status.isFinalized,
      allBonusAdded: status.allBonusAdded,
      allPointsReady: status.allPointsReady,
      leaguesUpdated: status.leaguesUpdated,
    });

    // 3. If finalized, update the event
    if (status.isFinalized) {
      const matchingEvent = pendingEvents.find(e => e.event === status.event);

      if (matchingEvent) {
        const now = new Date().toISOString();

        await upsertEventAdmin({
          event: matchingEvent.event,
          season: matchingEvent.season,
          name: matchingEvent.name,
          deadlineTime: matchingEvent.deadlineTime,
          finished: true,
          finalizedAt: now,
          isCurrent: matchingEvent.isCurrent,
          isNext: matchingEvent.isNext,
          rawJson: matchingEvent.rawJson,
        });

        console.log(`[checkEventStatus] Marked GW${status.event} as finalized at ${now}`);

        // Send Discord notification
        await sendDiscordAlert(
          `✅ **GW${status.event} Finalized**\nBonus points added and leagues updated. Scores are now final.`,
          DISCORD_WEBHOOK_URL
        );
      }
    } else {
      console.log(`[checkEventStatus] GW${status.event} not yet finalized, will check again`);
    }
  }
);
