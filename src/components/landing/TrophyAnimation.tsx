export function TrophyAnimation() {
  return (
    <div
      data-testid="trophy-container"
      className="animate-trophy-rise"
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="#C9A227"
        aria-label="Championship trophy"
        role="img"
      >
        {/* Trophy cup */}
        <path d="M12 2C13.1 2 14 2.9 14 4V5H16C16.5 5 17 5.22 17.41 5.59C17.79 5.95 18 6.45 18 7V8C18 9.1 17.1 10 16 10H14.82C14.4 11.17 13.3 12 12 12C10.7 12 9.6 11.17 9.18 10H8C6.9 10 6 9.1 6 8V7C6 6.45 6.21 5.95 6.59 5.59C7 5.22 7.5 5 8 5H10V4C10 2.9 10.9 2 12 2ZM16 7H14V8H16V7ZM10 7H8V8H10V7Z" />
        {/* Trophy stem */}
        <path d="M11 12.5V15H13V12.5C12.7 12.5 12.35 12.5 12 12.5C11.65 12.5 11.3 12.5 11 12.5Z" />
        {/* Trophy base */}
        <path d="M8 17V19H16V17H8ZM7 21V19H17V21C17 21.55 16.55 22 16 22H8C7.45 22 7 21.55 7 21Z" />
      </svg>
    </div>
  );
}
