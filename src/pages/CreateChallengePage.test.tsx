import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateChallengePage } from './CreateChallengePage';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock FPL service
vi.mock('../services/fpl', () => ({
  getCurrentGameweek: vi.fn(),
  getGameweekInfo: vi.fn(),
}));

// Mock challenge service
vi.mock('../services/challenge', () => ({
  createChallenge: vi.fn(),
}));

// Mock user service
vi.mock('../services/user', () => ({
  getUserProfile: vi.fn(),
}));

// Mock useAuth hook
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('CreateChallengePage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock pointer capture and scroll for Radix UI Select
    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = vi.fn();
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = vi.fn();
    }
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = vi.fn();
    }

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    // Mock useNavigate
    const { useNavigate } = await import('react-router-dom');
    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    // Setup default mock for useAuth (Firebase Auth user - no FPL data)
    const { useAuth } = await import('../contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      },
      loading: false,
      isAuthenticated: true,
    } as any);

    // Setup default mock for getUserProfile (Firestore user - has FPL data)
    const { getUserProfile } = await import('../services/user');
    vi.mocked(getUserProfile).mockResolvedValue({
      userId: 'user-123',
      fplTeamId: 158256,
      fplTeamName: 'Test Team',
      email: 'test@example.com',
      displayName: 'Test User',
      wins: 0,
      losses: 0,
      createdAt: {} as any,
      updatedAt: {} as any,
    });

    // Setup default mock for getCurrentGameweek
    const { getCurrentGameweek, getGameweekInfo } = await import('../services/fpl');
    vi.mocked(getCurrentGameweek).mockResolvedValue(7);

    // Setup default mock for getGameweekInfo
    vi.mocked(getGameweekInfo).mockResolvedValue({
      id: 7,
      deadline: new Date('2025-10-20T11:30:00Z'),
      finished: false,
    });
  });

  it('should render', () => {
    render(<CreateChallengePage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should call getUserProfile on mount to fetch FPL team data', async () => {
    const { getUserProfile } = await import('../services/user');

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(getUserProfile).toHaveBeenCalledWith('user-123');
    });
  });

  it('should show page title', () => {
    render(<CreateChallengePage />);

    expect(screen.getByRole('heading', { name: /create challenge/i })).toBeInTheDocument();
  });

  it('should show gameweek selector label', () => {
    render(<CreateChallengePage />);

    expect(screen.getByLabelText(/select gameweek/i)).toBeInTheDocument();
  });

  it('should show create challenge button', () => {
    render(<CreateChallengePage />);

    expect(screen.getByRole('button', { name: /create challenge/i })).toBeInTheDocument();
  });

  it('should have gameweek options in selector', async () => {
    const user = userEvent.setup();
    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Click to open the select
    await user.click(screen.getByRole('combobox'));

    // Options should be rendered in a portal
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  it('should call getCurrentGameweek on mount', async () => {
    const { getCurrentGameweek } = await import('../services/fpl');

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(getCurrentGameweek).toHaveBeenCalled();
    });
  });

  it('should populate dropdown with gameweek options from current to GW38', async () => {
    const user = userEvent.setup();
    const { getCurrentGameweek } = await import('../services/fpl');
    vi.mocked(getCurrentGameweek).mockResolvedValue(7);

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Click to open the select
    await user.click(screen.getByRole('combobox'));

    // Check options in the portal
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Should have options for gameweeks 7 through 38 (32 options)
      expect(options).toHaveLength(32);
      expect(options[0]).toHaveTextContent('Gameweek 7');
      expect(options[31]).toHaveTextContent('Gameweek 38');
    });
  });

  it('should update selected gameweek when user selects an option', async () => {
    const user = userEvent.setup();
    const { getCurrentGameweek } = await import('../services/fpl');
    vi.mocked(getCurrentGameweek).mockResolvedValue(7);

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Click to open the select
    await user.click(screen.getByRole('combobox'));

    // Click on Gameweek 10 option
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /gameweek 10/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: /gameweek 10/i }));

    // After selecting, the trigger should show the selected value
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Gameweek 10');
    });
  });

  it('should call createChallenge when button is clicked with selected gameweek', async () => {
    const user = userEvent.setup();
    const { createChallenge } = await import('../services/challenge');
    const { getGameweekInfo } = await import('../services/fpl');

    vi.mocked(createChallenge).mockResolvedValue('challenge-123');
    vi.mocked(getGameweekInfo).mockResolvedValue({
      id: 10,
      deadline: new Date('2025-10-20T11:30:00Z'),
      finished: false,
    });

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select gameweek 10
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /gameweek 10/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /gameweek 10/i }));

    // Click create button
    const button = screen.getByRole('button', { name: /create challenge/i });
    await user.click(button);

    await waitFor(() => {
      expect(createChallenge).toHaveBeenCalledWith({
        userId: 'user-123',
        fplTeamId: 158256,
        fplTeamName: 'Test Team',
        gameweek: 10,
        gameweekDeadline: new Date('2025-10-20T11:30:00Z'),
      });
    });
  });

  it('should show success message with shareable link after creating challenge', async () => {
    const user = userEvent.setup();
    const { createChallenge } = await import('../services/challenge');
    const { getGameweekInfo } = await import('../services/fpl');

    vi.mocked(createChallenge).mockResolvedValue('challenge-123');
    vi.mocked(getGameweekInfo).mockResolvedValue({
      id: 10,
      deadline: new Date('2025-10-20T11:30:00Z'),
      finished: false,
    });

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select gameweek 10
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /gameweek 10/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /gameweek 10/i }));

    // Click create button
    const button = screen.getByRole('button', { name: /create challenge/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/challenge created successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/challenge-123/)).toBeInTheDocument();
    });
  });

  it('should render form inside a Card component', () => {
    render(<CreateChallengePage />);

    // Card should be present (look for card class or data-testid)
    const main = screen.getByRole('main');
    const card = main.querySelector('[class*="card"]');

    expect(card).toBeInTheDocument();
  });

  it('should use shadcn Select component instead of native select', async () => {
    render(<CreateChallengePage />);

    await waitFor(() => {
      // shadcn Select uses a button with role="combobox"
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger.tagName).toBe('BUTTON');
    });
  });

  it('should disable create button when user has no FPL team connected', async () => {
    // Mock getUserProfile to return user without FPL team
    const { getUserProfile } = await import('../services/user');
    vi.mocked(getUserProfile).mockResolvedValue({
      userId: 'user-123',
      fplTeamId: 0,  // No team connected
      fplTeamName: '',
      email: 'test@example.com',
      displayName: 'Test User',
      wins: 0,
      losses: 0,
      createdAt: {} as any,
      updatedAt: {} as any,
    });

    render(<CreateChallengePage />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /create challenge/i });
      expect(button).toBeDisabled();
    });
  });

  it('should show deadline when a gameweek is selected', async () => {
    const user = userEvent.setup();
    const { getGameweekInfo } = await import('../services/fpl');

    vi.mocked(getGameweekInfo).mockResolvedValue({
      id: 10,
      deadline: new Date('2025-10-20T11:30:00Z'),
      finished: false,
    });

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select gameweek 10
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /gameweek 10/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /gameweek 10/i }));

    // Wait for deadline to be displayed
    await waitFor(() => {
      expect(screen.getByText(/deadline:/i)).toBeInTheDocument();
    });
  });

  it('should show copy link button after challenge is created', async () => {
    const user = userEvent.setup();
    const { createChallenge } = await import('../services/challenge');
    const { getGameweekInfo } = await import('../services/fpl');

    vi.mocked(createChallenge).mockResolvedValue('challenge-123');
    vi.mocked(getGameweekInfo).mockResolvedValue({
      id: 10,
      deadline: new Date('2025-10-20T11:30:00Z'),
      finished: false,
    });

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select gameweek 10
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /gameweek 10/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /gameweek 10/i }));

    // Click create button
    const button = screen.getByRole('button', { name: /create challenge/i });
    await user.click(button);

    // Should show shareable URL
    await waitFor(() => {
      expect(screen.getByText(/challenge created successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/challenge\/challenge-123/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    });
  });

  it('should show "Back to Dashboard" button after challenge is created', async () => {
    const user = userEvent.setup();
    const { createChallenge } = await import('../services/challenge');
    const { getGameweekInfo } = await import('../services/fpl');

    vi.mocked(createChallenge).mockResolvedValue('challenge-123');
    vi.mocked(getGameweekInfo).mockResolvedValue({
      id: 10,
      deadline: new Date('2025-10-20T11:30:00Z'),
      finished: false,
    });

    render(<CreateChallengePage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select gameweek 10
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /gameweek 10/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /gameweek 10/i }));

    // Click create button
    const button = screen.getByRole('button', { name: /create challenge/i });
    await user.click(button);

    // Should show "Back to Dashboard" button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
    });
  });
});
