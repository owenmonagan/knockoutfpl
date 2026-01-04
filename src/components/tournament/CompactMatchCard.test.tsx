// src/components/tournament/CompactMatchCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CompactMatchCard } from './CompactMatchCard';
import type { Match, Participant } from '../../types/tournament';

describe('CompactMatchCard', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
  ];

  const mockMatch: Match = {
    id: 'r1-m1',
    player1: { fplTeamId: 1, seed: 1, score: 65 },
    player2: { fplTeamId: 2, seed: 2, score: 58 },
    winnerId: 1,
    isBye: false,
  };

  it('renders both player names', () => {
    render(<CompactMatchCard match={mockMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('renders seeds when no scores available', () => {
    const matchWithoutScores: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 1, score: null },
      player2: { fplTeamId: 2, seed: 2, score: null },
      winnerId: null,
      isBye: false,
    };
    render(<CompactMatchCard match={matchWithoutScores} participants={mockParticipants} roundStarted={true} gameweek={10} />);

    expect(screen.getByText('(1)')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('hides seeds when scores are available and round started', () => {
    render(<CompactMatchCard match={mockMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

    expect(screen.queryByText('(1)')).not.toBeInTheDocument();
    expect(screen.queryByText('(2)')).not.toBeInTheDocument();
  });

  it('renders scores when available and round started', () => {
    render(<CompactMatchCard match={mockMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
  });

  it('shows seeds instead of scores when round has not started', () => {
    const matchWithZeroScores: Match = {
      id: 'r4-m1',
      player1: { fplTeamId: 1, seed: 1, score: 0 },
      player2: { fplTeamId: 2, seed: 2, score: 0 },
      winnerId: null,
      isBye: false,
    };
    render(<CompactMatchCard match={matchWithZeroScores} participants={mockParticipants} roundStarted={false} gameweek={15} />);

    // Should show seeds, not scores
    expect(screen.getByText('(1)')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('highlights winner', () => {
    render(<CompactMatchCard match={mockMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

    const winnerRow = screen.getByText('Team A').closest('[data-winner]');
    expect(winnerRow).toHaveAttribute('data-winner', 'true');
  });

  it('shows BYE for bye matches', () => {
    const byeMatch: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 1, score: null },
      player2: null,
      winnerId: 1,
      isBye: true,
    };
    render(<CompactMatchCard match={byeMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('BYE')).toBeInTheDocument();
  });

  it('shows TBD for empty slots', () => {
    const emptyMatch: Match = {
      id: 'r2-m1',
      player1: null,
      player2: null,
      winnerId: null,
      isBye: false,
    };
    render(<CompactMatchCard match={emptyMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

    expect(screen.getAllByText('TBD')).toHaveLength(2);
  });

  describe('clickable player rows', () => {
    it('links to FPL gameweek page when round has started', () => {
      render(<CompactMatchCard match={mockMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      // Player 1 (fplTeamId: 1) should link to gameweek 10
      expect(links[0]).toHaveAttribute('href', 'https://fantasy.premierleague.com/entry/1/event/10');
      // Player 2 (fplTeamId: 2) should link to gameweek 10
      expect(links[1]).toHaveAttribute('href', 'https://fantasy.premierleague.com/entry/2/event/10');
    });

    it('links to FPL history page when round has not started', () => {
      const matchWithoutScores: Match = {
        id: 'r1-m1',
        player1: { fplTeamId: 1, seed: 1, score: null },
        player2: { fplTeamId: 2, seed: 2, score: null },
        winnerId: null,
        isBye: false,
      };
      render(<CompactMatchCard match={matchWithoutScores} participants={mockParticipants} roundStarted={false} gameweek={15} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      // Both players should link to history page
      expect(links[0]).toHaveAttribute('href', 'https://fantasy.premierleague.com/entry/1/history');
      expect(links[1]).toHaveAttribute('href', 'https://fantasy.premierleague.com/entry/2/history');
    });

    it('opens links in new tab with security attributes', () => {
      render(<CompactMatchCard match={mockMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('does not render links for TBD slots', () => {
      const emptyMatch: Match = {
        id: 'r2-m1',
        player1: null,
        player2: null,
        winnerId: null,
        isBye: false,
      };
      render(<CompactMatchCard match={emptyMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('does not render link for BYE slot', () => {
      const byeMatch: Match = {
        id: 'r1-m1',
        player1: { fplTeamId: 1, seed: 1, score: null },
        player2: null,
        winnerId: 1,
        isBye: true,
      };
      render(<CompactMatchCard match={byeMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

      // Only player1 should have a link, BYE slot should not
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', 'https://fantasy.premierleague.com/entry/1/event/10');
    });

    it('player row links have cursor-pointer class', () => {
      render(<CompactMatchCard match={mockMatch} participants={mockParticipants} roundStarted={true} gameweek={10} />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Claim button', () => {
    it('shows claim button when user is not authenticated', () => {
      const handleClaim = vi.fn();

      render(
        <CompactMatchCard
          match={mockMatch}
          participants={mockParticipants}
          roundStarted={false}
          gameweek={1}
          isAuthenticated={false}
          onClaimTeam={handleClaim}
        />
      );

      // Should show claim buttons for both players
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('hides claim button when user is authenticated', () => {
      const handleClaim = vi.fn();

      render(
        <CompactMatchCard
          match={mockMatch}
          participants={mockParticipants}
          roundStarted={false}
          gameweek={1}
          isAuthenticated={true}
          onClaimTeam={handleClaim}
        />
      );

      // Should not show any claim buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not show claim button for TBD slots', () => {
      const matchWithTBD: Match = {
        id: 'r2-m1',
        player1: { fplTeamId: 1, seed: 1, score: null },
        player2: null,
        winnerId: null,
        isBye: false,
      };

      render(
        <CompactMatchCard
          match={matchWithTBD}
          participants={mockParticipants}
          roundStarted={false}
          gameweek={1}
          isAuthenticated={false}
          onClaimTeam={vi.fn()}
        />
      );

      // Only one claim button for player1
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('does not show claim button when onClaimTeam not provided', () => {
      render(
        <CompactMatchCard
          match={mockMatch}
          participants={mockParticipants}
          roundStarted={false}
          gameweek={1}
          isAuthenticated={false}
        />
      );

      // Should not show any claim buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
