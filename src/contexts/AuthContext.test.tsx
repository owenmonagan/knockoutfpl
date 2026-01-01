import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';

// Mock Firebase Auth before imports
vi.mock('firebase/auth');
vi.mock('../lib/firebase', () => ({
  auth: {},
}));

import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide loading state initially', () => {
    vi.mocked(onAuthStateChanged).mockImplementation(() => () => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should set user when onAuthStateChanged is called with a user', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' };

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      if (typeof callback === 'function') {
        callback(mockUser as any);
      }
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId('authenticated')).toHaveTextContent('true');
    expect(await screen.findByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  describe('timeout behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('sets connectionError after timeout when auth state never resolves', async () => {
      // Mock onAuthStateChanged to never call the callback
      vi.mocked(onAuthStateChanged).mockImplementation(() => {
        // Return unsubscribe but never call callback
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.connectionError).toBe(false);

      // Fast-forward past timeout (5 seconds)
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Should have error state
      expect(result.current.loading).toBe(false);
      expect(result.current.connectionError).toBe(true);
    });

    it('clears timeout when auth state resolves before timeout fires', async () => {
      let authCallback: ((user: any) => void) | undefined;
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        if (typeof callback === 'function') {
          authCallback = callback;
        }
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Advance 3 seconds (before 5s timeout)
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Then auth resolves with null user
      await act(async () => {
        if (authCallback) authCallback(null);
      });

      // Should not have error despite waiting
      expect(result.current.loading).toBe(false);
      expect(result.current.connectionError).toBe(false);

      // Advance past original timeout - should still be no error
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.connectionError).toBe(false);
    });
  });
});
