// src/lib/bracket.ts
import type { Participant, Round, Match, MatchPlayer } from '../types/tournament';

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

export function generateBracket(participants: Participant[], startGameweek: number): Round[] {
  const numParticipants = participants.length;
  const totalRounds = Math.ceil(Math.log2(numParticipants));
  const byes = calculateByes(numParticipants);

  // Sort participants by seed
  const sorted = [...participants].sort((a, b) => a.seed - b.seed);

  const rounds: Round[] = [];

  // Generate first round with seeding
  const firstRoundMatches = generateFirstRoundMatches(sorted, byes);

  for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
    const matchCount = roundNum === 1
      ? firstRoundMatches.length
      : Math.pow(2, totalRounds - roundNum);

    const matches: Match[] = roundNum === 1
      ? firstRoundMatches
      : Array.from({ length: matchCount }, (_, i) => ({
          id: `r${roundNum}-m${i + 1}`,
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        }));

    rounds.push({
      roundNumber: roundNum,
      name: getRoundName(roundNum, totalRounds),
      gameweek: startGameweek + roundNum - 1,
      matches,
      isComplete: false,
    });
  }

  return rounds;
}

function generateFirstRoundMatches(sortedParticipants: Participant[], byes: number): Match[] {
  const matches: Match[] = [];
  const numParticipants = sortedParticipants.length;
  const bracketSize = numParticipants + byes;
  const numMatches = bracketSize / 2;

  // Standard bracket seeding: seed 1 vs last, seed 2 vs second-last, etc.
  for (let i = 0; i < numMatches; i++) {
    const topSeedIndex = i;
    const bottomSeedIndex = numParticipants - 1 - i;

    const topSeed = sortedParticipants[topSeedIndex];
    const bottomSeed = bottomSeedIndex >= 0 && bottomSeedIndex > topSeedIndex
      ? sortedParticipants[bottomSeedIndex]
      : null;

    const isBye = bottomSeed === null || i >= numParticipants - byes;

    const player1: MatchPlayer = {
      fplTeamId: topSeed.fplTeamId,
      seed: topSeed.seed,
      score: null,
    };

    const player2: MatchPlayer | null = bottomSeed && !isBye
      ? {
          fplTeamId: bottomSeed.fplTeamId,
          seed: bottomSeed.seed,
          score: null,
        }
      : null;

    matches.push({
      id: `r1-m${i + 1}`,
      player1,
      player2,
      winnerId: isBye ? topSeed.fplTeamId : null,
      isBye,
    });
  }

  return matches;
}
