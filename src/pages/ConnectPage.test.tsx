import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ConnectPage } from './ConnectPage';
import { getFPLTeamInfo } from '../services/fpl';
import { connectFPLTeam } from '../services/user';

const mockNavigate = vi.fn();

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', displayName: 'Test User' },
  }),
}));

// Mock user service
vi.mock('../services/user', () => ({
  connectFPLTeam: vi.fn(),
}));

// Mock FPL service
vi.mock('../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConnectPage', () => {
  it('renders the page title', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Connect Your FPL Team')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Let's see what you're made of.")).toBeInTheDocument();
  });

  it('renders the FPL Team ID input', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
  });

  it('renders the help link', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Where's my Team ID?")).toBeInTheDocument();
  });

  it('renders the Find My Team button', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: 'Find My Team' })).toBeInTheDocument();
  });

  it('shows loading state when form is submitted', async () => {
    const user = userEvent.setup();
    (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText('FPL Team ID'), '158256');
    await user.click(screen.getByRole('button', { name: 'Find My Team' }));

    await waitFor(() => {
      expect(screen.getByText('Finding your team...')).toBeInTheDocument();
    });
  });

  it('shows success confirmation after finding team', async () => {
    const user = userEvent.setup();
    (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      teamId: 158256,
      teamName: 'Owen FC',
      overallRank: 245892,
    });

    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText('FPL Team ID'), '158256');
    await user.click(screen.getByRole('button', { name: 'Find My Team' }));

    await waitFor(() => {
      expect(screen.getByText('Owen FC')).toBeInTheDocument();
      expect(screen.getByText('Overall Rank: 245,892')).toBeInTheDocument();
      expect(screen.getByText("Let's go.")).toBeInTheDocument();
    });
  });

  it('shows error message when team not found', async () => {
    const user = userEvent.setup();
    (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'));

    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText('FPL Team ID'), '999999');
    await user.click(screen.getByRole('button', { name: 'Find My Team' }));

    await waitFor(() => {
      expect(screen.getByText('Team not found. Check your ID and try again.')).toBeInTheDocument();
    });
  });

  it('saves team to Firestore and redirects to /leagues', async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      teamId: 158256,
      teamName: 'Owen FC',
      overallRank: 245892,
    });

    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText('FPL Team ID'), '158256');
    await user.click(screen.getByRole('button', { name: 'Find My Team' }));

    await waitFor(() => {
      expect(connectFPLTeam).toHaveBeenCalledWith('test-user-id', 158256);
    });

    // Advance timer for auto-redirect (1.5s)
    vi.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues');
    });

    vi.useRealTimers();
  });
});
