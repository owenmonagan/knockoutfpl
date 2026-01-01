import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchCard } from './MatchCard';

describe('MatchCard', () => {
  describe('Live Match', () => {
    it('should render live match with opponent name', () => {
      render(
        <MatchCard
          type="live"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText(/vs Dave's Dumpster Fire/)).toBeInTheDocument();
    });

    it('should display league name and round', () => {
      render(
        <MatchCard
          type="live"
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
      render(
        <MatchCard
          type="live"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText(/52 - 48/)).toBeInTheDocument();
    });

    it('should show "You\'re ahead" when winning', () => {
      render(
        <MatchCard
          type="live"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={52}
          theirScore={48}
        />
      );

      expect(screen.getByText(/You're ahead/)).toBeInTheDocument();
    });

    it('should show "You\'re behind" when losing', () => {
      render(
        <MatchCard
          type="live"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={48}
          theirScore={52}
        />
      );

      expect(screen.getByText(/You're behind/)).toBeInTheDocument();
    });

    it('should show "Tied" when scores are equal', () => {
      render(
        <MatchCard
          type="live"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={50}
          theirScore={50}
        />
      );

      expect(screen.getByText(/Tied/)).toBeInTheDocument();
    });

    it('should have primary color border for live match', () => {
      const { container } = render(
        <MatchCard
          type="live"
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
        <MatchCard
          type="upcoming"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
          startsIn="Saturday"
        />
      );

      expect(screen.getByText(/vs Dave's Dumpster Fire/)).toBeInTheDocument();
    });

    it('should show gameweek and start day', () => {
      render(
        <MatchCard
          type="upcoming"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
          startsIn="Saturday"
        />
      );

      expect(screen.getByText(/GW14/)).toBeInTheDocument();
      expect(screen.getByText(/Starts Saturday/)).toBeInTheDocument();
    });

    it('should have dashed border for upcoming match', () => {
      const { container } = render(
        <MatchCard
          type="upcoming"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          gameweek={14}
          startsIn="Saturday"
        />
      );

      const card = container.querySelector('.border-dashed');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Finished Match (Won)', () => {
    it('should show "Beat" prefix for won match', () => {
      render(
        <MatchCard
          type="finished"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      expect(screen.getByText(/Beat Dave's Dumpster Fire/)).toBeInTheDocument();
    });

    it('should show checkmark icon for won match', () => {
      const { container } = render(
        <MatchCard
          type="finished"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      // Look for the check icon or symbol
      expect(container.textContent).toMatch(/[✓]/);
    });

    it('should show final scores', () => {
      render(
        <MatchCard
          type="finished"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      expect(screen.getByText(/67 - 52/)).toBeInTheDocument();
    });

    it('should have green accent for won match', () => {
      const { container } = render(
        <MatchCard
          type="finished"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={67}
          theirScore={52}
          result="won"
        />
      );

      // Check for green left border
      const card = container.querySelector('.border-l-green-500, .border-l-primary');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Finished Match (Lost)', () => {
    it('should show "Lost to" prefix for lost match', () => {
      render(
        <MatchCard
          type="finished"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={48}
          theirScore={52}
          result="lost"
        />
      );

      expect(screen.getByText(/Lost to Dave's Dumpster Fire/)).toBeInTheDocument();
    });

    it('should show X icon for lost match', () => {
      const { container } = render(
        <MatchCard
          type="finished"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Quarter-finals"
          yourScore={48}
          theirScore={52}
          result="lost"
        />
      );

      // Look for the X icon or symbol
      expect(container.textContent).toMatch(/[✗]/);
    });

    it('should have muted/dimmed styling for lost match', () => {
      const { container } = render(
        <MatchCard
          type="finished"
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
        <MatchCard
          type="live"
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
        <MatchCard
          type="live"
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
  });

  describe('Hover Effects', () => {
    it('should have hover transform effect', () => {
      const { container } = render(
        <MatchCard
          type="live"
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
        <MatchCard
          type="live"
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
        <MatchCard
          type="live"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
          yourScore={null}
          theirScore={null}
        />
      );

      // Should still render without crashing
      expect(screen.getByText(/vs Dave's Dumpster Fire/)).toBeInTheDocument();
    });

    it('should handle missing optional props for upcoming match', () => {
      render(
        <MatchCard
          type="upcoming"
          opponentTeamName="Dave's Dumpster Fire"
          leagueName="Work League"
          roundName="Semi-finals"
        />
      );

      // Should still render without crashing
      expect(screen.getByText(/vs Dave's Dumpster Fire/)).toBeInTheDocument();
    });
  });
});
