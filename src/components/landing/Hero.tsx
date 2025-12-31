import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BracketPreview } from './BracketPreview';

export function Hero() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle radial gradient glow behind content */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 135, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col gap-8">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-display-xl font-bold leading-tight">
              Turn Your FPL League Into a
              <br />
              <span className="text-primary text-glow">Knockout Cup</span>
            </h1>

            {/* Subtext */}
            <p className="text-body-lg text-muted-foreground max-w-lg">
              Head-to-head battles. One survives. Automatic scoring from FPL. No spreadsheets required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="btn-glow h-12 px-8 text-base">
                <Link to="/signup">Create Your Tournament</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border bg-card hover:bg-muted h-12 px-8 text-base">
                <Link to="/demo">View Demo</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span className="text-body-sm">Free to start</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span className="text-body-sm">Official FPL Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column - Bracket Preview */}
          <div className="flex justify-center lg:justify-end">
            <BracketPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
