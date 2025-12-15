import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AUTH_TIMEOUT_MS = 5000; // 5 seconds

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  connectionError: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let hasResolved = false;

    // Set timeout to detect connection failures
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        setConnectionError(true);
        setLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      hasResolved = true;
      clearTimeout(timeoutId);
      setUser(firebaseUser);
      setLoading(false);
      setConnectionError(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    connectionError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
