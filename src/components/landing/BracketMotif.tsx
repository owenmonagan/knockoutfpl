export function BracketMotif() {
  return (
    <svg
      className="animate-bracket-fade"
      width="200"
      height="80"
      viewBox="0 0 200 80"
      fill="none"
      aria-label="Tournament bracket decoration"
      role="img"
    >
      {/* Left bracket arm */}
      <path
        d="M 20 70 L 20 50 L 50 50 L 50 30"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right bracket arm */}
      <path
        d="M 180 70 L 180 50 L 150 50 L 150 30"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center connector to trophy position */}
      <path
        d="M 50 30 L 50 15 L 100 15 M 150 30 L 150 15 L 100 15"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Small boxes representing teams */}
      <rect x="10" y="70" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
      <rect x="170" y="70" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
      <rect x="40" y="45" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
      <rect x="140" y="45" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
    </svg>
  );
}
