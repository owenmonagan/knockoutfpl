import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NoTournamentEmptyState } from './NoTournamentEmptyState';

const defaultProps = {
  leagueName: 'London Pub League',
  managerCount: 12,
  isAuthenticated: true,
  onCreate: vi.fn(),
};

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <NoTournamentEmptyState {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('NoTournamentEmptyState', () => {
  it('should render the headline', () => {
    renderComponent();
    expect(screen.getByText('No Tournament Yet')).toBeInTheDocument();
  });

  it('should display the league name in the description', () => {
    renderComponent({ leagueName: 'Test League' });
    expect(screen.getByText('Test League')).toBeInTheDocument();
  });

  it('should render the trophy icon', () => {
    renderComponent();
    expect(screen.getByText('emoji_events')).toBeInTheDocument();
  });

  describe('authenticated user', () => {
    it('should render CreateTournamentButton when authenticated', () => {
      renderComponent({ isAuthenticated: true });
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });

    it('should not show sign up link when authenticated', () => {
      renderComponent({ isAuthenticated: true });
      expect(screen.queryByText(/sign up to create tournament/i)).not.toBeInTheDocument();
    });
  });

  describe('unauthenticated user', () => {
    it('should render sign up button when not authenticated', () => {
      renderComponent({ isAuthenticated: false });
      expect(screen.getByRole('link', { name: /sign up to create tournament/i })).toBeInTheDocument();
    });

    it('should link to signup page', () => {
      renderComponent({ isAuthenticated: false });
      const link = screen.getByRole('link', { name: /sign up to create tournament/i });
      expect(link).toHaveAttribute('href', '/signup');
    });

    it('should show sign in prompt text', () => {
      renderComponent({ isAuthenticated: false });
      expect(screen.getByText(/sign in to create a knockout tournament/i)).toBeInTheDocument();
    });
  });

  describe('How It Works section', () => {
    it('should display dynamic manager count', () => {
      renderComponent({ managerCount: 18 });
      expect(screen.getByText(/all 18 managers/i)).toBeInTheDocument();
    });

    it('should show Auto-Seeding feature', () => {
      renderComponent();
      expect(screen.getByText('Auto-Seeding')).toBeInTheDocument();
    });

    it('should show Head-to-Head feature', () => {
      renderComponent();
      expect(screen.getByText('Head-to-Head')).toBeInTheDocument();
    });

    it('should show Auto-Updates feature', () => {
      renderComponent();
      expect(screen.getByText('Auto-Updates')).toBeInTheDocument();
    });
  });

  describe('locked state', () => {
    it('should show lock icon when isLocked is true', () => {
      renderComponent({ isLocked: true });
      expect(screen.getByText('lock')).toBeInTheDocument();
    });

    it('should show locked message when isLocked is true', () => {
      renderComponent({ isLocked: true });
      expect(screen.getByText('This league is too large for a tournament')).toBeInTheDocument();
    });

    it('should not show create button when isLocked is true', () => {
      renderComponent({ isLocked: true, isAuthenticated: true });
      expect(screen.queryByRole('button', { name: /create tournament/i })).not.toBeInTheDocument();
    });

    it('should not show How It Works section when isLocked is true', () => {
      renderComponent({ isLocked: true });
      expect(screen.queryByText('How it works')).not.toBeInTheDocument();
    });
  });
});
