export function getInitials(teamName: string): string {
  const words = teamName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '??';
  }

  if (words.length === 1) {
    // Single word: take first two characters
    return words[0].substring(0, 2).toUpperCase();
  }

  // Multiple words: take first character of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}
