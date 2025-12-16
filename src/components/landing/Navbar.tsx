import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-midnight">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-body-lg font-bold uppercase tracking-wide text-white"
        >
          KNOCKOUT FPL
        </Link>
        <Link
          to="/login"
          className="text-white transition-colors hover:text-gold"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
