// src/lib/bracket.ts

export function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;

  if (roundsFromEnd === 0) return 'Final';
  if (roundsFromEnd === 1) return 'Semi-Finals';
  if (roundsFromEnd === 2) return 'Quarter-Finals';

  return `Round ${roundNumber}`;
}

export function calculateByes(participants: number): number {
  // Find next power of 2
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(participants)));

  // Return the number of byes needed
  return nextPowerOf2 - participants;
}
