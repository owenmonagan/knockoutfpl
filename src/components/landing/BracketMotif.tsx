export function BracketMotif() {
  const strokeColor = "#C9A227";
  const strokeWidth = 1.5;
  const bracketWidth = 24;
  const bracketHeight = 16;

  return (
    <svg
      className="animate-bracket-fade"
      width="200"
      height="60"
      viewBox="0 0 200 60"
      fill="none"
      aria-label="Tournament bracket decoration"
      role="img"
    >
      {/* Line from trophy down to finals */}
      <line x1="100" y1="0" x2="100" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} />

      {/* Finals tier - horizontal line with 2 drops */}
      <path
        d="M 50 12 H 150 M 50 12 V 28 M 150 12 V 28"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Semi-finals tier - 4 U-brackets (consistent size) */}
      {/* Left pair */}
      <path
        d={`M ${50 - bracketWidth/2} 44 V 28 H ${50 + bracketWidth/2} V 44`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Left-center */}
      <path
        d={`M ${83 - bracketWidth/2} 44 V 28 H ${83 + bracketWidth/2} V 44`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Right-center */}
      <path
        d={`M ${117 - bracketWidth/2} 44 V 28 H ${117 + bracketWidth/2} V 44`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Right pair */}
      <path
        d={`M ${150 - bracketWidth/2} 44 V 28 H ${150 + bracketWidth/2} V 44`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </svg>
  );
}
