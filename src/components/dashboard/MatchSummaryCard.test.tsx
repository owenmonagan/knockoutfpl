import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchSummaryCard } from './MatchSummaryCard';
import { getFplTeamUrl } from '@/lib/fpl-urls';

describe('MatchSummaryCard', () => {
  describe('Team Avatars', () => {
    it('should display initials for your team', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="Haaland's Hairband"
          opponentTeamName="Salah's Legacy"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText('HH')).toBeInTheDocument();
    });

    it('should display initials for opponent team', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="Haaland's Hairband"
          opponentTeamName="Salah's Legacy"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText('SL')).toBeInTheDocument();
    });

    it('should display TBD for missing opponent', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="Haaland's Hairband"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
        />
      );

      // TBD appears in avatar and label
      const tbdElements = screen.getAllByText('TBD');
      expect(tbdElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Card Layout', () => {
    it('should show status badge in header for live match', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Their Team"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText(/live/i)).toBeInTheDocument();
    });

    it('should show point differential badge when winning', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Their Team"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={78}
          theirScore={62}
        />
      );

      expect(screen.getByText(/\+16/)).toBeInTheDocument();
    });

    it('should show VS for upcoming match', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          opponentTeamName="Their Team"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
        />
      );

      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });

  describe('Live Match', () => {
    it('should render live match with opponent name', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText("Dave's Dumpster Fire")).toBeInTheDocument();
    });

    it('should display league name and round', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText(/Work League/)).toBeInTheDocument();
      expect(screen.getByText(/Semi-finals/)).toBeInTheDocument();
    });

    it('should show scores for live match', () => {
      const { container } = render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      // Scores are in the same container element
      expect(container.textContent).toContain('52');
      expect(container.textContent).toContain('48');
    });

    it('should show "Winning" in footer when ahead', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText(/Winning/)).toBeInTheDocument();
    });

    it('should show "Losing" in footer when behind', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={48}
          theirScore={52}
        />
      );

      expect(screen.getByText(/Losing/)).toBeInTheDocument();
    });

    it('should show "Tied" when scores are equal', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={50}
          theirScore={50}
        />
      );

      // Tied appears in badge and footer
      const tiedElements = screen.getAllByText(/Tied/);
      expect(tiedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should have primary color border for live match', () => {
      const { container } = render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      const card = container.querySelector('.border-primary');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Upcoming Match', () => {
    it('should render upcoming match with opponent name', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
        />
      );

      expect(screen.getByText("Dave's Dumpster Fire")).toBeInTheDocument();
    });

    it('should show gameweek', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
        />
      );

      expect(screen.getByText(/GW14/)).toBeInTheDocument();
    });

    it('should have dashed border for upcoming match', () => {
      const { container } = render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
        />
      );

      const card = container.querySelector('.border-dashed');
      expect(card).toBeInTheDocument();
    });

    it('should show "Upcoming" status badge', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
        />
      );

      expect(screen.getByText(/Upcoming/)).toBeInTheDocument();
    });
  });

  describe('Finished Match (Won)', () => {
    it('should show "Won" badge for won match', () => {
      render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      expect(screen.getByText('Won')).toBeInTheDocument();
    });

    it('should show "Advanced" in footer for won match', () => {
      render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      expect(screen.getByText(/Advanced/)).toBeInTheDocument();
    });

    it('should show final scores', () => {
      const { container } = render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      // Scores are in the same container element
      expect(container.textContent).toContain('67');
      expect(container.textContent).toContain('52');
    });

    it('should show "Finished" status badge', () => {
      render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      expect(screen.getByText(/Finished/)).toBeInTheDocument();
    });
  });

  describe('Finished Match (Lost)', () => {
    it('should show "Lost" badge for lost match', () => {
      render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={48}
          theirScore={52}
          result="lost"
        />
      );

      expect(screen.getByText('Lost')).toBeInTheDocument();
    });

    it('should show "Eliminated" in footer for lost match', () => {
      render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={48}
          theirScore={52}
          result="lost"
        />
      );

      expect(screen.getByText(/Eliminated/)).toBeInTheDocument();
    });

    it('should have muted/dimmed styling for lost match', () => {
      const { container } = render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={48}
          theirScore={52}
          result="lost"
        />
      );

      // Check for opacity/muted styling
      const card = container.querySelector('.opacity-90, [class*="opacity"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Click Behavior', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('article');
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have cursor-pointer when onClick is provided', () => {
      const { container } = render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });

    it('should show "Details" link when clickable', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
          onClick={() => {}}
        />
      );

      expect(screen.getByText(/Details/)).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('should have hover transform effect', () => {
      const { container } = render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
          onClick={() => {}}
        />
      );

      // Check for hover transform class
      const card = container.querySelector('[class*="hover:-translate-y"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have article role', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null scores for live match gracefully', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={null}
          theirScore={null}
        />
      );

      // Should still render without crashing
      expect(screen.getByText("Dave's Dumpster Fire")).toBeInTheDocument();
    });

    it('should handle missing optional props for upcoming match', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
        />
      );

      // Should still render without crashing
      expect(screen.getByText("Dave's Dumpster Fire")).toBeInTheDocument();
    });

    it('should show TBD when opponent name is undefined', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          leagueName="Work League"
          roundName="Finals"
          gameweek={15}
        />
      );

      // TBD appears as avatar text and as label
      const tbdElements = screen.getAllByText('TBD');
      expect(tbdElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should show opponent TBD info in footer when TBD and upcoming', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          yourFplTeamId={12345}
          leagueName="Work League"
          roundName="Finals"
          gameweek={15}
        />
      );

      // gameweek - 1 = 14
      expect(screen.getByText(/Opponent TBD after GW14/)).toBeInTheDocument();
    });
  });

  describe('FPL Team Links', () => {
    it('renders clickable links for both teams in live match', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          yourFplTeamId={12345}
          opponentTeamName="Their Team"
          opponentFplTeamId={67890}
          leagueName="Test League"
          roundName="Round 1"
          yourScore={50}
          theirScore={40}
          gameweek={15}
        />
      );

      const yourLink = screen.getByRole('link', { name: /you/i });
      const opponentLink = screen.getByRole('link', { name: /their team/i });

      // Live match has roundStarted = true, so uses event URL
      expect(yourLink).toHaveAttribute('href', getFplTeamUrl(12345, 15, true));
      expect(opponentLink).toHaveAttribute('href', getFplTeamUrl(67890, 15, true));
      expect(yourLink).toHaveAttribute('target', '_blank');
      expect(opponentLink).toHaveAttribute('target', '_blank');
    });

    it('renders clickable links for both teams in finished match', () => {
      render(
        <MatchSummaryCard
          type="finished"
          yourTeamName="My Team"
          yourFplTeamId={12345}
          opponentTeamName="Their Team"
          opponentFplTeamId={67890}
          leagueName="Test League"
          roundName="Round 1"
          yourScore={60}
          theirScore={55}
          result="won"
          gameweek={15}
        />
      );

      const yourLink = screen.getByRole('link', { name: /you/i });
      const opponentLink = screen.getByRole('link', { name: /their team/i });

      // Finished match has roundStarted = true, so uses event URL
      expect(yourLink).toHaveAttribute('href', getFplTeamUrl(12345, 15, true));
      expect(opponentLink).toHaveAttribute('href', getFplTeamUrl(67890, 15, true));
      expect(yourLink).toHaveAttribute('target', '_blank');
      expect(opponentLink).toHaveAttribute('target', '_blank');
    });

    it('renders clickable links for both teams in upcoming match with history URL', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          yourFplTeamId={12345}
          opponentTeamName="Their Team"
          opponentFplTeamId={67890}
          leagueName="Test League"
          roundName="Round 2"
          gameweek={16}
        />
      );

      const yourLink = screen.getByRole('link', { name: /you/i });
      const opponentLink = screen.getByRole('link', { name: /their team/i });

      // Upcoming match has roundStarted = false, so uses history URL
      expect(yourLink).toHaveAttribute('href', getFplTeamUrl(12345, 16, false));
      expect(opponentLink).toHaveAttribute('href', getFplTeamUrl(67890, 16, false));
      expect(yourLink).toHaveAttribute('target', '_blank');
      expect(opponentLink).toHaveAttribute('target', '_blank');
    });

    it('does not render link for TBD opponent', () => {
      render(
        <MatchSummaryCard
          type="upcoming"
          yourTeamName="My Team"
          yourFplTeamId={12345}
          // No opponentTeamName or opponentFplTeamId
          leagueName="Test League"
          roundName="Round 2"
          gameweek={16}
        />
      );

      // Your team should still have a link
      expect(screen.getByRole('link', { name: /you/i })).toBeInTheDocument();

      // TBD should NOT be a link
      expect(screen.queryByRole('link', { name: /tbd/i })).not.toBeInTheDocument();
    });

    it('does not call card onClick when team link is clicked', () => {
      const handleCardClick = vi.fn();

      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          yourFplTeamId={12345}
          opponentTeamName="Their Team"
          opponentFplTeamId={67890}
          leagueName="Test League"
          roundName="Round 1"
          yourScore={50}
          theirScore={40}
          gameweek={15}
          onClick={handleCardClick}
        />
      );

      const yourLink = screen.getByRole('link', { name: /you/i });
      fireEvent.click(yourLink);

      // Card onClick should NOT have been called due to stopPropagation
      expect(handleCardClick).not.toHaveBeenCalled();
    });

    it('has rel="noopener noreferrer" for security', () => {
      render(
        <MatchSummaryCard
          type="live"
          yourTeamName="My Team"
          yourFplTeamId={12345}
          opponentTeamName="Their Team"
          opponentFplTeamId={67890}
          leagueName="Test League"
          roundName="Round 1"
          yourScore={50}
          theirScore={40}
          gameweek={15}
        />
      );

      const yourLink = screen.getByRole('link', { name: /you/i });
      const opponentLink = screen.getByRole('link', { name: /their team/i });

      expect(yourLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(opponentLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
