import { describe, it, expect } from 'vitest';
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
  });
});
