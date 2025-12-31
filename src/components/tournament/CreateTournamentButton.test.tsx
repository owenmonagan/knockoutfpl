// src/components/tournament/CreateTournamentButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTournamentButton } from './CreateTournamentButton';

describe('CreateTournamentButton', () => {
  it('should render button', () => {
    render(<CreateTournamentButton onCreate={async () => {}} />);
    expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
  });

  it('should show progress checklist when creating', async () => {
    const slowCreate = () => new Promise<void>(() => {}); // Never resolves
    render(<CreateTournamentButton onCreate={slowCreate} />);

    fireEvent.click(screen.getByRole('button'));

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

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error message on failure', async () => {
    const failingCreate = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<CreateTournamentButton onCreate={failingCreate} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Creation Failed')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show retry button on error', async () => {
    const failingCreate = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<CreateTournamentButton onCreate={failingCreate} />);

    fireEvent.click(screen.getByRole('button'));

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

    // Initial click
    await user.click(screen.getByRole('button'));

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

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Tournament Created!')).toBeInTheDocument();
    });
  });
});
