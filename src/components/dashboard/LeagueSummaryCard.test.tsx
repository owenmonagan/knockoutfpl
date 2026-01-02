import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeagueSummaryCard } from './LeagueSummaryCard';

describe('LeagueSummaryCard', () => {
  describe('Status Badge', () => {
    it('should show "Active" badge for active tournament with active user', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={14}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{ status: 'active' }}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show "Champion" badge for winner', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{ status: 'winner' }}
          onClick={() => {}}
        />
      );

      // Champion appears in both badge and status
      const championElements = screen.getAllByText('Champion');
      expect(championElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should show "Classic" badge for league without tournament', () => {
      render(
        <LeagueSummaryCard
          leagueName="Family League"
          memberCount={6}
          tournament={null}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Classic')).toBeInTheDocument();
    });

    it('should show "Eliminated" badge when user is eliminated', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={14}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 5,
            totalRounds: 7,
            status: 'active',
          }}
          userProgress={{ status: 'eliminated', eliminationRound: 2 }}
          onClick={() => {}}
        />
      );

      // Eliminated appears in both badge and status
      const eliminatedElements = screen.getAllByText('Eliminated');
      expect(eliminatedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should show "Completed" badge for completed tournament where user lost', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{ status: 'eliminated', eliminationRound: 2 }}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    it('should render league name in header', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work Colleagues"
          memberCount={14}
          userRank={1}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{ status: 'active' }}
          onClick={() => {}}
        />
      );

      const header = screen.getByTestId('league-card-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Work Colleagues');
    });

    it('should render manager count in header', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work Colleagues"
          memberCount={14}
          tournament={null}
          onClick={() => {}}
        />
      );

      const header = screen.getByTestId('league-card-header');
      expect(header).toHaveTextContent('14 Managers');
    });
  });

  describe('User Rank Display', () => {
    it('should display user rank with ordinal suffix', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work Colleagues League"
          memberCount={14}
          userRank={1}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{
            status: 'active',
            currentRoundName: 'Semi-finals',
          }}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('1st')).toBeInTheDocument();
    });
  });

  describe('Stats Grid', () => {
    it('should display Your Rank label and value', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={14}
          userRank={1}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{ status: 'active', currentRoundName: 'Quarter Final' }}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Your Rank')).toBeInTheDocument();
      expect(screen.getByText('1st')).toBeInTheDocument();
    });

    it('should display Status label and current round name for active user', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={14}
          userRank={1}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{ status: 'active', currentRoundName: 'Quarter Final' }}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Quarter Final')).toBeInTheDocument();
    });

    it('should display "Not Started" status for no-tournament', () => {
      render(
        <LeagueSummaryCard
          leagueName="Family League"
          memberCount={6}
          userRank={4}
          tournament={null}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('should display "Eliminated" status for eliminated user', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={14}
          userRank={89}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 5,
            totalRounds: 7,
            status: 'active',
          }}
          userProgress={{ status: 'eliminated', eliminationRound: 2 }}
          onClick={() => {}}
        />
      );

      // Status column should show "Eliminated"
      const statusElements = screen.getAllByText('Eliminated');
      expect(statusElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should show dash when userRank is not provided', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={14}
          tournament={null}
          onClick={() => {}}
        />
      );

      // Rank should show dash
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('League with Active Tournament (user still alive)', () => {
    it('should render league name', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work Colleagues League"
          memberCount={14}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{
            status: 'active',
            currentRoundName: 'Semi-finals',
          }}
          onClick={() => {}}
        />
      );

      expect(screen.getByText(/Work Colleagues League/)).toBeInTheDocument();
    });

    it('should show "View Tournament" button', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work Colleagues League"
          memberCount={14}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{
            status: 'active',
            currentRoundName: 'Semi-finals',
          }}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /View Tournament/i })).toBeInTheDocument();
    });

    it('should have primary accent styling', () => {
      const { container } = render(
        <LeagueSummaryCard
          leagueName="Work Colleagues League"
          memberCount={14}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          }}
          userProgress={{
            status: 'active',
            currentRoundName: 'Semi-finals',
          }}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('.border-primary\\/50');
      expect(card).toBeInTheDocument();
    });
  });

  describe('League with Active Tournament (user eliminated)', () => {
    it('should have muted styling when eliminated', () => {
      const { container } = render(
        <LeagueSummaryCard
          leagueName="Reddit r/FantasyPL Knockout"
          memberCount={128}
          tournament={{
            startGameweek: 8,
            endGameweek: 15,
            currentRound: 5,
            totalRounds: 7,
            status: 'active',
          }}
          userProgress={{
            status: 'eliminated',
            eliminationRound: 2,
          }}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('.opacity-90');
      expect(card).toBeInTheDocument();
    });
  });

  describe('League with Completed Tournament (user won)', () => {
    it('should show winner status with trophy', () => {
      const { container } = render(
        <LeagueSummaryCard
          leagueName="Family Cup"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{
            status: 'winner',
          }}
          onClick={() => {}}
        />
      );

      // Champion badge is shown for winner
      const championElements = screen.getAllByText('Champion');
      expect(championElements.length).toBeGreaterThanOrEqual(1);
      // Check for trophy emoji
      expect(container.textContent).toContain('\u{1F3C6}');
    });

    it('should have gold/amber accent styling for winner', () => {
      const { container } = render(
        <LeagueSummaryCard
          leagueName="Family Cup"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{
            status: 'winner',
          }}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('.border-amber-500\\/50');
      expect(card).toBeInTheDocument();
    });
  });

  describe('League with Completed Tournament (user lost)', () => {
    it('should show completed status with elimination round', () => {
      render(
        <LeagueSummaryCard
          leagueName="Old School Mates"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{
            status: 'eliminated',
            eliminationRound: 2,
          }}
          onClick={() => {}}
        />
      );

      // Completed badge shown for completed tournament where user lost
      expect(screen.getByText('Completed')).toBeInTheDocument();
      // Status column shows Eliminated
      const eliminatedElements = screen.getAllByText('Eliminated');
      expect(eliminatedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should have muted styling for completed-lost', () => {
      const { container } = render(
        <LeagueSummaryCard
          leagueName="Old School Mates"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{
            status: 'eliminated',
            eliminationRound: 2,
          }}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('.opacity-90');
      expect(card).toBeInTheDocument();
    });
  });

  describe('League without Tournament', () => {
    it('should show league name and member count', () => {
      render(
        <LeagueSummaryCard
          leagueName="Family & Friends"
          memberCount={6}
          tournament={null}
          onClick={() => {}}
        />
      );

      expect(screen.getByText(/Family & Friends/)).toBeInTheDocument();
      expect(screen.getByText(/6 Managers/)).toBeInTheDocument();
    });

    it('should show dash instead of rank when no rank provided', () => {
      render(
        <LeagueSummaryCard
          leagueName="Family & Friends"
          memberCount={6}
          tournament={null}
          onClick={() => {}}
        />
      );

      // Dash is shown for rank when no userRank is provided
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should show "Create Tournament" button', () => {
      render(
        <LeagueSummaryCard
          leagueName="Family & Friends"
          memberCount={6}
          tournament={null}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /Create Tournament/i })).toBeInTheDocument();
    });

    it('should have dashed border for no tournament', () => {
      const { container } = render(
        <LeagueSummaryCard
          leagueName="Family & Friends"
          memberCount={6}
          tournament={null}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('.border-dashed');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Click Behavior', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={10}
          tournament={null}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('article');
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when button is clicked', () => {
      const handleClick = vi.fn();
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={10}
          tournament={null}
          onClick={handleClick}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      // Button stopPropagation should still call onClick
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have cursor-pointer class', () => {
      const { container } = render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={10}
          tournament={null}
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
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={10}
          tournament={null}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('[class*="hover:-translate-y"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have article role', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={10}
          tournament={null}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Button Variants', () => {
    it('should show "View History" for eliminated user', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={14}
          tournament={{
            startGameweek: 12,
            endGameweek: 15,
            currentRound: 5,
            totalRounds: 7,
            status: 'active',
          }}
          userProgress={{ status: 'eliminated', eliminationRound: 2 }}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /View History/i })).toBeInTheDocument();
    });

    it('should show "View History" for completed tournament', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{ status: 'eliminated' }}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /View History/i })).toBeInTheDocument();
    });

    it('should show "View Tournament" for winner', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'completed',
          }}
          userProgress={{ status: 'winner' }}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /View Tournament/i })).toBeInTheDocument();
    });
  });

  describe('isLocked prop', () => {
    it('should show lock icon when isLocked is true', () => {
      render(
        <LeagueSummaryCard
          leagueName="Big League"
          memberCount={100}
          tournament={null}
          isLocked={true}
          onClick={() => {}}
        />
      );

      const lockIcon = screen.getByLabelText('League too large');
      expect(lockIcon).toBeInTheDocument();
      expect(lockIcon).toHaveTextContent('lock');
    });

    it('should not show lock icon when isLocked is false', () => {
      render(
        <LeagueSummaryCard
          leagueName="Small League"
          memberCount={20}
          tournament={null}
          isLocked={false}
          onClick={() => {}}
        />
      );

      expect(screen.queryByLabelText('League too large')).not.toBeInTheDocument();
    });

    it('should not show lock icon when isLocked is not provided', () => {
      render(
        <LeagueSummaryCard
          leagueName="Normal League"
          memberCount={30}
          tournament={null}
          onClick={() => {}}
        />
      );

      expect(screen.queryByLabelText('League too large')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tournament without userProgress', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={10}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 2,
            totalRounds: 3,
            status: 'active',
          }}
          userProgress={null}
          onClick={() => {}}
        />
      );

      // Status shows the round name (Semi-Finals for round 2 of 3)
      expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Tournament/i })).toBeInTheDocument();
    });

    it('should generate round name from round number when currentRoundName not provided', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'active',
          }}
          userProgress={{
            status: 'active',
            // No currentRoundName provided
          }}
          onClick={() => {}}
        />
      );

      // Should show "Final" in the status column for round 3 of 3
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should handle undefined tournament (same as null)', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={10}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /Create Tournament/i })).toBeInTheDocument();
    });

    it('should handle elimination without round number', () => {
      render(
        <LeagueSummaryCard
          leagueName="Work League"
          memberCount={8}
          tournament={{
            startGameweek: 10,
            endGameweek: 13,
            currentRound: 3,
            totalRounds: 3,
            status: 'active',
          }}
          userProgress={{
            status: 'eliminated',
            eliminationRound: null,
          }}
          onClick={() => {}}
        />
      );

      // Status column shows "Eliminated" (badge also shows Eliminated)
      const eliminatedElements = screen.getAllByText('Eliminated');
      expect(eliminatedElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
