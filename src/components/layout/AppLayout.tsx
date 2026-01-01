import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from './Navbar';

type NavbarVariant = 'landing' | 'auth' | 'authenticated';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password'];

export function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const getNavbarVariant = (): NavbarVariant => {
    const path = location.pathname;

    // Landing page
    if (path === '/') {
      return 'landing';
    }

    // Auth pages always use auth variant
    if (AUTH_PATHS.includes(path)) {
      return 'auth';
    }

    // Authenticated users get authenticated variant
    if (isAuthenticated) {
      return 'authenticated';
    }

    // Default to auth (for public pages like /league/:id when not logged in)
    return 'auth';
  };

  const navbarVariant = getNavbarVariant();

  return (
    <>
      {/* Landing page has its own LandingHeader, skip the app navbar */}
      {navbarVariant !== 'landing' && <Navbar variant={navbarVariant} />}
      <Outlet />
    </>
  );
}
