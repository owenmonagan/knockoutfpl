import { describe, it, expect } from 'vitest';

// Test the time formatting logic (extracted for testing)
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

describe('formatTimeSince', () => {
  it('should format hours correctly', () => {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    const result = formatTimeSince(threeHoursAgo.toISOString());
    expect(result).toBe('3h ago');
  });

  it('should format days and hours correctly', () => {
    const oneDayAndFiveHoursAgo = new Date();
    oneDayAndFiveHoursAgo.setHours(oneDayAndFiveHoursAgo.getHours() - 29);

    const result = formatTimeSince(oneDayAndFiveHoursAgo.toISOString());
    expect(result).toBe('1d 5h ago');
  });

  it('should handle exactly 24 hours', () => {
    const exactlyOneDayAgo = new Date();
    exactlyOneDayAgo.setHours(exactlyOneDayAgo.getHours() - 24);

    const result = formatTimeSince(exactlyOneDayAgo.toISOString());
    expect(result).toBe('1d 0h ago');
  });
});
