export function TrophyAnimation() {
  return (
    <div
      data-testid="trophy-container"
      className="animate-trophy-rise"
    >
      <svg
        width="80"
        height="100"
        viewBox="0 0 64 80"
        fill="#C9A227"
        aria-label="Championship trophy"
        role="img"
      >
        {/* Globe/Earth at top */}
        <circle cx="32" cy="14" r="12" />
        <ellipse cx="32" cy="14" rx="12" ry="4" fill="#0D1F3C" opacity="0.2" />
        <path d="M32 2 Q38 8 38 14 Q38 20 32 26 Q26 20 26 14 Q26 8 32 2" fill="#0D1F3C" opacity="0.15" />

        {/* Left figure holding globe */}
        <path d="M20 26 Q16 22 18 18 L22 22 Q24 24 24 28 L24 38 Q22 40 20 38 L20 26Z" />
        <circle cx="18" cy="16" r="3" />

        {/* Right figure holding globe */}
        <path d="M44 26 Q48 22 46 18 L42 22 Q40 24 40 28 L40 38 Q42 40 44 38 L44 26Z" />
        <circle cx="46" cy="16" r="3" />

        {/* Central stem connecting figures */}
        <path d="M28 28 L28 50 L36 50 L36 28 Q34 30 32 30 Q30 30 28 28Z" />

        {/* Decorative middle section */}
        <ellipse cx="32" cy="42" rx="8" ry="3" />

        {/* Base pedestal */}
        <path d="M24 50 L24 56 L40 56 L40 50 Z" />
        <path d="M20 56 L20 62 L44 62 L44 56 Z" />
        <path d="M16 62 L16 68 L48 68 L48 62 Z" />

        {/* Base plate */}
        <rect x="12" y="68" width="40" height="6" rx="2" />
      </svg>
    </div>
  );
}
