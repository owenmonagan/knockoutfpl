export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-primary">
            emoji_events
          </span>
          <span className="text-lg font-bold text-foreground">Knockout FPL</span>
        </div>

        {/* Tagline */}
        <p className="max-w-lg text-body text-muted-foreground">
          The ultimate companion tool for your Fantasy Premier League season.
          Create cups, track scores, and crown a champion.
        </p>

        {/* Copyright */}
        <p className="text-body-sm text-muted-foreground">
          &copy; 2025 Knockout FPL. Not affiliated with the Premier League or
          Fantasy Premier League.
        </p>
      </div>
    </footer>
  );
}
