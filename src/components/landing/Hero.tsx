import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';

export function Hero() {
  return (
    <section className="container flex flex-col items-center justify-center gap-8 py-20 md:py-32">
      <Badge variant="secondary" className="gap-2">
        <Trophy className="h-3 w-3" />
        Now Live - Challenge Your Friends
      </Badge>

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Knockout{' '}
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            FPL
          </span>
        </h1>
        <p className="max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
          Head-to-head Fantasy Premier League challenges. Battle your friends each gameweek and track your winning record.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link to="/signup" className={buttonVariants({ size: 'lg', className: 'min-w-[200px]' })}>
          Get Started
        </Link>
        <Link to="/login" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'min-w-[200px]' })}>
          Log In
        </Link>
      </div>
    </section>
  );
}
