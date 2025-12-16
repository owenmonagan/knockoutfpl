export function getStakesCallout(
  userScore: number,
  opponentScore: number,
  isUserMatch: boolean
): string {
  if (!isUserMatch) return '';

  const diff = userScore - opponentScore;
  const absDiff = Math.abs(diff);

  if (diff > 0) {
    // User is winning
    if (absDiff === 1) {
      return '⚡ 1 point from elimination';
    } else if (absDiff <= 10) {
      return `⚡ ${absDiff} points from elimination`;
    } else if (absDiff <= 20) {
      return `⚡ Holding on. ${absDiff} point cushion.`;
    } else {
      return `⚡ Cruising. ${absDiff} point lead.`;
    }
  } else if (diff < 0) {
    // User is losing
    if (absDiff === 1) {
      return '⚡ 1 point from survival';
    } else if (absDiff <= 10) {
      return `⚡ ${absDiff} points from survival`;
    } else if (absDiff <= 20) {
      return `⚡ ${absDiff} behind. Time to fight.`;
    } else {
      return `⚡ Danger zone. ${absDiff} points to make up.`;
    }
  } else {
    // Tied
    return '⚡ Dead heat.';
  }
}
