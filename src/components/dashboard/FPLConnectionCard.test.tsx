import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

    it('Step 11: shows "Connect" button', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const button = screen.getByRole('button', { name: /connect/i });
      expect(button).toBeInTheDocument();
    });

    it('Step 12: button is disabled when input is empty', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const button = screen.getByRole('button', { name: /connect/i });
      expect(button).toBeDisabled();
    });

    it('Step 13: validates team ID format (6-7 digits)', () => {
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
      const button = screen.getByRole('button', { name: /connect/i });

      // Too short (5 digits) - should be disabled
      fireEvent.change(input, { target: { value: '12345' } });
      expect(button).toBeDisabled();

      // Valid 6-digit team ID - should be enabled
      fireEvent.change(input, { target: { value: '123456' } });
      expect(button).not.toBeDisabled();

      // Valid 7-digit team ID - should be enabled
      fireEvent.change(input, { target: { value: '1234567' } });
      expect(button).not.toBeDisabled();

      // Too long (8 digits) - should be disabled
      fireEvent.change(input, { target: { value: '12345678' } });
      expect(button).toBeDisabled();
    });

    it('Step 14: shows error for invalid team ID', () => {
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

      // Enter invalid team ID
      fireEvent.change(input, { target: { value: '123' } });

      // Should show error message
      const error = screen.getByText(/team id must be 6-7 digits/i);
      expect(error).toBeInTheDocument();
    });

    it('Step 15: shows error for non-numeric input', () => {
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

      // Enter non-numeric input
      fireEvent.change(input, { target: { value: 'abc123' } });

      // Should show error message
      const error = screen.getByText(/team id must be 6-7 digits/i);
      expect(error).toBeInTheDocument();
    });

    it('Step 16: shows help text with link', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      // Should show help text
      const helpText = screen.getByText(/find your team id/i);
      expect(helpText).toBeInTheDocument();

      // Should have link to FPL site
      const link = screen.getByRole('link', { name: /fantasy.premierleague.com/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://fantasy.premierleague.com');
    });

    it('Step 17: button shows loading state when connecting', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={true}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const button = screen.getByRole('button', { name: /connecting/i });
      expect(button).toBeInTheDocument();
    });

    it('Step 18: button is disabled while loading', () => {
      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={true}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const button = screen.getByRole('button', { name: /connecting/i });
      expect(button).toBeDisabled();
    });

    it('Step 19: calls onConnect with team ID on submit', async () => {
      const mockOnConnect = vi.fn().mockResolvedValue(undefined);

      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          onConnect={mockOnConnect}
          onUpdate={async () => {}}
        />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /connect/i });

      // Enter valid team ID
      fireEvent.change(input, { target: { value: '123456' } });

      // Click connect button
      fireEvent.click(button);

      // Should call onConnect with numeric team ID
      expect(mockOnConnect).toHaveBeenCalledWith(123456);
    });

    it('Step 20: shows error message from API failure', () => {
      const errorMessage = 'Team not found. Please check your Team ID.';

      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          error={errorMessage}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const error = screen.getByText(errorMessage);
      expect(error).toBeInTheDocument();
      expect(error).toHaveClass('text-destructive');
    });

    it('Step 21: clears error when user types', () => {
      const mockOnClearError = vi.fn();
      const errorMessage = 'Team not found';

      render(
        <FPLConnectionCard
          user={mockUser}
          fplData={null}
          isLoading={false}
          error={errorMessage}
          onConnect={async () => {}}
          onUpdate={async () => {}}
          onClearError={mockOnClearError}
        />
      );

      const input = screen.getByRole('textbox');

      // User starts typing
      fireEvent.change(input, { target: { value: '1' } });

      // Should call onClearError
      expect(mockOnClearError).toHaveBeenCalled();
    });
  });

  describe('PHASE 3: Connected State', () => {
    const connectedUser = {
      userId: 'test-uid',
      fplTeamId: 158256, // Connected
      fplTeamName: 'Monzaga',
      email: 'test@example.com',
      displayName: 'Test User',
      wins: 0,
      losses: 0,
      createdAt: {} as any,
      updatedAt: {} as any,
    };

    const mockFplData = {
      teamName: 'Monzaga',
      overallPoints: 427,
      overallRank: 841192,
      gameweekPoints: 78,
      gameweekRank: 1656624,
      teamValue: 102.0,
    };

    it('Step 22: shows "Your FPL Team" title when connected', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const title = screen.getByRole('heading', { name: /^your fpl team$/i });
      expect(title).toBeInTheDocument();
    });

    it('Step 23: displays team name', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const teamName = screen.getByText(/monzaga/i);
      expect(teamName).toBeInTheDocument();
    });

    it('Step 24: displays gameweek points', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const gwPoints = screen.getByText(/gw points.*78/i);
      expect(gwPoints).toBeInTheDocument();
    });

    it('Step 25: displays gameweek rank (formatted)', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const gwRank = screen.getByText(/gw rank.*1,656,624/i);
      expect(gwRank).toBeInTheDocument();
    });

    it('Step 26: displays overall points', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const overallPts = screen.getByText(/overall.*427.*pts/i);
      expect(overallPts).toBeInTheDocument();
    });

    it('Step 27: displays overall rank (formatted)', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const overallRank = screen.getByText(/overall rank.*841,192/i);
      expect(overallRank).toBeInTheDocument();
    });

    it('Step 28: displays team value (formatted)', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const teamValue = screen.getByText(/team value.*£102\.0m/i);
      expect(teamValue).toBeInTheDocument();
    });

    it('Step 29: shows "Edit" button', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={mockFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });

    it('shows loading state when connected but fplData is null', () => {
      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={null}
          isLoading={true}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      // Should not crash and should show connect form until data loads
      const connectForm = screen.getByLabelText(/fpl team id/i);
      expect(connectForm).toBeInTheDocument();
    });

    it('handles missing gameweekRank gracefully', () => {
      const incompleteFplData = {
        ...mockFplData,
        gameweekRank: undefined as any,
      };

      render(
        <FPLConnectionCard
          user={connectedUser}
          fplData={incompleteFplData}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      // Should not crash, should still show team name
      const teamName = screen.getByText(/monzaga/i);
      expect(teamName).toBeInTheDocument();
    });
  });
});
