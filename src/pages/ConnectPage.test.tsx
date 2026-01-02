import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    user: { uid: 'test-user-id', email: 'test@example.com', displayName: 'Test User' },
  }),
}));

// Mock user service
vi.mock('../services/user', () => ({
  connectFPLTeam: vi.fn(),
  getUserProfile: vi.fn().mockResolvedValue(null), // No existing profile by default
}));

// Mock FPL service
vi.mock('../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

// Store original location
const originalLocation = window.location;

beforeEach(() => {
  vi.clearAllMocks();
  // Reset mock implementations to default (undefined)
  (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockReset();
  (connectFPLTeam as ReturnType<typeof vi.fn>).mockReset();
  // Clear sessionStorage to prevent state leaking between tests
  sessionStorage.clear();
  // Mock window.location.href
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: '' },
  });
});

afterEach(() => {
  // Restore original location
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

describe('ConnectPage', () => {
  it('renders the page title', async () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Connect Your FPL Team')).toBeInTheDocument();
    });
  });

  it('renders the subtitle', async () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Enter your unique FPL Team ID to sync your leagues/)).toBeInTheDocument();
    });
  });

  it('renders the FPL Team ID input', async () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
    });
  });

  it('renders the help link', async () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Where do I find my Team ID/)).toBeInTheDocument();
    });
  });

  it('renders the Connect & Continue button', async () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Connect & Continue/i })).toBeInTheDocument();
    });
  });

  it('shows loading state when form is submitted', async () => {
    const user = userEvent.setup();
    (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('FPL Team ID'), '158256');
    await user.click(screen.getByRole('button', { name: /Connect & Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Connecting.../i)).toBeInTheDocument();
    });
  });

  it('redirects immediately on successful team connection', async () => {
    const user = userEvent.setup();

    (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      teamId: 158256,
      teamName: 'Owen FC',
      overallRank: 245892,
    });
    (connectFPLTeam as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('FPL Team ID'), '158256');
    await user.click(screen.getByRole('button', { name: /Connect & Continue/i }));

    await waitFor(() => {
      expect(connectFPLTeam).toHaveBeenCalledWith('test-user-id', 'test@example.com', 158256);
      expect(window.location.href).toBe('/leagues');
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

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('FPL Team ID'), '999999');
    await user.click(screen.getByRole('button', { name: /Connect & Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Team not found. Check your ID and try again.')).toBeInTheDocument();
    });
  });

  it('expands help accordion when clicking "Where do I find my Team ID?"', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Where do I find my Team ID/)).toBeInTheDocument();
    });

    // Accordion content should not be visible initially
    expect(screen.queryByText(/fantasy.premierleague.com\/entry/)).not.toBeInTheDocument();

    await user.click(screen.getByText(/Where do I find my Team ID/));

    await waitFor(() => {
      expect(screen.getByText(/fantasy.premierleague.com\/entry/)).toBeInTheDocument();
    });
  });
});
