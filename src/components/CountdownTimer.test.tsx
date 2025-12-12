import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days from now

      render(<CountdownTimer deadline={futureDeadline} />);

      // Component should render
      expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('calculates time remaining correctly', () => {
      // 2 days, 18 hours from now
      const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 66); // 66 hours = 2 days 18 hours

      render(<CountdownTimer deadline={futureDeadline} />);

      // Should show days and hours (accepting 17-18 hours due to time passing during test)
      expect(screen.getByRole('timer')).toHaveTextContent(/2 days/i);
      expect(screen.getByRole('timer')).toHaveTextContent(/(17|18) hours/i);
    });

    it('formats display string with "Kicks off in" prefix', () => {
      const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 66);

      render(<CountdownTimer deadline={futureDeadline} />);

      expect(screen.getByRole('timer')).toHaveTextContent(/kicks off in/i);
    });
  });

  describe('Color Changes Based on Urgency', () => {
    it('shows blue color when > 48 hours remaining', () => {
      const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 72); // 72 hours

      const { container } = render(<CountdownTimer deadline={futureDeadline} />);

      const timer = container.querySelector('[role="timer"]');
      expect(timer?.className).toMatch(/text-blue-500/);
    });

    it('shows orange color when 24-48 hours remaining', () => {
      const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 36); // 36 hours

      const { container } = render(<CountdownTimer deadline={futureDeadline} />);

      const timer = container.querySelector('[role="timer"]');
      expect(timer?.className).toMatch(/text-orange-500/);
    });

    it('shows red color and pulse animation when < 24 hours remaining', () => {
      const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 12); // 12 hours

      const { container } = render(<CountdownTimer deadline={futureDeadline} />);

      const timer = container.querySelector('[role="timer"]');
      expect(timer?.className).toMatch(/text-red-500/);
      expect(timer?.className).toMatch(/animate-pulse/);
    });
  });

  describe('Live Updates', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('updates display when time passes', () => {
      // Start at exactly 2 days (48 hours) from deadline
      const now = new Date('2025-10-14T12:00:00Z');
      vi.setSystemTime(now);

      const deadline = new Date('2025-10-16T12:00:00Z'); // 48 hours later

      render(<CountdownTimer deadline={deadline} />);

      // Should show 2 days, 0 hours
      expect(screen.getByRole('timer')).toHaveTextContent(/2 days.*0 hours/i);

      // Advance time by 2 hours
      act(() => {
        vi.advanceTimersByTime(1000 * 60 * 60 * 2);
      });

      // Should now show 1 day, 22 hours
      expect(screen.getByRole('timer')).toHaveTextContent(/1 day.*22 hours/i);
    });
  });

  describe('Deadline Display', () => {
    it('displays formatted deadline text', () => {
      const deadline = new Date('2025-10-18T11:00:00Z'); // Saturday, Oct 18, 2025 at 11:00 AM UTC

      render(<CountdownTimer deadline={deadline} />);

      // Should display deadline in readable format
      expect(screen.getByText(/Deadline:/i)).toBeInTheDocument();
      expect(screen.getByText(/Oct 18/i)).toBeInTheDocument();
    });
  });

  describe('onDeadlineReached Callback', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('calls onDeadlineReached when countdown reaches zero', () => {
      const onDeadlineReached = vi.fn();
      const now = new Date('2025-10-14T12:00:00Z');
      vi.setSystemTime(now);

      const deadline = new Date('2025-10-14T12:00:05Z'); // 5 seconds from now

      render(<CountdownTimer deadline={deadline} onDeadlineReached={onDeadlineReached} />);

      // Callback should not have been called yet
      expect(onDeadlineReached).not.toHaveBeenCalled();

      // Advance past the deadline
      act(() => {
        vi.advanceTimersByTime(6000); // 6 seconds
      });

      // Callback should have been called
      expect(onDeadlineReached).toHaveBeenCalledTimes(1);
    });
  });

  describe('Typography Styling', () => {
    it('applies text-5xl font-bold to countdown display', () => {
      const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 72); // 72 hours

      const { container } = render(<CountdownTimer deadline={futureDeadline} />);

      // Find the countdown text element (the "Kicks off in" line)
      const countdownText = container.querySelector('[data-testid="countdown-text"]');
      expect(countdownText?.className).toMatch(/text-5xl/);
      expect(countdownText?.className).toMatch(/font-bold/);
    });
  });
});
