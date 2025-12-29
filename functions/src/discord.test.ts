// functions/src/discord.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendDiscordAlert } from './discord';

describe('sendDiscordAlert', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send message to Discord webhook', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await sendDiscordAlert('Test message', 'https://discord.com/api/webhooks/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test message' }),
      })
    );
  });

  it('should log error when webhook fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    global.fetch = mockFetch;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await sendDiscordAlert('Test message', 'https://discord.com/api/webhooks/test');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Discord webhook failed'));
    consoleSpy.mockRestore();
  });

  it('should skip when no webhook URL provided', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    await sendDiscordAlert('Test message', '');

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
