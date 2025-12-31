import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-primary">
            emoji_events
          </span>
          <span className="text-lg font-bold text-foreground">Knockout FPL</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>
          <Button asChild>
            <Link to="/signup">Create Tournament</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
