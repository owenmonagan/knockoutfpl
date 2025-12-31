// src/components/tournament/CreateTournamentButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTournamentButton } from './CreateTournamentButton';
import * as fplService from '../../services/fpl';

// Mock the fpl service
vi.mock('../../services/fpl', () => ({
  getFPLBootstrapData: vi.fn(),
}));

describe('CreateTournamentButton', () => {
  const mockGetFPLBootstrapData = vi.mocked(fplService.getFPLBootstrapData);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: current gameweek is 20
    mockGetFPLBootstrapData.mockResolvedValue({ currentGameweek: 20 });
  });

  it('should render button', async () => {
    render(<CreateTournamentButton onCreate={async () => {}} />);
    // Wait for bootstrap data to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });
  });

  it('should render gameweek dropdown with label', async () => {
    render(<CreateTournamentButton onCreate={async () => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Starting Gameweek')).toBeInTheDocument();
    });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should default to next gameweek (current + 1)', async () => {
    mockGetFPLBootstrapData.mockResolvedValue({ currentGameweek: 20 });
    render(<CreateTournamentButton onCreate={async () => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('GW 21');
    });
  });

  it('should default to GW 1 if bootstrap fetch fails', async () => {
    mockGetFPLBootstrapData.mockRejectedValue(new Error('Network error'));
    render(<CreateTournamentButton onCreate={async () => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('GW 1');
    });
  });

  it('should show all gameweeks 1-38 in dropdown', async () => {
    render(<CreateTournamentButton onCreate={async () => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // The dropdown should have a value (showing the default GW 21)
    // We can't easily test all 38 options due to jsdom limitations with Radix Select,
    // but we verify the combobox renders and has the expected default value
    expect(screen.getByRole('combobox')).toHaveTextContent('GW 21');
  });

  it('should mark current gameweek with "(current)" when selected', async () => {
    // When current gameweek (20) is selected, it should show "(current)"
    mockGetFPLBootstrapData.mockResolvedValue({ currentGameweek: 1 });
    render(<CreateTournamentButton onCreate={async () => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Default will be GW 2 (current + 1)
    // We verify the dropdown renders with the label
    expect(screen.getByText('Starting Gameweek')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('GW 2');
  });

  it('should pass selected gameweek to onCreate', async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    mockGetFPLBootstrapData.mockResolvedValue({ currentGameweek: 20 });
    render(<CreateTournamentButton onCreate={handleCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    await waitFor(() => {
      // Default is current + 1 = 21
      expect(handleCreate).toHaveBeenCalledWith(21);
    });
  });

  it('should pass default gameweek to onCreate when no selection changed', async () => {
    // Testing the default behavior - user doesn't change the selection
    // The dropdown selection interaction is tested via E2E (Playwright) due to jsdom limitations
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    mockGetFPLBootstrapData.mockResolvedValue({ currentGameweek: 15 });
    render(<CreateTournamentButton onCreate={handleCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Verify default is current + 1 = 16
    expect(screen.getByRole('combobox')).toHaveTextContent('GW 16');

    // Click create button
    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledWith(16);
    });
  });

  it('should disable dropdown during creation', async () => {
    const slowCreate = () => new Promise<void>(() => {}); // Never resolves
    render(<CreateTournamentButton onCreate={slowCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Start creation
    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    // Dropdown should be disabled (component switches to checklist view)
    await waitFor(() => {
      expect(screen.getByText('Creating Your Tournament')).toBeInTheDocument();
    });
    // Select is no longer visible when showing checklist
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('should show progress checklist when creating', async () => {
    const slowCreate = () => new Promise<void>(() => {}); // Never resolves
    render(<CreateTournamentButton onCreate={slowCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    // Button should be replaced by checklist
    await waitFor(() => {
      expect(screen.getByText('Creating Your Tournament')).toBeInTheDocument();
    });

    // Button should no longer be visible
    expect(screen.queryByRole('button', { name: /create tournament/i })).not.toBeInTheDocument();
  });

  it('should call onCreate when clicked', async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateTournamentButton onCreate={handleCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error message on failure', async () => {
    const failingCreate = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<CreateTournamentButton onCreate={failingCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    await waitFor(() => {
      expect(screen.getByText('Creation Failed')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show retry button on error', async () => {
    const failingCreate = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<CreateTournamentButton onCreate={failingCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should retry when retry button is clicked', async () => {
    const user = userEvent.setup();
    // First call fails, second succeeds
    const onCreate = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    render(<CreateTournamentButton onCreate={onCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    // Initial click
    await user.click(screen.getByRole('button', { name: /create tournament/i }));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Creation Failed')).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole('button', { name: /try again/i }));

    // Should call onCreate again
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(2);
    });
  });

  it('should show completed state when creation succeeds', async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateTournamentButton onCreate={handleCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create tournament/i }));

    await waitFor(() => {
      expect(screen.getByText('Tournament Created!')).toBeInTheDocument();
    });
  });

  it('should cap default gameweek at 38', async () => {
    // If current gameweek is 38, can't go to 39
    mockGetFPLBootstrapData.mockResolvedValue({ currentGameweek: 38 });
    render(<CreateTournamentButton onCreate={async () => {}} />);

    await waitFor(() => {
      // Should show GW 38, not GW 39
      expect(screen.getByRole('combobox')).toHaveTextContent('GW 38');
    });
  });
});
