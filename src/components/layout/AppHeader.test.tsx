import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppHeader } from './AppHeader';

const mockNavigate = vi.fn();
const mockSignOut = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/services/auth', () => ({
  signOut: () => mockSignOut(),
}));

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHeader = (variant: 'landing' | 'auth' | 'authenticated', authPage?: 'login' | 'signup' | 'forgot-password') => {
    return render(
      <MemoryRouter>
        <AppHeader variant={variant} authPage={authPage} />
      </MemoryRouter>
    );
  };

  describe('common elements', () => {
    it('renders logo with trophy icon and text', () => {
      renderHeader('landing');
      expect(screen.getByText('Knockout FPL')).toBeInTheDocument();
      expect(screen.getByText('emoji_events')).toBeInTheDocument();
    });

    it('has sticky header with backdrop blur', () => {
      renderHeader('landing');
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'backdrop-blur-md');
    });
  });

  describe('landing variant', () => {
    it('shows Login link', () => {
      renderHeader('landing');
      expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    });

    it('shows Create Tournament button', () => {
      renderHeader('landing');
      expect(screen.getByRole('link', { name: 'Create Tournament' })).toHaveAttribute('href', '/signup');
    });

    it('logo links to home', () => {
      renderHeader('landing');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('auth variant', () => {
    it('shows Sign Up link on login page', () => {
      renderHeader('auth', 'login');
      expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup');
    });

    it('shows Log In link on signup page', () => {
      renderHeader('auth', 'signup');
      expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
    });

    it('shows Log In link on forgot-password page', () => {
      renderHeader('auth', 'forgot-password');
      expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
    });

    it('logo links to home', () => {
      renderHeader('auth', 'login');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('authenticated variant', () => {
    it('shows Logout button', () => {
      renderHeader('authenticated');
      expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    });

    it('logo links to /leagues', () => {
      renderHeader('authenticated');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/leagues');
    });

    it('calls signOut and navigates home on logout', async () => {
      const user = userEvent.setup();
      renderHeader('authenticated');

      await user.click(screen.getByRole('button', { name: 'Logout' }));

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
