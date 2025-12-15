// src/components/tournament/CreateTournamentButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTournamentButton } from './CreateTournamentButton';

describe('CreateTournamentButton', () => {
  it('should render button', () => {
    render(<CreateTournamentButton onCreate={async () => {}} />);
    expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
  });

  it('should show loading state when creating', async () => {
    const slowCreate = () => new Promise<void>(() => {}); // Never resolves
    render(<CreateTournamentButton onCreate={slowCreate} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });
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
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should disable button while loading', async () => {
    const slowCreate = () => new Promise<void>(() => {});
    render(<CreateTournamentButton onCreate={slowCreate} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
