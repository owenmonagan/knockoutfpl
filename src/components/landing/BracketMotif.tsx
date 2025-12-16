export function BracketMotif() {
  const strokeColor = "#C9A227";
  const strokeWidth = 1.5;

  return (
    <svg
      className="animate-bracket-fade"
      width="240"
      height="120"
      viewBox="0 0 240 120"
      fill="none"
      aria-label="Tournament bracket decoration"
      role="img"
    >
      {/* Line from trophy down to finals */}
      <line x1="120" y1="0" x2="120" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />

      {/* Finals tier - 2 branches */}
      <path
        d="M 60 15 H 180 M 60 15 V 35 M 180 15 V 35"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Semi-finals tier - left pair */}
      <path
        d="M 30 35 H 90 M 30 35 V 55 M 90 35 V 55"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Semi-finals tier - right pair */}
      <path
        d="M 150 35 H 210 M 150 35 V 55 M 210 35 V 55"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Semi-finals center connectors */}
      <line x1="60" y1="35" x2="60" y2="55" stroke={strokeColor} strokeWidth={strokeWidth} />
      <line x1="180" y1="35" x2="180" y2="55" stroke={strokeColor} strokeWidth={strokeWidth} />

      {/* Quarter-finals tier - 8 U-brackets at bottom */}
      {/* Far left pair */}
      <path d="M 15 55 H 45 M 15 55 V 75 M 45 55 V 75" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      {/* Left-center pair */}
      <path d="M 75 55 H 105 M 75 55 V 75 M 105 55 V 75" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      {/* Right-center pair */}
      <path d="M 135 55 H 165 M 135 55 V 75 M 165 55 V 75" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      {/* Far right pair */}
      <path d="M 195 55 H 225 M 195 55 V 75 M 225 55 V 75" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />

      {/* Quarter-finals center connectors */}
      <line x1="30" y1="55" x2="30" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} />
      <line x1="90" y1="55" x2="90" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} />
      <line x1="150" y1="55" x2="150" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} />
      <line x1="210" y1="55" x2="210" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} />

      {/* Round of 16 - open U-brackets (8 total) */}
      <path d="M 7 90 V 75 H 23 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M 37 90 V 75 H 53 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M 67 90 V 75 H 83 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M 97 90 V 75 H 113 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M 127 90 V 75 H 143 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M 157 90 V 75 H 173 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M 187 90 V 75 H 203 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M 217 90 V 75 H 233 V 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
}
