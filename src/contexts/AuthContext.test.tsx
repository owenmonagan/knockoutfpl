import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

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

    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(mockUser as any);
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
});
