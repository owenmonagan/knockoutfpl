// functions/src/discord.ts
/**
 * Discord Webhook Helper
 *
 * Simple helper for sending alerts to Discord channels via webhooks.
 */

/**
 * Send an alert message to Discord
 */
export async function sendDiscordAlert(message: string, webhookUrl: string): Promise<void> {
  if (!webhookUrl) {
    console.log('[discord] No webhook URL configured, skipping alert');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      console.error(`[discord] Discord webhook failed: ${response.status}`);
    }
  } catch (error) {
    console.error('[discord] Failed to send Discord alert:', error);
  }
}
