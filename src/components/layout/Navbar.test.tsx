import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

// Mock the auth service
vi.mock('../../services/auth', () => ({
  signOut: vi.fn(() => Promise.resolve()),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavbar = (variant: 'landing' | 'auth' | 'authenticated' = 'landing') => {
    return render(
      <BrowserRouter>
        <Navbar variant={variant} />
      </BrowserRouter>
    );
  };

  describe('common behavior', () => {
    it('renders without crashing', () => {
      renderNavbar();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('displays KNOCKOUT FPL logo text', () => {
      renderNavbar();
      expect(screen.getByText('KNOCKOUT FPL')).toBeInTheDocument();
    });
  });

  describe('landing variant', () => {
    it('displays Login link', () => {
      renderNavbar('landing');
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });

    it('Login link navigates to /login', () => {
      renderNavbar('landing');
      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('logo links to home page', () => {
      renderNavbar('landing');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('has dark background', () => {
      renderNavbar('landing');
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-midnight');
    });
  });

  describe('auth variant', () => {
    it('displays Back to home link', () => {
      renderNavbar('auth');
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
    });

    it('Back to home link navigates to /', () => {
      renderNavbar('auth');
      const backLink = screen.getByRole('link', { name: /back to home/i });
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('logo links to home page', () => {
      renderNavbar('auth');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('has dark background', () => {
      renderNavbar('auth');
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-midnight');
    });

    it('does not display Login link', () => {
      renderNavbar('auth');
      expect(screen.queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument();
    });
  });

  describe('authenticated variant', () => {
    it('displays Logout button', () => {
      renderNavbar('authenticated');
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('logo links to dashboard', () => {
      renderNavbar('authenticated');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });

    it('has light background with border', () => {
      renderNavbar('authenticated');
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-white');
      expect(nav).toHaveClass('border-b');
    });

    it('calls signOut and navigates to / when Logout clicked', async () => {
      const { signOut } = await import('../../services/auth');
      const user = userEvent.setup();

      renderNavbar('authenticated');
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      await user.click(logoutButton);

      expect(signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
