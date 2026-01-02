// src/components/tournament/TournamentPreview.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TournamentPreview } from './TournamentPreview';

describe('TournamentPreview', () => {
  describe('info summary badges', () => {
    it('shows correct info for 8-player 1v1 tournament', () => {
      render(<TournamentPreview managerCount={8} matchSize={2} startGameweek={20} />);

      expect(screen.getByText('3 rounds')).toBeInTheDocument();
      expect(screen.getByText('GW 20-22')).toBeInTheDocument();
    });

    it('shows byes badge when applicable', () => {
      render(<TournamentPreview managerCount={10} matchSize={4} startGameweek={1} />);

      expect(screen.getByText('6 byes')).toBeInTheDocument();
    });

    it('hides byes badge when no byes', () => {
      render(<TournamentPreview managerCount={8} matchSize={2} startGameweek={1} />);

      expect(screen.queryByText(/byes/)).not.toBeInTheDocument();
    });

    it('shows correct gameweek range for single round', () => {
      render(<TournamentPreview managerCount={4} matchSize={4} startGameweek={10} />);

      expect(screen.getByText('1 rounds')).toBeInTheDocument();
      expect(screen.getByText('GW 10-10')).toBeInTheDocument();
    });
  });

  describe('visual bracket structure', () => {
    it('displays round boxes for 1v1 tournament', () => {
      render(<TournamentPreview managerCount={8} matchSize={2} startGameweek={20} />);

      // Check round names
      expect(screen.getByText('Quarter-Finals')).toBeInTheDocument();
      expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
      expect(screen.getByText('Final')).toBeInTheDocument();

      // Check match counts
      expect(screen.getByText('4')).toBeInTheDocument(); // R1
      expect(screen.getByText('2')).toBeInTheDocument(); // R2
      expect(screen.getByText('1')).toBeInTheDocument(); // R3

      // Check GW labels for each round
      expect(screen.getByText('GW 20')).toBeInTheDocument();
      expect(screen.getByText('GW 21')).toBeInTheDocument();
      expect(screen.getByText('GW 22')).toBeInTheDocument();
    });

    it('uses "matches" label for 1v1', () => {
      render(<TournamentPreview managerCount={8} matchSize={2} startGameweek={1} />);

      // Multiple rounds have "matches" label (QF has 4, SF has 2)
      const matchesLabels = screen.getAllByText('matches');
      expect(matchesLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('match')).toBeInTheDocument(); // Final has 1 match
    });

    it('uses "groups" label for 3-way', () => {
      render(<TournamentPreview managerCount={9} matchSize={3} startGameweek={1} />);

      expect(screen.getByText('groups')).toBeInTheDocument();
      expect(screen.getByText('group')).toBeInTheDocument(); // Final has 1 group
    });

    it('uses "groups" label for 4-way', () => {
      render(<TournamentPreview managerCount={16} matchSize={4} startGameweek={1} />);

      expect(screen.getByText('groups')).toBeInTheDocument();
      expect(screen.getByText('group')).toBeInTheDocument(); // Final has 1 group
    });

    it('shows arrow connectors between rounds', () => {
      render(<TournamentPreview managerCount={8} matchSize={2} startGameweek={1} />);

      // Should have 2 arrows for 3 rounds
      const arrows = screen.getAllByText('→');
      expect(arrows).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('returns null for insufficient participants', () => {
      const { container } = render(
        <TournamentPreview managerCount={1} matchSize={2} startGameweek={1} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null for zero participants', () => {
      const { container } = render(
        <TournamentPreview managerCount={0} matchSize={2} startGameweek={1} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('handles 2-player tournament (single final)', () => {
      render(<TournamentPreview managerCount={2} matchSize={2} startGameweek={15} />);

      expect(screen.getByText('1 rounds')).toBeInTheDocument();
      expect(screen.getByText('Final')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.queryByText('→')).not.toBeInTheDocument(); // No arrows for single round
    });
  });
});
