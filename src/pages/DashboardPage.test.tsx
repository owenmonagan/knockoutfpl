import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import * as AuthContext from '../contexts/AuthContext';

const mockNavigate = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Default: user not authenticated
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  });

  describe('Basic Page Structure', () => {
    it('renders with main element', () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('shows "Dashboard" heading', () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
      const heading = screen.getByRole('heading', { name: /dashboard/i });
      expect(heading).toBeInTheDocument();
    });

    it('has container with proper spacing', () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
      const main = screen.getByRole('main');
      expect(main).toHaveClass('container');
    });

    it('shows welcome message', () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
      const welcome = screen.getByText(/welcome/i);
      expect(welcome).toBeInTheDocument();
    });

    it("displays user's display name in welcome message", () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
      const welcome = screen.getByText(/welcome back, test user/i);
      expect(welcome).toBeInTheDocument();
    });
  });

  describe('View Leagues Button', () => {
    it('renders View Your Leagues button', () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
      const button = screen.getByRole('button', { name: /view your leagues/i });
      expect(button).toBeInTheDocument();
    });

    it('navigates to /leagues when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      const button = screen.getByRole('button', { name: /view your leagues/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/leagues');
    });
  });
});
