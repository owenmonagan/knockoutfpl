import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeaguePickerCard } from './LeaguePickerCard';
import type { FPLMiniLeague } from '../../services/fpl';

describe('LeaguePickerCard', () => {
  const mockLeague: FPLMiniLeague = {
    id: 123,
    name: 'Test League',
    entryRank: 5,
  };

  describe('Basic Rendering', () => {
    it('renders league name', () => {
      render(
        <LeaguePickerCard
          league={mockLeague}
          memberCount={10}
          onStartKnockout={vi.fn()}
        />
      );
      const leagueName = screen.getByText('Test League');
      expect(leagueName).toBeInTheDocument();
    });

    it('renders member count', () => {
      render(
        <LeaguePickerCard
          league={mockLeague}
          memberCount={10}
          onStartKnockout={vi.fn()}
        />
      );
      const memberCount = screen.getByText(/10 members/i);
      expect(memberCount).toBeInTheDocument();
    });

    it('renders user rank in league', () => {
      render(
        <LeaguePickerCard
          league={mockLeague}
          memberCount={10}
          onStartKnockout={vi.fn()}
        />
      );
      const rank = screen.getByText(/you're ranked #5/i);
      expect(rank).toBeInTheDocument();
    });
  });

  describe('Button Interaction', () => {
    it('renders "Start Knockout" button', () => {
      render(
        <LeaguePickerCard
          league={mockLeague}
          memberCount={10}
          onStartKnockout={vi.fn()}
        />
      );
      const button = screen.getByRole('button', { name: /start knockout/i });
      expect(button).toBeInTheDocument();
    });

    it('calls onStartKnockout when button clicked', async () => {
      const handleStartKnockout = vi.fn();
      const user = userEvent.setup();

      render(
        <LeaguePickerCard
          league={mockLeague}
          memberCount={10}
          onStartKnockout={handleStartKnockout}
        />
      );

      const button = screen.getByRole('button', { name: /start knockout/i });
      await user.click(button);

      expect(handleStartKnockout).toHaveBeenCalledTimes(1);
    });

    it('disables button when loading', () => {
      render(
        <LeaguePickerCard
          league={mockLeague}
          memberCount={10}
          onStartKnockout={vi.fn()}
          isLoading={true}
        />
      );

      const button = screen.getByRole('button', { name: /start knockout/i });
      expect(button).toBeDisabled();
    });
  });
});
