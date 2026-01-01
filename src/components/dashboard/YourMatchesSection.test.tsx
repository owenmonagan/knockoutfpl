import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { YourMatchesSection } from './YourMatchesSection';
import type { MatchSummaryCardProps } from './MatchSummaryCard';

const mockLiveMatch: MatchSummaryCardProps = {
  type: 'live',
  opponentTeamName: "Dave's Dumpster Fire",
  leagueName: 'Work League',
  roundName: 'Semi-finals',
  yourScore: 52,
  theirScore: 48,
};

const mockUpcomingMatch: MatchSummaryCardProps = {
  type: 'upcoming',
  opponentTeamName: 'Uncle Terry XI',
  leagueName: 'Family Cup',
  roundName: 'Quarter-finals',
  gameweek: 15,
  startsIn: 'Saturday',
};

const mockFinishedWonMatch: MatchSummaryCardProps = {
  type: 'finished',
  opponentTeamName: 'John FC',
  leagueName: 'Office League',
  roundName: 'Round of 16',
  yourScore: 67,
  theirScore: 52,
  result: 'won',
};

const mockFinishedLostMatch: MatchSummaryCardProps = {
  type: 'finished',
  opponentTeamName: 'Mike United',
  leagueName: 'Friends League',
  roundName: 'Quarter-finals',
  yourScore: 48,
  theirScore: 55,
  result: 'lost',
};

describe('YourMatchesSection', () => {
  describe('Section Header', () => {
    it('should render section heading', () => {
      render(<YourMatchesSection matches={[mockLiveMatch]} />);

      expect(screen.getByRole('heading', { name: 'Your Matches' })).toBeInTheDocument();
    });

    it('should render sports_score material icon', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const icon = container.querySelector('.material-symbols-outlined');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('sports_score');
    });

    it('should have proper aria-labelledby for accessibility', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'your-matches-heading');
    });
  });

  describe('Gameweek Badge', () => {
    it('should show live badge when currentGameweek and isLive are provided', () => {
      render(
        <YourMatchesSection
          matches={[mockLiveMatch]}
          currentGameweek={34}
          isLive={true}
        />
      );

      expect(screen.getByText('GW 34 Live')).toBeInTheDocument();
    });

    it('should not show badge when isLive is false', () => {
      render(
        <YourMatchesSection
          matches={[mockLiveMatch]}
          currentGameweek={34}
          isLive={false}
        />
      );

      expect(screen.queryByText(/GW 34/)).not.toBeInTheDocument();
    });

    it('should not show badge when currentGameweek is not provided', () => {
      render(
        <YourMatchesSection
          matches={[mockLiveMatch]}
          isLive={true}
        />
      );

      expect(screen.queryByText(/GW.*Live/)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no matches', () => {
      render(<YourMatchesSection matches={[]} />);

      expect(
        screen.getByText('Your knockout journey starts here.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Pick a league and create your first tournament.')
      ).toBeInTheDocument();
    });

    it('should not show empty state when matches exist', () => {
      render(<YourMatchesSection matches={[mockLiveMatch]} />);

      expect(
        screen.queryByText('Your knockout journey starts here.')
      ).not.toBeInTheDocument();
    });
  });

  describe('Match Cards', () => {
    it('should render all match cards', () => {
      const matches = [mockLiveMatch, mockUpcomingMatch, mockFinishedWonMatch];
      render(<YourMatchesSection matches={matches} />);

      expect(screen.getByText(/vs Dave's Dumpster Fire/)).toBeInTheDocument();
      expect(screen.getByText(/vs Uncle Terry XI/)).toBeInTheDocument();
      expect(screen.getByText(/Beat John FC/)).toBeInTheDocument();
    });

    it('should render cards in the order provided', () => {
      const matches = [mockLiveMatch, mockUpcomingMatch];
      const { container } = render(<YourMatchesSection matches={matches} />);

      const cards = container.querySelectorAll('[role="article"]');
      expect(cards).toHaveLength(2);
    });
  });

  describe('Click Behavior', () => {
    it('should call onMatchClick with correct index when card is clicked', () => {
      const handleMatchClick = vi.fn();
      const matches = [mockLiveMatch, mockUpcomingMatch];

      render(
        <YourMatchesSection matches={matches} onMatchClick={handleMatchClick} />
      );

      const cards = screen.getAllByRole('article');
      fireEvent.click(cards[1]); // Click second card

      expect(handleMatchClick).toHaveBeenCalledWith(1);
    });

    it('should call both onMatchClick and individual onClick if both provided', () => {
      const handleMatchClick = vi.fn();
      const handleIndividualClick = vi.fn();

      const matchWithClick = {
        ...mockLiveMatch,
        onClick: handleIndividualClick,
      };

      render(
        <YourMatchesSection
          matches={[matchWithClick]}
          onMatchClick={handleMatchClick}
        />
      );

      const card = screen.getByRole('article');
      fireEvent.click(card);

      expect(handleMatchClick).toHaveBeenCalledWith(0);
      expect(handleIndividualClick).toHaveBeenCalled();
    });

    it('should call only individual onClick if onMatchClick not provided', () => {
      const handleIndividualClick = vi.fn();

      const matchWithClick = {
        ...mockLiveMatch,
        onClick: handleIndividualClick,
      };

      render(<YourMatchesSection matches={[matchWithClick]} />);

      const card = screen.getByRole('article');
      fireEvent.click(card);

      expect(handleIndividualClick).toHaveBeenCalled();
    });
  });

  describe('Layout and Styling', () => {
    it('should have hide-scrollbar class on scroll container', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const scrollContainer = container.querySelector('.hide-scrollbar');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have horizontal scroll classes on mobile', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have grid classes for desktop', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const gridContainer = container.querySelector('.md\\:grid');
      expect(gridContainer).toBeInTheDocument();

      expect(gridContainer).toHaveClass('md:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should have snap classes for horizontal scroll', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const scrollContainer = container.querySelector('.snap-x');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('snap-mandatory');
    });

    it('should have fixed width cards on mobile', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const cardWrapper = container.querySelector('.w-\\[280px\\]');
      expect(cardWrapper).toBeInTheDocument();
      expect(cardWrapper).toHaveClass('flex-shrink-0');
    });
  });

  describe('Different Match Types', () => {
    it('should render live match correctly', () => {
      render(<YourMatchesSection matches={[mockLiveMatch]} />);

      expect(screen.getByText(/vs Dave's Dumpster Fire/)).toBeInTheDocument();
      expect(screen.getByText(/52 - 48/)).toBeInTheDocument();
      expect(screen.getByText(/You're ahead/)).toBeInTheDocument();
    });

    it('should render upcoming match correctly', () => {
      render(<YourMatchesSection matches={[mockUpcomingMatch]} />);

      expect(screen.getByText(/vs Uncle Terry XI/)).toBeInTheDocument();
      expect(screen.getByText(/GW15/)).toBeInTheDocument();
      expect(screen.getByText(/Starts Saturday/)).toBeInTheDocument();
    });

    it('should render finished won match correctly', () => {
      render(<YourMatchesSection matches={[mockFinishedWonMatch]} />);

      expect(screen.getByText(/Beat John FC/)).toBeInTheDocument();
      expect(screen.getByText(/67 - 52/)).toBeInTheDocument();
    });

    it('should render finished lost match correctly', () => {
      render(<YourMatchesSection matches={[mockFinishedLostMatch]} />);

      expect(screen.getByText(/Lost to Mike United/)).toBeInTheDocument();
      expect(screen.getByText(/48 - 55/)).toBeInTheDocument();
    });
  });

  describe('Mixed Match Types', () => {
    it('should render all match types together', () => {
      const matches = [
        mockLiveMatch,
        mockUpcomingMatch,
        mockFinishedWonMatch,
        mockFinishedLostMatch,
      ];

      render(<YourMatchesSection matches={matches} />);

      // All four matches should be rendered
      expect(screen.getAllByRole('article')).toHaveLength(4);
    });
  });

  describe('Accessibility', () => {
    it('should have section with proper labeling', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby');
    });

    it('should hide icon from screen readers', () => {
      const { container } = render(
        <YourMatchesSection matches={[mockLiveMatch]} />
      );

      const icon = container.querySelector('.material-symbols-outlined');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
