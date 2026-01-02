import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareTournamentDialog } from './ShareTournamentDialog';

// Mock ShareImagePreview component
vi.mock('./ShareImagePreview', () => ({
  ShareImagePreview: ({ leagueName, roundName, participantCount, shareUrl, closestMatchStat }: {
    leagueName: string;
    roundName: string;
    participantCount: number;
    shareUrl: string;
    closestMatchStat?: string;
  }) => (
    <div data-testid="share-image-preview">
      <span data-testid="preview-league">{leagueName}</span>
      <span data-testid="preview-round">{roundName}</span>
      <span data-testid="preview-count">{participantCount}</span>
      <span data-testid="preview-url">{shareUrl}</span>
      {closestMatchStat && <span data-testid="preview-stat">{closestMatchStat}</span>}
    </div>
  ),
}));

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

  describe('Enhanced mode with image preview', () => {
    const enhancedProps = {
      ...defaultProps,
      roundName: 'Semi-Finals',
      participantCount: 16,
    };

    it('renders enhanced mode when roundName and participantCount provided', () => {
      render(<ShareTournamentDialog {...enhancedProps} />);

      // Should show Share Tournament title (not Tournament Created!)
      expect(screen.getByText('Share Tournament')).toBeInTheDocument();
      expect(screen.queryByText('Tournament Created!')).not.toBeInTheDocument();

      // Should show image preview
      expect(screen.getByTestId('share-image-preview')).toBeInTheDocument();
    });

    it('passes correct props to ShareImagePreview', () => {
      render(<ShareTournamentDialog {...enhancedProps} />);

      expect(screen.getByTestId('preview-league')).toHaveTextContent('Test League');
      expect(screen.getByTestId('preview-round')).toHaveTextContent('Semi-Finals');
      expect(screen.getByTestId('preview-count')).toHaveTextContent('16');
      expect(screen.getByTestId('preview-url')).toHaveTextContent('http://localhost:3000/league/12345');
    });

    it('passes closestMatchStat to ShareImagePreview when provided', () => {
      render(<ShareTournamentDialog {...enhancedProps} closestMatchStat="Won by 2 points" />);

      expect(screen.getByTestId('preview-stat')).toHaveTextContent('Won by 2 points');
    });

    it('shows Copy link instead button initially in enhanced mode', () => {
      render(<ShareTournamentDialog {...enhancedProps} />);

      expect(screen.getByRole('button', { name: 'Copy link instead' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows link input after clicking Copy link instead', async () => {
      const user = userEvent.setup();
      render(<ShareTournamentDialog {...enhancedProps} />);

      await user.click(screen.getByRole('button', { name: 'Copy link instead' }));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveValue('http://localhost:3000/league/12345');
      expect(screen.queryByRole('button', { name: 'Copy link instead' })).not.toBeInTheDocument();
    });

    it('has copy button in enhanced mode link input', async () => {
      const user = userEvent.setup();
      render(<ShareTournamentDialog {...enhancedProps} />);

      await user.click(screen.getByRole('button', { name: 'Copy link instead' }));

      expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    });

    it('does not show View Bracket button in enhanced mode', () => {
      render(<ShareTournamentDialog {...enhancedProps} />);

      expect(screen.queryByRole('button', { name: 'View Bracket' })).not.toBeInTheDocument();
    });

    it('does not show trophy icon in enhanced mode', () => {
      render(<ShareTournamentDialog {...enhancedProps} />);

      const trophyContainer = document.querySelector('.rounded-full.bg-primary\\/10');
      expect(trophyContainer).not.toBeInTheDocument();
    });

    it('starts fresh when mounted with initial state', () => {
      // Verify that each fresh render starts in initial state
      // (this tests the default state initialization, not state reset on close)
      const { unmount } = render(<ShareTournamentDialog {...enhancedProps} />);

      // Should show Copy link button initially
      expect(screen.getByRole('button', { name: 'Copy link instead' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      unmount();
    });
  });
});
