import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TestDataPage } from './TestDataPage';

vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ _type: 'collection' })),
  addDoc: vi.fn().mockResolvedValue({ id: 'test-live-challenge-id' }),
  Timestamp: {
    now: vi.fn().mockReturnValue({ seconds: 1234567890, nanoseconds: 0 }),
    fromDate: vi.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
  },
}));

describe('TestDataPage', () => {
  it('renders without crashing', () => {
    render(<TestDataPage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays "Create Live Challenge" button', () => {
    render(<TestDataPage />);

    const liveButton = screen.getByRole('button', { name: /create live challenge/i });
    expect(liveButton).toBeInTheDocument();
  });

  it('shows created challenge link after clicking "Create Live Challenge"', async () => {
    const user = userEvent.setup();
    render(<TestDataPage />);

    const liveButton = screen.getByRole('button', { name: /create live challenge/i });
    await user.click(liveButton);

    // Should show a link to the created live challenge
    expect(await screen.findByRole('link', { name: /view live challenge/i })).toBeInTheDocument();
  });

  it('displays "Create Completed Challenge" button', () => {
    render(<TestDataPage />);

    const completedButton = screen.getByRole('button', { name: /create completed challenge/i });
    expect(completedButton).toBeInTheDocument();
  });

  it('displays "Create Preview Challenge" button', () => {
    render(<TestDataPage />);

    const previewButton = screen.getByRole('button', { name: /create preview challenge/i });
    expect(previewButton).toBeInTheDocument();
  });

  it('shows created challenge link after clicking "Create Completed Challenge"', async () => {
    const user = userEvent.setup();
    render(<TestDataPage />);

    const completedButton = screen.getByRole('button', { name: /create completed challenge/i });
    await user.click(completedButton);

    // Should show a link to the created completed challenge
    expect(await screen.findByRole('link', { name: /view completed challenge/i })).toBeInTheDocument();
  });

  it('shows error message when Firestore write fails', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('Missing or insufficient permissions'));

    const user = userEvent.setup();
    render(<TestDataPage />);

    const liveButton = screen.getByRole('button', { name: /create live challenge/i });
    await user.click(liveButton);

    // Should show error message
    expect(await screen.findByText(/error.*firebase/i)).toBeInTheDocument();
  });

  it('shows error message when creating completed challenge fails', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('Missing or insufficient permissions'));

    const user = userEvent.setup();
    render(<TestDataPage />);

    const completedButton = screen.getByRole('button', { name: /create completed challenge/i });
    await user.click(completedButton);

    // Should show error message
    expect(await screen.findByText(/error.*firebase/i)).toBeInTheDocument();
  });

  it('shows success message when live challenge is created', async () => {
    const user = userEvent.setup();
    render(<TestDataPage />);

    const liveButton = screen.getByRole('button', { name: /create live challenge/i });
    await user.click(liveButton);

    // Should show success message
    expect(await screen.findByText(/success.*created/i)).toBeInTheDocument();
  });

  it('shows success message when completed challenge is created', async () => {
    const user = userEvent.setup();
    render(<TestDataPage />);

    const completedButton = screen.getByRole('button', { name: /create completed challenge/i });
    await user.click(completedButton);

    // Should show success message
    expect(await screen.findByText(/success.*created/i)).toBeInTheDocument();
  });

  it('disables buttons during loading', async () => {
    const { addDoc } = await import('firebase/firestore');
    // Mock addDoc to take some time
    vi.mocked(addDoc).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ id: 'test-id' }), 100)));

    const user = userEvent.setup();
    render(<TestDataPage />);

    const liveButton = screen.getByRole('button', { name: /create live challenge/i });
    const completedButton = screen.getByRole('button', { name: /create completed challenge/i });

    // Click live button
    await user.click(liveButton);

    // Both buttons should be disabled during loading
    expect(liveButton).toBeDisabled();
    expect(completedButton).toBeDisabled();
  });

  it('uses previous gameweek for live challenge', async () => {
    // Mock getCurrentGameweek to return gameweek 10
    vi.mock('../services/fpl', () => ({
      getCurrentGameweek: vi.fn().mockResolvedValue(10),
    }));

    const { getCurrentGameweek } = await import('../services/fpl');
    const { addDoc } = await import('firebase/firestore');

    const user = userEvent.setup();
    render(<TestDataPage />);

    const liveButton = screen.getByRole('button', { name: /create live challenge/i });
    await user.click(liveButton);

    // Should call getCurrentGameweek
    expect(getCurrentGameweek).toHaveBeenCalled();

    // Should create challenge with gameweek 9 (current - 1)
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        gameweek: 9,
      })
    );
  });

  it('creates preview challenge with future deadline', async () => {
    const { addDoc, Timestamp } = await import('firebase/firestore');

    const user = userEvent.setup();
    render(<TestDataPage />);

    const previewButton = screen.getByRole('button', { name: /create preview challenge/i });
    await user.click(previewButton);

    // Should create challenge with status 'accepted' and future deadline
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: 'accepted',
        gameweekFinished: false,
      })
    );

    // Should have created a future deadline (approximately 2 days from now)
    const callArgs = vi.mocked(addDoc).mock.calls[vi.mocked(addDoc).mock.calls.length - 1][1] as any;
    const deadlineTimestamp = callArgs.gameweekDeadline;

    // Verify deadline is in the future (should be ~2 days from now, give some tolerance)
    const now = Date.now() / 1000; // Current time in seconds
    const twoDaysInSeconds = 2 * 24 * 60 * 60;
    const expectedDeadline = now + twoDaysInSeconds;

    // Allow 10 seconds tolerance for test execution time
    expect(deadlineTimestamp.seconds).toBeGreaterThan(now);
    expect(deadlineTimestamp.seconds).toBeLessThan(expectedDeadline + 10);
  });

  it('shows created challenge link after clicking "Create Preview Challenge"', async () => {
    const user = userEvent.setup();
    render(<TestDataPage />);

    const previewButton = screen.getByRole('button', { name: /create preview challenge/i });
    await user.click(previewButton);

    // Should show a link to the created preview challenge
    expect(await screen.findByRole('link', { name: /view preview challenge/i })).toBeInTheDocument();
  });
});
