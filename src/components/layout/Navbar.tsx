import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { signOut } from '../../services/auth';

interface NavbarProps {
  variant: 'landing' | 'auth' | 'authenticated';
}

export function Navbar({ variant }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isDark = variant === 'landing' || variant === 'auth';
  const logoHref = variant === 'authenticated' ? '/dashboard' : '/';

  return (
    <nav
      className={`sticky top-0 z-50 ${
        isDark ? 'bg-midnight' : 'bg-white border-b border-gray-200'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={logoHref}
          className={`text-body-lg font-bold uppercase tracking-wide ${
            isDark ? 'text-white' : 'text-midnight'
          }`}
        >
          KNOCKOUT FPL
        </Link>

        {variant === 'landing' && (
          <Link
            to="/login"
            className="text-white transition-colors hover:text-gold"
          >
            Login
          </Link>
        )}

        {variant === 'auth' && (
          <Link
            to="/"
            className="text-white transition-colors hover:text-gold"
          >
            ← Back to home
          </Link>
        )}

        {variant === 'authenticated' && (
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
