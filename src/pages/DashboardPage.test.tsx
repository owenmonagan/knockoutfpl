import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';
import * as AuthContext from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    // Default: user not authenticated
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  });

  describe('PHASE 1: Basic Page Structure', () => {
    it('Step 1: renders with main element', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('Step 2: shows "Dashboard" heading', () => {
      render(<DashboardPage />);
      const heading = screen.getByRole('heading', { name: /dashboard/i });
      expect(heading).toBeInTheDocument();
    });

    it('Step 3: has container with proper spacing', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      // Check for container classes (max-w, mx-auto, padding)
      expect(main).toHaveClass('container');
    });

    it('Step 4: shows welcome message', () => {
      render(<DashboardPage />);
      const welcome = screen.getByText(/welcome/i);
      expect(welcome).toBeInTheDocument();
    });

    it("Step 5: displays user's display name in welcome", () => {
      // Mock authenticated user with display name
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<DashboardPage />);
      const welcome = screen.getByText(/welcome back, test user/i);
      expect(welcome).toBeInTheDocument();
    });
  });

  describe('PHASE 2: FPL Connection Card Integration', () => {
    it('Step 6 (Integration): renders FPLConnectionCard component', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<DashboardPage />);

      // Look for the FPL Connection Card by its title
      const cardTitle = screen.getByRole('heading', { name: /connect your fpl team/i });
      expect(cardTitle).toBeInTheDocument();
    });
  });
});
