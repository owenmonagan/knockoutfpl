import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FPLConnectionCard } from './FPLConnectionCard';

describe('FPLConnectionCard', () => {
  describe('PHASE 2: Not Connected State', () => {
    const mockUser = {
      userId: 'test-uid',
      fplTeamId: 0, // Not connected
      fplTeamName: '',
      email: 'test@example.com',
      displayName: 'Test User',
      wins: 0,
      losses: 0,
      createdAt: {} as any,
      updatedAt: {} as any,
    };

    it('Step 6: component renders', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('Step 7: shows "Connect Your FPL Team" title when not connected', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const title = screen.getByRole('heading', { name: /connect your fpl team/i });
      expect(title).toBeInTheDocument();
    });

    it('Step 8: shows description text', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const description = screen.getByText(/link your fpl team to start creating challenges/i);
      expect(description).toBeInTheDocument();
    });

    it('Step 9: shows team ID input field', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('Step 10: input has proper label', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const label = screen.getByLabelText(/fpl team id/i);
      expect(label).toBeInTheDocument();
    });
  });
});
