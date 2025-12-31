import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';

// Controls whether the mock returns an authenticated user
let mockAuthenticatedUser: { uid: string; email: string } | null = null;

vi.mock('./lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    onAuthStateChanged: (_auth: any, callback: any) => {
      // Use the mockAuthenticatedUser value at the time of call
      callback(mockAuthenticatedUser);
      return () => {};
    },
  };
});

vi.mock('./services/user', () => ({
  getUserProfile: vi.fn(),
  connectFPLTeam: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock('./services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

// Helper to render with AuthProvider
function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('Router', () => {
  beforeEach(() => {
    // Reset to unauthenticated state before each test
    mockAuthenticatedUser = null;
  });

  it('should render landing page at /', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/'],
    });

    renderWithAuth(<RouterProvider router={testRouter} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Knockout/i);
    expect(heading).toHaveTextContent(/FPL/i);
  });

  it('should render login page at /login', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/login'],
    });

    renderWithAuth(<RouterProvider router={testRouter} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render signup page at /signup', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/signup'],
    });

    renderWithAuth(<RouterProvider router={testRouter} />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('should render forgot password page at /forgot-password', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/forgot-password'],
    });

    renderWithAuth(<RouterProvider router={testRouter} />);
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
  });

  it('should render dashboard page at /dashboard when authenticated', () => {
    // Set authenticated user before rendering
    mockAuthenticatedUser = { uid: 'test-uid', email: 'test@example.com' };

    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/dashboard'],
    });

    renderWithAuth(<RouterProvider router={testRouter} />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should render profile page at /profile when authenticated', async () => {
    // Set authenticated user before rendering
    mockAuthenticatedUser = { uid: 'test-uid', email: 'test@example.com' };

    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/profile'],
    });

    renderWithAuth(<RouterProvider router={testRouter} />);

    // ProfilePage now shows "Profile" heading after loading
    expect(await screen.findByRole('heading', { name: /profile/i })).toBeInTheDocument();
  });

});
