import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { signOut } from '@/services/auth';

interface AppHeaderProps {
  variant: 'landing' | 'auth' | 'authenticated';
  authPage?: 'login' | 'signup' | 'forgot-password';
}

export function AppHeader({ variant, authPage }: AppHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const logoHref = variant === 'authenticated' ? '/leagues' : '/';

  const renderRightContent = () => {
    switch (variant) {
      case 'landing':
        return (
          <>
            <Link
              to="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Button asChild>
              <Link to="/signup">Create Tournament</Link>
            </Button>
          </>
        );

      case 'auth':
        if (authPage === 'login') {
          return (
            <Link
              to="/signup"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign Up
            </Link>
          );
        }
        return (
          <Link
            to="/login"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Log In
          </Link>
        );

      case 'authenticated':
        return (
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to={logoHref} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-primary">
            emoji_events
          </span>
          <span className="text-lg font-bold text-foreground">Knockout FPL</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">{renderRightContent()}</nav>
      </div>
    </header>
  );
}
