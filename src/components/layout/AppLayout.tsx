import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppHeader } from './AppHeader';

type HeaderVariant = 'landing' | 'auth' | 'authenticated';
type AuthPage = 'login' | 'signup' | 'forgot-password';

const AUTH_PATH_MAP: Record<string, AuthPage> = {
  '/login': 'login',
  '/signup': 'signup',
  '/forgot-password': 'forgot-password',
};

export function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const getHeaderVariant = (): HeaderVariant => {
    const path = location.pathname;

    if (path === '/') {
      return 'landing';
    }

    if (path in AUTH_PATH_MAP) {
      return 'auth';
    }

    if (isAuthenticated) {
      return 'authenticated';
    }

    return 'auth';
  };

  const headerVariant = getHeaderVariant();
  const authPage = AUTH_PATH_MAP[location.pathname];

  return (
    <>
      <AppHeader variant={headerVariant} authPage={authPage} />
      <Outlet />
    </>
  );
}
