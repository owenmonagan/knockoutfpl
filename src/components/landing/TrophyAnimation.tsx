export function TrophyAnimation() {
  return (
    <div
      data-testid="trophy-container"
      className="animate-trophy-rise"
    >
      <div
        className="trophy-css relative"
        aria-label="Championship trophy"
        role="img"
      >
        {/* Globe at top */}
        <div className="trophy-globe" />

        {/* Figures/handles on sides */}
        <div className="trophy-handles" />

        {/* Central body */}
        <div className="trophy-body" />

        {/* Stepped base */}
        <div className="trophy-base">
          <div className="trophy-base-1" />
          <div className="trophy-base-2" />
          <div className="trophy-base-3" />
        </div>

        {/* Shimmer overlay - Pokemon shiny card effect */}
        <div className="trophy-shimmer" data-testid="trophy-shimmer" />
      </div>
    </div>
  );
}
