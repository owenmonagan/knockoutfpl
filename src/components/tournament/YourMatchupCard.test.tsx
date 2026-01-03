import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { YourMatchupCard } from './YourMatchupCard';

describe('YourMatchupCard', () => {
  const baseProps = {
    roundName: 'Quarter-Finals',
    gameweek: 24,
    yourTeamName: 'O-win FC',
    yourManagerName: 'Owen Monagan',
    yourSeed: 142,
    yourScore: null,
    opponentTeamName: 'Klopps & Robbers',
    opponentManagerName: 'Sarah Jenkins',
    opponentSeed: 4005,
    opponentScore: null,
    matchType: 'upcoming' as const,
  };

  describe('Header Section', () => {
    it('renders "Your Matchup" title', () => {
      render(<YourMatchupCard {...baseProps} />);
      expect(screen.getByText('Your Matchup')).toBeInTheDocument();
    });

    it('renders gameweek information', () => {
      render(<YourMatchupCard {...baseProps} />);
      expect(screen.getByText(/GW24/)).toBeInTheDocument();
    });

    it('renders deadline when provided', () => {
      render(<YourMatchupCard {...baseProps} deadline="Sat 11:00" />);
      expect(screen.getByText('GW24 • Sat 11:00')).toBeInTheDocument();
    });

    it('shows "Finished" for completed matches', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="finished"
          result="won"
          yourScore={72}
          opponentScore={65}
        />
      );
      expect(screen.getByText('GW24 • Finished')).toBeInTheDocument();
    });

    it('renders decorative trophy icon', () => {
      render(<YourMatchupCard {...baseProps} />);
      // Trophy icon should be rendered but hidden from accessibility tree
      const trophy = document.querySelector('[aria-hidden="true"]');
      expect(trophy).toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('shows "Round X Upcoming" badge for upcoming matches', () => {
      render(<YourMatchupCard {...baseProps} matchType="upcoming" />);
      expect(screen.getByText('Quarter-Finals Upcoming')).toBeInTheDocument();
    });

    it('shows "Round X Active" badge with pulse for live matches', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="live"
          yourScore={72}
          opponentScore={65}
        />
      );
      expect(screen.getByText('Quarter-Finals Active')).toBeInTheDocument();
      // Check for pulse indicator
      const badge = screen.getByText('Quarter-Finals Active').closest('div');
      expect(badge?.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows "Round X Advanced" badge when won', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="finished"
          result="won"
          yourScore={72}
          opponentScore={65}
        />
      );
      expect(screen.getByText('Quarter-Finals Advanced')).toBeInTheDocument();
    });

    it('shows "Round X Eliminated" badge when lost', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="finished"
          result="lost"
          yourScore={48}
          opponentScore={67}
        />
      );
      expect(screen.getByText('Quarter-Finals Eliminated')).toBeInTheDocument();
    });
  });

  describe('Team Display', () => {
    it('renders your team name in primary color', () => {
      render(<YourMatchupCard {...baseProps} />);
      const yourTeam = screen.getByText('O-win FC');
      expect(yourTeam).toHaveClass('text-primary');
    });

    it('renders your manager name and seed', () => {
      render(<YourMatchupCard {...baseProps} />);
      expect(screen.getByText(/Owen Monagan.*Seed #142/)).toBeInTheDocument();
    });

    it('renders opponent team name without primary color', () => {
      render(<YourMatchupCard {...baseProps} />);
      const opponentTeam = screen.getByText('Klopps & Robbers');
      expect(opponentTeam).not.toHaveClass('text-primary');
      expect(opponentTeam).toHaveClass('text-foreground');
    });

    it('renders opponent manager name and seed', () => {
      render(<YourMatchupCard {...baseProps} />);
      expect(screen.getByText(/Sarah Jenkins.*Seed #4,?005/)).toBeInTheDocument();
    });

    it('shows "Opponent TBD" when opponent not set', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          opponentTeamName={undefined}
          opponentManagerName={undefined}
          opponentSeed={undefined}
        />
      );
      expect(screen.getByText('Opponent TBD')).toBeInTheDocument();
    });

    it('does not render avatars (design spec)', () => {
      render(<YourMatchupCard {...baseProps} />);
      // Old design had initials in avatars, verify they're gone
      expect(screen.queryByText('OF')).not.toBeInTheDocument(); // O-win FC initials
      expect(screen.queryByText('K&')).not.toBeInTheDocument(); // Klopps & Robbers initials
    });

    it('does not render VS divider (design spec)', () => {
      render(<YourMatchupCard {...baseProps} />);
      expect(screen.queryByText('VS')).not.toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('does not show scores for upcoming matches', () => {
      render(<YourMatchupCard {...baseProps} matchType="upcoming" />);
      expect(screen.queryByText('72')).not.toBeInTheDocument();
      expect(screen.queryByText('65')).not.toBeInTheDocument();
    });

    it('shows scores for live matches', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="live"
          yourScore={72}
          opponentScore={65}
        />
      );
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
    });

    it('shows scores for finished matches', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="finished"
          result="won"
          yourScore={72}
          opponentScore={65}
        />
      );
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
    });

    it('mutes loser score when you won', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="finished"
          result="won"
          yourScore={72}
          opponentScore={65}
        />
      );
      const yourScore = screen.getByText('72');
      const opponentScore = screen.getByText('65');

      expect(yourScore).not.toHaveClass('text-muted-foreground');
      expect(opponentScore).toHaveClass('text-muted-foreground');
    });

    it('mutes loser score when you lost', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="finished"
          result="lost"
          yourScore={48}
          opponentScore={67}
        />
      );
      const yourScore = screen.getByText('48');
      const opponentScore = screen.getByText('67');

      expect(yourScore).toHaveClass('text-muted-foreground');
      expect(opponentScore).not.toHaveClass('text-muted-foreground');
    });

    it('does not mute scores during live match', () => {
      render(
        <YourMatchupCard
          {...baseProps}
          matchType="live"
          yourScore={72}
          opponentScore={65}
        />
      );
      const yourScore = screen.getByText('72');
      const opponentScore = screen.getByText('65');

      expect(yourScore).not.toHaveClass('text-muted-foreground');
      expect(opponentScore).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('Action Buttons', () => {
    it('renders View Match Details button when callback provided', () => {
      const onViewDetails = vi.fn();
      render(<YourMatchupCard {...baseProps} onViewDetails={onViewDetails} />);

      const button = screen.getByRole('button', { name: 'View Match Details' });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('renders Analyze Opponent button when callback provided', () => {
      const onAnalyzeOpponent = vi.fn();
      render(<YourMatchupCard {...baseProps} onAnalyzeOpponent={onAnalyzeOpponent} />);

      const button = screen.getByRole('button', { name: 'Analyze Opponent' });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(onAnalyzeOpponent).toHaveBeenCalledTimes(1);
    });

    it('renders both buttons when both callbacks provided', () => {
      const onViewDetails = vi.fn();
      const onAnalyzeOpponent = vi.fn();
      render(
        <YourMatchupCard
          {...baseProps}
          onViewDetails={onViewDetails}
          onAnalyzeOpponent={onAnalyzeOpponent}
        />
      );

      expect(screen.getByRole('button', { name: 'View Match Details' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Analyze Opponent' })).toBeInTheDocument();
    });

    it('does not render footer when no callbacks provided', () => {
      render(<YourMatchupCard {...baseProps} />);

      expect(screen.queryByRole('button', { name: 'View Match Details' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Analyze Opponent' })).not.toBeInTheDocument();
    });

    it('does not render Analyze Opponent button when opponent is TBD', () => {
      const onAnalyzeOpponent = vi.fn();
      render(
        <YourMatchupCard
          {...baseProps}
          opponentTeamName={undefined}
          onAnalyzeOpponent={onAnalyzeOpponent}
        />
      );

      expect(screen.queryByRole('button', { name: 'Analyze Opponent' })).not.toBeInTheDocument();
    });
  });

  describe('Inner Score Card', () => {
    it('renders inner card container with proper styling', () => {
      render(<YourMatchupCard {...baseProps} />);

      // The inner card should have background and border styling
      const innerCard = screen.getByText('O-win FC').closest('.bg-muted\\/30');
      expect(innerCard).toBeInTheDocument();
      expect(innerCard).toHaveClass('border');
      expect(innerCard).toHaveClass('rounded-lg');
    });
  });
});
