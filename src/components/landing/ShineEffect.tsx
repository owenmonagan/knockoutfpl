export function ShineEffect() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {/* Radial burst - expands outward from center */}
      <div
        data-testid="shine-burst"
        className="animate-shine-burst absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full opacity-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(201,162,39,0.6) 40%, transparent 70%)',
        }}
      />

      {/* Diagonal shimmer sweep - holographic card effect */}
      <div
        data-testid="shimmer-overlay"
        className="animate-shimmer absolute left-1/2 top-0 h-24 w-48 -translate-x-1/2 opacity-30"
        style={{
          background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}
