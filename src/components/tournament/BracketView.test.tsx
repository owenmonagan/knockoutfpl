// src/components/tournament/BracketView.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BracketView } from './BracketView';
import type { Tournament } from '../../types/tournament';

// Mock ShareTournamentDialog to simplify testing
vi.mock('./ShareTournamentDialog', () => ({
  ShareTournamentDialog: ({ isOpen, onClose, leagueId, leagueName, roundName, participantCount }: {
    isOpen: boolean;
    onClose: () => void;
    leagueId: number;
    leagueName: string;
    roundName?: string;
    participantCount?: number;
  }) =>
    isOpen ? (
      <div data-testid="share-dialog">
        <span data-testid="share-league-id">{leagueId}</span>
        <span data-testid="share-league-name">{leagueName}</span>
        {roundName && <span data-testid="share-round-name">{roundName}</span>}
        {participantCount && <span data-testid="share-participant-count">{participantCount}</span>}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe('BracketView', () => {
  const mockTournament: Tournament = {
    id: 'tour-1',
    fplLeagueId: 123,
    fplLeagueName: 'Test League',
    creatorUserId: 'user-1',
    startGameweek: 20,
    currentRound: 1,
    currentGameweek: 20,
    totalRounds: 2,
    status: 'active',
    participants: [
      { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
      { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
      { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Manager C', seed: 3 },
      { fplTeamId: 4, fplTeamName: 'Team D', managerName: 'Manager D', seed: 4 },
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Semi-Finals',
        gameweek: 20,
        isComplete: false,
        matches: [
          { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
          { id: 'r1-m2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
        ],
      },
      {
        roundNumber: 2,
        name: 'Final',
        gameweek: 21,
        isComplete: false,
        matches: [
          { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
        ],
      },
    ],
    winnerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders tournament header', () => {
    render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

    expect(screen.getByText('Test League')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders bracket layout with all rounds', () => {
    render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('renders all participants in bracket and table', () => {
    render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

    // Each team appears twice: once in bracket, once in table
    expect(screen.getAllByText('Team A')).toHaveLength(2);
    expect(screen.getAllByText('Team B')).toHaveLength(2);
    expect(screen.getAllByText('Team C')).toHaveLength(2);
    expect(screen.getAllByText('Team D')).toHaveLength(2);
  });

  it('renders participants table with seeds and seeding description', () => {
    render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Initial seeding based on GW19 league standings')).toBeInTheDocument();
    expect(screen.getByText('Manager A')).toBeInTheDocument();
    expect(screen.getByText('Manager B')).toBeInTheDocument();
  });

  it('shows completed badge when tournament finished', () => {
    const completedTournament = { ...mockTournament, status: 'completed' as const };
    render(<BracketView tournament={completedTournament} isAuthenticated={true} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows updating indicator when isRefreshing is true', () => {
    render(<BracketView tournament={mockTournament} isRefreshing={true} isAuthenticated={true} />);

    expect(screen.getByText('Updating...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner has role="status"
  });

  it('does not show updating indicator when isRefreshing is false', () => {
    render(<BracketView tournament={mockTournament} isRefreshing={false} isAuthenticated={true} />);

    expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
  });

  it('does not show updating indicator by default (prop not provided)', () => {
    render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

    expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
  });

  describe('Team Preview for Unauthenticated Users', () => {
    it('shows team search overlay for unauthenticated users', () => {
      render(<BracketView tournament={mockTournament} isAuthenticated={false} />);

      expect(screen.getByText('Find Your Team')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Find your team...')).toBeInTheDocument();
    });

    it('does not show team search overlay for authenticated users', () => {
      render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

      expect(screen.queryByText('Find Your Team')).not.toBeInTheDocument();
    });

    it('does not show Your Matches section for authenticated users', () => {
      render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

      // The YourMatchesSection heading should not appear for authenticated users
      expect(screen.queryByText('Your Matches')).not.toBeInTheDocument();
    });

    it('shows Your Matches section after team is selected', async () => {
      const user = userEvent.setup();
      render(<BracketView tournament={mockTournament} isAuthenticated={false} />);

      // Search for a team
      const searchInput = screen.getByPlaceholderText('Find your team...');
      await user.type(searchInput, 'Team A');

      // Wait for debounce (300ms) and results to appear
      // The "Manager A" text should appear in the search results listbox
      await waitFor(
        () => {
          const listbox = screen.queryByRole('listbox');
          expect(listbox).toBeInTheDocument();
          expect(screen.getByRole('button', { name: 'This is me' })).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Click "This is me" button
      const confirmButton = screen.getByRole('button', { name: 'This is me' });
      await user.click(confirmButton);

      // Search overlay should fade out (wait for animation to complete)
      await waitFor(
        () => {
          expect(screen.queryByText('Find Your Team')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Your Matches section should appear
      expect(screen.getByText('Your Matches')).toBeInTheDocument();

      // Selected team header should show
      expect(screen.getByText('Viewing as')).toBeInTheDocument();
      // Team A appears in multiple places (header, bracket, table), check for "Viewing as" context
      const viewingAsSection = screen.getByText('Viewing as').parentElement;
      expect(viewingAsSection).toHaveTextContent('Team A');
    });

    it('shows signup CTA after team is selected', async () => {
      const user = userEvent.setup();
      const mockOnClaimTeam = vi.fn();

      render(
        <BracketView
          tournament={mockTournament}
          isAuthenticated={false}
          onClaimTeam={mockOnClaimTeam}
        />
      );

      // Search for and select a team
      const searchInput = screen.getByPlaceholderText('Find your team...');
      await user.type(searchInput, 'Team B');

      // Wait for debounce and results
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'This is me' })).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const confirmButton = screen.getByRole('button', { name: 'This is me' });
      await user.click(confirmButton);

      // Signup CTA should appear
      expect(screen.getByText('Sign up to get notified when results are in')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign up and claim team' })).toBeInTheDocument();
    });

    it('calls onClaimTeam with selected team ID when signup button clicked', async () => {
      const user = userEvent.setup();
      const mockOnClaimTeam = vi.fn();

      render(
        <BracketView
          tournament={mockTournament}
          isAuthenticated={false}
          onClaimTeam={mockOnClaimTeam}
        />
      );

      // Search for and select Team C (fplTeamId: 3)
      const searchInput = screen.getByPlaceholderText('Find your team...');
      await user.type(searchInput, 'Team C');

      // Wait for debounce and results
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'This is me' })).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const confirmButton = screen.getByRole('button', { name: 'This is me' });
      await user.click(confirmButton);

      // Click signup button
      const signupButton = screen.getByRole('button', { name: 'Sign up and claim team' });
      await user.click(signupButton);

      expect(mockOnClaimTeam).toHaveBeenCalledWith(3);
    });

    it('allows changing team after initial selection', async () => {
      const user = userEvent.setup();

      render(<BracketView tournament={mockTournament} isAuthenticated={false} />);

      // Select Team A first
      const searchInput = screen.getByPlaceholderText('Find your team...');
      await user.type(searchInput, 'Team A');

      // Wait for debounce and results
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'This is me' })).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      await user.click(screen.getByRole('button', { name: 'This is me' }));

      // Verify Team A is selected
      expect(screen.getByText('Viewing as').parentElement).toHaveTextContent('Team A');

      // Click "Change team" button
      const changeTeamButton = screen.getByRole('button', { name: 'Change team' });
      await user.click(changeTeamButton);

      // Search overlay should reappear
      expect(screen.getByText('Find Your Team')).toBeInTheDocument();
    });

    it('closes search overlay when close button clicked without selecting team', async () => {
      const user = userEvent.setup();

      render(<BracketView tournament={mockTournament} isAuthenticated={false} />);

      // Verify search overlay is shown
      expect(screen.getByText('Find Your Team')).toBeInTheDocument();

      // Click close button
      const closeButton = screen.getByRole('button', { name: 'Close search' });
      await user.click(closeButton);

      // Overlay should fade out (wait for animation to complete)
      await waitFor(
        () => {
          expect(screen.queryByText('Find Your Team')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Should show placeholder for selecting a team
      expect(screen.getByText('Select your team to see your matches')).toBeInTheDocument();

      // "Find your team" button should allow reopening
      const findTeamButton = screen.getByRole('button', { name: 'Find your team' });
      await user.click(findTeamButton);

      // Overlay should reappear
      expect(screen.getByText('Find Your Team')).toBeInTheDocument();
    });

    it('builds correct matches for selected team', async () => {
      const user = userEvent.setup();

      // Create a tournament with completed and live matches
      const tournamentWithMatches: Tournament = {
        ...mockTournament,
        currentGameweek: 20,
        rounds: [
          {
            roundNumber: 1,
            name: 'Semi-Finals',
            gameweek: 20,
            isComplete: false,
            matches: [
              {
                id: 'r1-m1',
                player1: { fplTeamId: 1, seed: 1, score: 65 },
                player2: { fplTeamId: 4, seed: 4, score: 58 },
                winnerId: null,
                isBye: false,
              },
              {
                id: 'r1-m2',
                player1: { fplTeamId: 2, seed: 2, score: 72 },
                player2: { fplTeamId: 3, seed: 3, score: 60 },
                winnerId: null,
                isBye: false,
              },
            ],
          },
          {
            roundNumber: 2,
            name: 'Final',
            gameweek: 21,
            isComplete: false,
            matches: [
              { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
            ],
          },
        ],
      };

      render(<BracketView tournament={tournamentWithMatches} isAuthenticated={false} />);

      // Select Team A (fplTeamId: 1)
      const searchInput = screen.getByPlaceholderText('Find your team...');
      await user.type(searchInput, 'Team A');

      // Wait for debounce and results
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'This is me' })).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      await user.click(screen.getByRole('button', { name: 'This is me' }));

      // Should show the match card with scores
      // The scores appear both in the bracket and the YourMatchesSection
      // Verify that YourMatchesSection is rendered with match cards
      await waitFor(() => {
        // YourMatchesSection should show the match
        expect(screen.getByText('Your Matches')).toBeInTheDocument();
        // There should be multiple instances of the scores (bracket + match card)
        expect(screen.getAllByText('65').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('58').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('does not show signup CTA when onClaimTeam is not provided', async () => {
      const user = userEvent.setup();

      render(
        <BracketView
          tournament={mockTournament}
          isAuthenticated={false}
          // No onClaimTeam prop
        />
      );

      // Select a team
      const searchInput = screen.getByPlaceholderText('Find your team...');
      await user.type(searchInput, 'Team A');

      // Wait for debounce and results
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'This is me' })).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      await user.click(screen.getByRole('button', { name: 'This is me' }));

      // Signup CTA should NOT appear
      expect(screen.queryByText('Sign up to get notified when results are in')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Sign up and claim team' })).not.toBeInTheDocument();
    });

    it('does not show Your Matches section when tournament has no rounds', () => {
      const emptyTournament: Tournament = {
        ...mockTournament,
        rounds: [],
      };

      render(<BracketView tournament={emptyTournament} isAuthenticated={false} />);

      // Should show the "Bracket will appear" message instead
      expect(screen.getByText('Bracket will appear when the tournament starts.')).toBeInTheDocument();

      // Should NOT show team search overlay (no rounds = no matches to preview)
      expect(screen.queryByText('Find Your Team')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User Matches', () => {
    it('shows Your Matches section for authenticated users who are participants', () => {
      render(
        <BracketView
          tournament={mockTournament}
          isAuthenticated={true}
          userFplTeamId={1}
        />
      );

      // Should show Your Matches section
      expect(screen.getByText('Your Matches')).toBeInTheDocument();

      // Should show "Playing as" header with team name
      expect(screen.getByText('Playing as')).toBeInTheDocument();
      // Team A appears multiple times (header, bracket, table)
      const playingAsSection = screen.getByText('Playing as').parentElement;
      expect(playingAsSection).toHaveTextContent('Team A');
    });

    it('does not show Your Matches section for authenticated users not in tournament', () => {
      render(
        <BracketView
          tournament={mockTournament}
          isAuthenticated={true}
          userFplTeamId={999} // Not a participant
        />
      );

      // Should NOT show Your Matches section (user is not a participant)
      expect(screen.queryByText('Your Matches')).not.toBeInTheDocument();
      expect(screen.queryByText('Playing as')).not.toBeInTheDocument();

      // Should also NOT show Find Your Team (user is authenticated)
      expect(screen.queryByText('Find Your Team')).not.toBeInTheDocument();
    });

    it('does not show Your Matches section when userFplTeamId is null', () => {
      render(
        <BracketView
          tournament={mockTournament}
          isAuthenticated={true}
          userFplTeamId={null}
        />
      );

      // Should NOT show Your Matches section
      expect(screen.queryByText('Your Matches')).not.toBeInTheDocument();
      expect(screen.queryByText('Playing as')).not.toBeInTheDocument();
    });

    it('does not show signup CTA for authenticated users', () => {
      const mockOnClaimTeam = vi.fn();

      render(
        <BracketView
          tournament={mockTournament}
          isAuthenticated={true}
          userFplTeamId={1}
          onClaimTeam={mockOnClaimTeam}
        />
      );

      // Should show matches but NOT signup CTA
      expect(screen.getByText('Your Matches')).toBeInTheDocument();
      expect(screen.queryByText('Sign up to get notified when results are in')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Sign up and claim team' })).not.toBeInTheDocument();
    });

    it('builds correct matches for authenticated user', () => {
      const tournamentWithScores: Tournament = {
        ...mockTournament,
        currentGameweek: 20,
        rounds: [
          {
            roundNumber: 1,
            name: 'Semi-Finals',
            gameweek: 20,
            isComplete: false,
            matches: [
              {
                id: 'r1-m1',
                player1: { fplTeamId: 1, seed: 1, score: 75 },
                player2: { fplTeamId: 4, seed: 4, score: 62 },
                winnerId: null,
                isBye: false,
              },
              {
                id: 'r1-m2',
                player1: { fplTeamId: 2, seed: 2, score: 68 },
                player2: { fplTeamId: 3, seed: 3, score: 55 },
                winnerId: null,
                isBye: false,
              },
            ],
          },
          {
            roundNumber: 2,
            name: 'Final',
            gameweek: 21,
            isComplete: false,
            matches: [
              { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
            ],
          },
        ],
      };

      render(
        <BracketView
          tournament={tournamentWithScores}
          isAuthenticated={true}
          userFplTeamId={1}
        />
      );

      // Should show the user's match with scores
      expect(screen.getByText('Your Matches')).toBeInTheDocument();
      // Scores should appear in the matches section
      expect(screen.getAllByText('75').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('62').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Share functionality', () => {
    it('renders share button in header', () => {
      render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

      expect(screen.getByRole('button', { name: 'Share tournament' })).toBeInTheDocument();
    });

    it('opens share dialog when share button clicked', async () => {
      const user = userEvent.setup();
      render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

      // Dialog should not be visible initially
      expect(screen.queryByTestId('share-dialog')).not.toBeInTheDocument();

      // Click share button
      await user.click(screen.getByRole('button', { name: 'Share tournament' }));

      // Dialog should be visible
      expect(screen.getByTestId('share-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('share-league-id')).toHaveTextContent('123');
      expect(screen.getByTestId('share-league-name')).toHaveTextContent('Test League');
      expect(screen.getByTestId('share-round-name')).toHaveTextContent('Semi-Finals');
      expect(screen.getByTestId('share-participant-count')).toHaveTextContent('4');
    });

    it('closes share dialog when close button clicked', async () => {
      const user = userEvent.setup();
      render(<BracketView tournament={mockTournament} isAuthenticated={true} />);

      // Open dialog
      await user.click(screen.getByRole('button', { name: 'Share tournament' }));
      expect(screen.getByTestId('share-dialog')).toBeInTheDocument();

      // Close dialog
      await user.click(screen.getByRole('button', { name: 'Close' }));

      // Dialog should be closed
      expect(screen.queryByTestId('share-dialog')).not.toBeInTheDocument();
    });
  });
});
