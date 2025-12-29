// functions/src/checkStuckTournaments.ts
/**
 * Stuck Tournament Checker
 *
 * Scheduled function that runs every 6 hours to check for test tournaments
 * that haven't completed within 24 hours. Sends Discord alerts for each
 * stuck tournament found.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getStuckTestTournaments } from './dataconnect-mutations';
import { sendDiscordAlert } from './discord';

const STUCK_TIMEOUT_HOURS = 24;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

/**
 * Format time since a given date string in human-readable format
 */
function formatTimeSince(dateString: string): string {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h ago`;
  }
  return `${diffHours}h ago`;
}

export const checkStuckTournaments = onSchedule(
  {
    schedule: 'every 6 hours',
    timeZone: 'Europe/London',
    retryCount: 1,
  },
  async () => {
    console.log('[checkStuckTournaments] Starting stuck tournament check');

    try {
      // Calculate cutoff time (24 hours ago)
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - STUCK_TIMEOUT_HOURS);

      console.log(`[checkStuckTournaments] Checking for tournaments created before ${cutoffTime.toISOString()}`);

      // Query stuck tournaments
      const stuckTournaments = await getStuckTestTournaments(cutoffTime);

      console.log(`[checkStuckTournaments] Found ${stuckTournaments.length} stuck tournament(s)`);

      if (stuckTournaments.length === 0) {
        console.log('[checkStuckTournaments] No stuck tournaments found');
        return;
      }

      // Send Discord alert for each stuck tournament
      for (const tournament of stuckTournaments) {
        const timeSince = formatTimeSince(tournament.createdAt);
        const currentRound = tournament.currentRound ?? 1;

        const message = [
          `\u26a0\ufe0f Tournament stuck - ${tournament.fplLeagueName} (${tournament.id})`,
          `Status: ${tournament.status}, Round ${currentRound}/${tournament.totalRounds}`,
          `Created: ${timeSince}`,
        ].join('\n');

        console.log(`[checkStuckTournaments] Alerting: ${tournament.id}`);
        await sendDiscordAlert(message, DISCORD_WEBHOOK_URL);
      }

      console.log('[checkStuckTournaments] Completed successfully');
    } catch (error) {
      console.error('[checkStuckTournaments] Fatal error:', error);

      // Send crash alert
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendDiscordAlert(
        `\u274c checkStuckTournaments crashed: ${errorMessage}`,
        DISCORD_WEBHOOK_URL
      );

      throw error;
    }
  }
);
