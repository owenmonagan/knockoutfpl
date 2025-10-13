import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { uid: 'test-uid' } as any,
      loading: false,
      isAuthenticated: true,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show skeleton loading state when loading', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Should show skeleton (check for skeleton class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // Should NOT show protected content while loading
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
