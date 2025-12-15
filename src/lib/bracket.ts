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

export function determineMatchWinner(match: Match): number | null {
  // Handle bye matches
  if (match.isBye && match.player1) {
    return match.player1.fplTeamId;
  }

  // Need both players with scores to determine winner
  if (!match.player1?.score || !match.player2?.score) {
    return null;
  }

  // Higher score wins
  if (match.player1.score > match.player2.score) {
    return match.player1.fplTeamId;
  }
  if (match.player2.score > match.player1.score) {
    return match.player2.fplTeamId;
  }

  // Tie: higher seed (lower number) wins
  if (match.player1.seed < match.player2.seed) {
    return match.player1.fplTeamId;
  }
  return match.player2.fplTeamId;
}

export function advanceWinnersToNextRound(
  rounds: Round[],
  completedRoundNumber: number,
  participants: Participant[]
): Round[] {
  const currentRoundIndex = completedRoundNumber - 1;
  const nextRoundIndex = completedRoundNumber;

  // No next round to advance to
  if (nextRoundIndex >= rounds.length) {
    return rounds;
  }

  const currentRound = rounds[currentRoundIndex];

  // Round not complete yet
  if (!currentRound.isComplete) {
    return rounds;
  }

  // Clone rounds to avoid mutation
  const updatedRounds = JSON.parse(JSON.stringify(rounds)) as Round[];
  const nextRound = updatedRounds[nextRoundIndex];

  // Get winners from current round
  const winners = currentRound.matches
    .map((match) => match.winnerId)
    .filter((id): id is number => id !== null);

  // Assign winners to next round matches
  for (let i = 0; i < nextRound.matches.length; i++) {
    const winner1Index = i * 2;
    const winner2Index = i * 2 + 1;

    if (winners[winner1Index] !== undefined) {
      const participant = participants.find((p) => p.fplTeamId === winners[winner1Index]);
      if (participant) {
        nextRound.matches[i].player1 = {
          fplTeamId: participant.fplTeamId,
          seed: participant.seed,
          score: null,
        };
      }
    }

    if (winners[winner2Index] !== undefined) {
      const participant = participants.find((p) => p.fplTeamId === winners[winner2Index]);
      if (participant) {
        nextRound.matches[i].player2 = {
          fplTeamId: participant.fplTeamId,
          seed: participant.seed,
          score: null,
        };
      }
    }
  }

  return updatedRounds;
}
