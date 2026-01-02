import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { YourLeaguesSection } from './YourLeaguesSection';
import type { LeagueData } from './YourLeaguesSection';

// Active tournament, user still alive
const mockActiveAlive: LeagueData = {
  leagueId: 1001,
  leagueName: 'Work Colleagues League',
  memberCount: 14,
  tournament: {
    startGameweek: 12,
    endGameweek: 15,
    currentRound: 3,
    totalRounds: 4,
    status: 'active',
  },
  userProgress: {
    status: 'active',
    currentRoundName: 'Semi-finals',
  },
};

// Active tournament, user eliminated
const mockActiveEliminated: LeagueData = {
  leagueId: 1002,
  leagueName: 'Reddit r/FantasyPL Knockout',
  memberCount: 128,
  tournament: {
    startGameweek: 8,
    endGameweek: 15,
    currentRound: 5,
    totalRounds: 7,
    status: 'active',
  },
  userProgress: {
    status: 'eliminated',
    eliminationRound: 2,
  },
};

// Completed tournament, user won
const mockCompletedWinner: LeagueData = {
  leagueId: 1003,
  leagueName: 'Family Cup',
  memberCount: 8,
  tournament: {
    startGameweek: 10,
    endGameweek: 13,
    currentRound: 3,
    totalRounds: 3,
    status: 'completed',
  },
  userProgress: {
    status: 'winner',
  },
};

// Completed tournament, user lost
const mockCompletedLost: LeagueData = {
  leagueId: 1004,
  leagueName: 'Old School Mates',
  memberCount: 8,
  tournament: {
    startGameweek: 10,
    endGameweek: 13,
    currentRound: 3,
    totalRounds: 3,
    status: 'completed',
  },
  userProgress: {
    status: 'eliminated',
    eliminationRound: 2,
  },
};

// No tournament
const mockNoTournament: LeagueData = {
  leagueId: 1005,
  leagueName: 'Family & Friends',
  memberCount: 6,
  tournament: null,
};

describe('YourLeaguesSection', () => {
  describe('Section Header', () => {
    it('should render section heading', () => {
      render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      expect(
        screen.getByRole('heading', { name: 'Your Leagues' })
      ).toBeInTheDocument();
    });

    it('should render trophy material icon', () => {
      const { container } = render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const icon = container.querySelector('.material-symbols-outlined');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('trophy');
    });

    it('should have proper aria-labelledby for accessibility', () => {
      const { container } = render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'your-leagues-heading');
    });

    it('should hide icon from screen readers', () => {
      const { container } = render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const icon = container.querySelector('.material-symbols-outlined');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no leagues', () => {
      render(<YourLeaguesSection leagues={[]} onLeagueClick={() => {}} />);

      expect(screen.getByText('No leagues found.')).toBeInTheDocument();
      expect(
        screen.getByText('Connect your FPL team to see your leagues here.')
      ).toBeInTheDocument();
    });

    it('should not show empty state when leagues exist', () => {
      render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      expect(screen.queryByText('No leagues found.')).not.toBeInTheDocument();
    });

    it('should not show empty state when loading', () => {
      render(
        <YourLeaguesSection leagues={[]} onLeagueClick={() => {}} isLoading />
      );

      expect(screen.queryByText('No leagues found.')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton cards when loading', () => {
      const { container } = render(
        <YourLeaguesSection leagues={[]} onLeagueClick={() => {}} isLoading />
      );

      // Should render 3 skeleton cards
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not show league cards when loading', () => {
      render(
        <YourLeaguesSection
          leagues={[mockActiveAlive]}
          onLeagueClick={() => {}}
          isLoading
        />
      );

      expect(screen.queryByText('Work Colleagues League')).not.toBeInTheDocument();
    });

    it('should show leagues after loading completes', () => {
      render(
        <YourLeaguesSection
          leagues={[mockActiveAlive]}
          onLeagueClick={() => {}}
          isLoading={false}
        />
      );

      expect(screen.getByText('Work Colleagues League')).toBeInTheDocument();
    });
  });

  describe('League Cards Display', () => {
    it('should render all league cards', () => {
      const leagues = [mockActiveAlive, mockActiveEliminated, mockNoTournament];
      render(<YourLeaguesSection leagues={leagues} onLeagueClick={() => {}} />);

      expect(screen.getByText(/Work Colleagues League/)).toBeInTheDocument();
      expect(screen.getByText(/Reddit r\/FantasyPL Knockout/)).toBeInTheDocument();
      expect(screen.getByText(/Family & Friends/)).toBeInTheDocument();
    });

    it('should display correct card content for league without tournament', () => {
      render(
        <YourLeaguesSection leagues={[mockNoTournament]} onLeagueClick={() => {}} />
      );

      expect(screen.getByText(/6 Managers/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Create Tournament/i })
      ).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort leagues by priority', () => {
      // Provide leagues out of order
      const leagues = [
        mockNoTournament, // Priority 3
        mockCompletedLost, // Priority 2
        mockActiveEliminated, // Priority 1
        mockActiveAlive, // Priority 0
      ];

      const { container } = render(
        <YourLeaguesSection leagues={leagues} onLeagueClick={() => {}} />
      );

      const cards = container.querySelectorAll('[role="article"]');
      expect(cards).toHaveLength(4);

      // First card should be active alive (highest priority)
      expect(cards[0]).toHaveTextContent('Work Colleagues League');
      // Second should be active eliminated
      expect(cards[1]).toHaveTextContent('Reddit r/FantasyPL Knockout');
      // Third should be completed
      expect(cards[2]).toHaveTextContent('Old School Mates');
      // Last should be no tournament
      expect(cards[3]).toHaveTextContent('Family & Friends');
    });

    it('should place completed winner and completed loser in same tier', () => {
      const leagues = [mockCompletedLost, mockCompletedWinner];

      const { container } = render(
        <YourLeaguesSection leagues={leagues} onLeagueClick={() => {}} />
      );

      const cards = container.querySelectorAll('[role="article"]');
      expect(cards).toHaveLength(2);

      // Both should be in the completed tier, order preserved within tier
      expect(cards[0]).toHaveTextContent('Old School Mates');
      expect(cards[1]).toHaveTextContent('Family Cup');
    });

    it('should preserve original order within same priority', () => {
      const activeAlive2: LeagueData = {
        ...mockActiveAlive,
        leagueId: 9999,
        leagueName: 'Another Active League',
      };

      const leagues = [mockActiveAlive, activeAlive2];

      const { container } = render(
        <YourLeaguesSection leagues={leagues} onLeagueClick={() => {}} />
      );

      const cards = container.querySelectorAll('[role="article"]');
      expect(cards[0]).toHaveTextContent('Work Colleagues League');
      expect(cards[1]).toHaveTextContent('Another Active League');
    });
  });

  describe('Click Behavior', () => {
    it('should call onLeagueClick with correct leagueId when card is clicked', () => {
      const handleLeagueClick = vi.fn();
      render(
        <YourLeaguesSection
          leagues={[mockActiveAlive]}
          onLeagueClick={handleLeagueClick}
        />
      );

      const card = screen.getByRole('article');
      fireEvent.click(card);

      expect(handleLeagueClick).toHaveBeenCalledWith(1001);
    });

    it('should call onLeagueClick with correct leagueId when button is clicked', () => {
      const handleLeagueClick = vi.fn();
      render(
        <YourLeaguesSection
          leagues={[mockActiveAlive]}
          onLeagueClick={handleLeagueClick}
        />
      );

      const button = screen.getByRole('button', { name: /View Tournament/i });
      fireEvent.click(button);

      expect(handleLeagueClick).toHaveBeenCalledWith(1001);
    });

    it('should handle clicks on different leagues correctly', () => {
      const handleLeagueClick = vi.fn();
      const leagues = [mockActiveAlive, mockNoTournament];

      render(
        <YourLeaguesSection leagues={leagues} onLeagueClick={handleLeagueClick} />
      );

      // Click on second league (no tournament)
      const createButton = screen.getByRole('button', {
        name: /Create Tournament/i,
      });
      fireEvent.click(createButton);

      expect(handleLeagueClick).toHaveBeenCalledWith(1005);
    });
  });

  describe('Grid Layout', () => {
    it('should have correct grid classes', () => {
      const { container } = render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should have correct gap between cards', () => {
      const { container } = render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Different League Types', () => {
    it('should render active tournament with alive user correctly', () => {
      render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      expect(screen.getByText(/Work Colleagues League/)).toBeInTheDocument();
      // Status shows the current round name
      expect(screen.getByText('Semi-finals')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /View Tournament/i })
      ).toBeInTheDocument();
    });

    it('should render active tournament with eliminated user correctly', () => {
      render(
        <YourLeaguesSection
          leagues={[mockActiveEliminated]}
          onLeagueClick={() => {}}
        />
      );

      expect(screen.getByText(/Reddit r\/FantasyPL Knockout/)).toBeInTheDocument();
      // Status column shows "Eliminated" (badge also shows Eliminated)
      const eliminatedElements = screen.getAllByText('Eliminated');
      expect(eliminatedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should render completed tournament with winner correctly', () => {
      render(
        <YourLeaguesSection
          leagues={[mockCompletedWinner]}
          onLeagueClick={() => {}}
        />
      );

      expect(screen.getByText(/Family Cup/)).toBeInTheDocument();
      // Champion appears in both badge and status
      const championElements = screen.getAllByText('Champion');
      expect(championElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should render league without tournament correctly', () => {
      render(
        <YourLeaguesSection leagues={[mockNoTournament]} onLeagueClick={() => {}} />
      );

      expect(screen.getByText(/Family & Friends/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Create Tournament/i })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have section with proper labeling', () => {
      const { container } = render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'your-leagues-heading');
    });

    it('should have heading with correct id', () => {
      render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const heading = screen.getByRole('heading', { name: 'Your Leagues' });
      expect(heading).toHaveAttribute('id', 'your-leagues-heading');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty leagues array', () => {
      render(<YourLeaguesSection leagues={[]} onLeagueClick={() => {}} />);

      expect(screen.getByText('No leagues found.')).toBeInTheDocument();
    });

    it('should handle single league', () => {
      render(
        <YourLeaguesSection leagues={[mockActiveAlive]} onLeagueClick={() => {}} />
      );

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(1);
    });

    it('should handle many leagues', () => {
      const manyLeagues = Array.from({ length: 10 }, (_, i) => ({
        ...mockActiveAlive,
        leagueId: i,
        leagueName: `League ${i}`,
      }));

      render(
        <YourLeaguesSection leagues={manyLeagues} onLeagueClick={() => {}} />
      );

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(10);
    });

    it('should not mutate original leagues array when sorting', () => {
      const leagues = [mockNoTournament, mockActiveAlive];
      const originalOrder = [...leagues];

      render(<YourLeaguesSection leagues={leagues} onLeagueClick={() => {}} />);

      expect(leagues).toEqual(originalOrder);
    });
  });

  describe('isLocked based on member count', () => {
    it('should show lock icon for leagues with more than 48 members', () => {
      const lockedLeague: LeagueData = {
        leagueId: 9999,
        leagueName: 'Large League',
        memberCount: 100, // > 48
        tournament: null,
        userProgress: null,
      };

      render(<YourLeaguesSection leagues={[lockedLeague]} onLeagueClick={() => {}} />);

      const lockIcon = screen.getByLabelText('League too large');
      expect(lockIcon).toBeInTheDocument();
    });

    it('should not show lock icon for leagues with exactly 48 members', () => {
      const borderlineLeague: LeagueData = {
        leagueId: 9998,
        leagueName: 'Borderline League',
        memberCount: 48, // exactly 48, not locked
        tournament: null,
        userProgress: null,
      };

      render(<YourLeaguesSection leagues={[borderlineLeague]} onLeagueClick={() => {}} />);

      expect(screen.queryByLabelText('League too large')).not.toBeInTheDocument();
    });

    it('should not show lock icon for leagues with fewer than 48 members', () => {
      const smallLeague: LeagueData = {
        leagueId: 9997,
        leagueName: 'Small League',
        memberCount: 20,
        tournament: null,
        userProgress: null,
      };

      render(<YourLeaguesSection leagues={[smallLeague]} onLeagueClick={() => {}} />);

      expect(screen.queryByLabelText('League too large')).not.toBeInTheDocument();
    });

    it('should show lock icon for league with 49 members (one over limit)', () => {
      const justOverLeague: LeagueData = {
        leagueId: 9996,
        leagueName: 'Just Over League',
        memberCount: 49, // > 48
        tournament: null,
        userProgress: null,
      };

      render(<YourLeaguesSection leagues={[justOverLeague]} onLeagueClick={() => {}} />);

      const lockIcon = screen.getByLabelText('League too large');
      expect(lockIcon).toBeInTheDocument();
    });
  });
});
