import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchupCard } from './MatchupCard';
import type { Matchup } from '../services/differentials';

describe('MatchupCard', () => {
  const mockPlayerA = {
    player: {
      id: 1,
      web_name: 'Salah',
      element_type: 3,
      team: 1,
      now_cost: 130,
    },
    points: 10,
    multiplier: 2,
    isCaptain: true,
    isViceCaptain: false,
  };

  const mockPlayerB = {
    player: {
      id: 2,
      web_name: 'Haaland',
      element_type: 4,
      team: 2,
      now_cost: 140,
    },
    points: 8,
    multiplier: 1,
    isCaptain: false,
    isViceCaptain: false,
  };

  describe('Swing badge color', () => {
    const mockFixtures: any[] = [];
    const mockAllPlayers = new Map();

    it('should have blue background when Team A wins', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,
        playerB: mockPlayerB,
        swing: 12,
        winner: 'A',
      };

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={mockFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      const swingBadge = screen.getByText(/\+12pt swing/i);
      expect(swingBadge).toHaveClass('bg-blue-500');
    });

    it('should have purple background when Team B wins', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,
        playerB: mockPlayerB,
        swing: 8,
        winner: 'B',
      };

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={mockFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      const swingBadge = screen.getByText(/\+8pt swing/i);
      expect(swingBadge).toHaveClass('bg-purple-500');
    });

    it('should have gray background when matchup is a draw', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,
        playerB: { ...mockPlayerB, points: 10 },
        swing: 0,
        winner: 'draw',
      };

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={mockFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      const swingBadge = screen.getByText(/draw/i);
      expect(swingBadge).toHaveClass('bg-muted-foreground');
    });
  });

  describe('Fixture status badges', () => {
    const mockFixtures = [
      { id: 1, event: 1, teamH: 1, teamA: 2, started: false, finished: false, minutes: 0 },
      { id: 2, event: 1, teamH: 3, teamA: 4, started: true, finished: false, minutes: 45 },
    ];

    const mockAllPlayers = new Map([
      [1, { id: 1, web_name: 'Salah', element_type: 3, team: 1, now_cost: 130 }],
      [2, { id: 2, web_name: 'Haaland', element_type: 4, team: 2, now_cost: 140 }],
    ]);

    it('accepts fixtures and allPlayers props', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,
        playerB: mockPlayerB,
        swing: 12,
        winner: 'A',
      };

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={mockFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      // Should render without crashing
      expect(screen.getByText(/salah/i)).toBeInTheDocument();
    });

    it('shows SCH badge for playerA when fixture is scheduled', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,  // team: 1, fixture 1 is scheduled (started: false)
        playerB: null,  // Only testing PlayerA
        swing: 12,
        winner: 'A',
      };

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={mockFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      // Should show "⏰ SCH" badge for PlayerA (Salah, team 1, fixture not started)
      expect(screen.getByText(/⏰ SCH/i)).toBeInTheDocument();
    });

    it('shows LIVE badge for playerA when fixture is live', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,  // team: 1, fixture 1 changed to live
        playerB: null,  // Only testing PlayerA
        swing: 12,
        winner: 'A',
      };

      const liveFixtures = [
        { id: 1, event: 1, teamH: 1, teamA: 2, started: true, finished: false, minutes: 45 },
        { id: 2, event: 1, teamH: 3, teamA: 4, started: false, finished: false, minutes: 0 },
      ];

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={liveFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      // Should show "🔴 LIVE" badge for PlayerA
      expect(screen.getByText(/🔴 LIVE/i)).toBeInTheDocument();
    });

    it('shows FT badge for playerA when fixture is finished', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,  // team: 1, fixture 1 changed to finished
        playerB: null,  // Only testing PlayerA
        swing: 12,
        winner: 'A',
      };

      const finishedFixtures = [
        { id: 1, event: 1, teamH: 1, teamA: 2, started: true, finished: true, minutes: 90 },
        { id: 2, event: 1, teamH: 3, teamA: 4, started: false, finished: false, minutes: 0 },
      ];

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={finishedFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      // Should show "✅ FT" badge for PlayerA
      expect(screen.getByText(/✅ FT/i)).toBeInTheDocument();
    });

    it('shows SCH badge for playerB when fixture is scheduled', () => {
      const matchup: Matchup = {
        playerA: null,  // No playerA, only testing PlayerB
        playerB: mockPlayerB,  // team: 2, fixture 1 is scheduled (started: false)
        swing: 8,
        winner: 'B',
      };

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={mockFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      // Should show "⏰ SCH" badge for PlayerB (Haaland, team 2, fixture not started)
      expect(screen.getByText(/⏰ SCH/i)).toBeInTheDocument();
    });

    it('shows LIVE badge for playerB when fixture is live', () => {
      const matchup: Matchup = {
        playerA: null,  // No playerA, only testing PlayerB
        playerB: mockPlayerB,  // team: 2, fixture changed to live
        swing: 8,
        winner: 'B',
      };

      const liveFixtures = [
        { id: 1, event: 1, teamH: 1, teamA: 2, started: true, finished: false, minutes: 45 },
        { id: 2, event: 1, teamH: 3, teamA: 4, started: false, finished: false, minutes: 0 },
      ];

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={liveFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      // Should show "🔴 LIVE" badge for PlayerB
      expect(screen.getByText(/🔴 LIVE/i)).toBeInTheDocument();
    });

    it('shows FT badge for playerB when fixture is finished', () => {
      const matchup: Matchup = {
        playerA: null,  // No playerA, only testing PlayerB
        playerB: mockPlayerB,  // team: 2, fixture changed to finished
        swing: 8,
        winner: 'B',
      };

      const finishedFixtures = [
        { id: 1, event: 1, teamH: 1, teamA: 2, started: true, finished: true, minutes: 90 },
        { id: 2, event: 1, teamH: 3, teamA: 4, started: false, finished: false, minutes: 0 },
      ];

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={finishedFixtures}
          allPlayers={mockAllPlayers}
        />
      );

      // Should show "✅ FT" badge for PlayerB
      expect(screen.getByText(/✅ FT/i)).toBeInTheDocument();
    });

    it('does not show fixture badge when fixtures array is empty', () => {
      const matchup: Matchup = {
        playerA: mockPlayerA,
        playerB: mockPlayerB,
        swing: 12,
        winner: 'A',
      };

      render(
        <MatchupCard
          matchup={matchup}
          teamAName="Team A"
          teamBName="Team B"
          matchupRank={1}
          maxSwing={20}
          fixtures={[]}  // Empty fixtures
          allPlayers={mockAllPlayers}
        />
      );

      // Should NOT show any fixture status badges
      expect(screen.queryByText(/⏰ SCH/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/🔴 LIVE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/✅ FT/i)).not.toBeInTheDocument();
    });
  });
});
