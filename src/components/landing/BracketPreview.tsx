export function BracketPreview() {
  return (
    <div className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden">
      {/* Subtle grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Trophy with pulse animation */}
        <div className="bg-primary rounded-full p-3 animate-pulse">
          <span className="material-symbols-outlined text-primary-foreground text-2xl">
            emoji_events
          </span>
        </div>

        {/* Winner card */}
        <div className="relative">
          <div className="bg-card border-2 border-primary rounded-lg px-6 py-4 text-center shadow-[0_0_20px_rgba(0,255,135,0.15)]">
            <span className="text-caption text-muted-foreground uppercase tracking-wider">
              Winner
            </span>
            <p className="text-body font-bold text-foreground mt-1">
              The Invincibles
            </p>
          </div>

          {/* Connector line down from winner */}
          <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-border -translate-x-1/2" />
        </div>

        {/* Horizontal connector bar */}
        <div className="relative w-full max-w-[280px]">
          <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-border" />

          {/* Vertical connectors down to seed cards */}
          <div className="absolute top-0 left-1/4 w-0.5 h-6 bg-border -translate-x-1/2" />
          <div className="absolute top-0 right-1/4 w-0.5 h-6 bg-border translate-x-1/2" />
        </div>

        {/* Seed cards */}
        <div className="flex gap-4 w-full max-w-[320px]">
          {/* Seed 1 - Winner */}
          <div className="flex-1 bg-muted border border-border rounded-lg p-4 text-center">
            <span className="inline-block bg-primary/10 text-primary text-caption font-medium px-2 py-0.5 rounded mb-2">
              Seed #1
            </span>
            <p className="text-body-sm font-bold text-foreground truncate">
              The Invincibles
            </p>
            <p className="text-heading-2 font-bold text-primary mt-2">
              72
            </p>
          </div>

          {/* Seed 8 - Eliminated */}
          <div className="flex-1 bg-muted border border-border rounded-lg p-4 text-center opacity-60">
            <span className="inline-block bg-muted text-muted-foreground text-caption font-medium px-2 py-0.5 rounded border border-border mb-2">
              Seed #8
            </span>
            <p className="text-body-sm font-bold text-foreground truncate">
              Underdog United
            </p>
            <p className="text-heading-2 font-bold text-muted-foreground mt-2">
              58
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
