import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareTournamentDialog } from './ShareTournamentDialog';

describe('ShareTournamentDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    leagueId: 12345,
    leagueName: 'Test League',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with correct content', () => {
    render(<ShareTournamentDialog {...defaultProps} />);

    expect(screen.getByText('Tournament Created!')).toBeInTheDocument();
    expect(screen.getByText(/Share this link with Test League members/)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('http://localhost:3000/league/12345');
  });

  it('does not render when isOpen is false', () => {
    render(<ShareTournamentDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Tournament Created!')).not.toBeInTheDocument();
  });

  it('calls onClose when View Bracket button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShareTournamentDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'View Bracket' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has copy button for URL', () => {
    render(<ShareTournamentDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
  });

  it('shows trophy icon', () => {
    render(<ShareTournamentDialog {...defaultProps} />);

    // Trophy icon should be present (part of the visual design)
    const trophyContainer = document.querySelector('.rounded-full.bg-primary\\/10');
    expect(trophyContainer).toBeInTheDocument();
  });
});
