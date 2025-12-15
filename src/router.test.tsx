import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';

vi.mock('./lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('./services/user', () => ({
  getUserProfile: vi.fn(),
  connectFPLTeam: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock('./services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

describe('Router', () => {
  it('should render landing page at /', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={testRouter} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Knockout/i);
    expect(heading).toHaveTextContent(/FPL/i);
  });

  it('should render login page at /login', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/login'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render signup page at /signup', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/signup'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('should render dashboard page at /dashboard when authenticated', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/dashboard'],
    });

    // Mock Firebase onAuthStateChanged to provide authenticated user
    vi.mock('firebase/auth', async () => {
      const actual = await vi.importActual('firebase/auth');
      return {
        ...actual,
        onAuthStateChanged: (auth: any, callback: any) => {
          callback({ uid: 'test-uid', email: 'test@example.com' });
          return () => {};
        },
      };
    });

    render(
      <AuthProvider>
        <RouterProvider router={testRouter} />
      </AuthProvider>
    );
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should render profile page at /profile when authenticated', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/profile'],
    });

    // Mock Firebase onAuthStateChanged to provide authenticated user
    vi.mock('firebase/auth', async () => {
      const actual = await vi.importActual('firebase/auth');
      return {
        ...actual,
        onAuthStateChanged: (auth: any, callback: any) => {
          callback({ uid: 'test-uid', email: 'test@example.com' });
          return () => {};
        },
      };
    });

    render(
      <AuthProvider>
        <RouterProvider router={testRouter} />
      </AuthProvider>
    );
    expect(screen.getByText(/connect your fpl team/i)).toBeInTheDocument();
  });

  it('should render test data page at /test-data', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/test-data'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText(/test data generator/i)).toBeInTheDocument();
  });
});
