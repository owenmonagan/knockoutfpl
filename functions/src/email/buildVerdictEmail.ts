/**
 * Build Verdict Email Content
 *
 * Generates subject line and HTML body for verdict emails.
 * Groups results into: Championships, Victories, Eliminations
 */

import { VerdictMatchResult } from '../dataconnect-mutations';

export interface VerdictEmailContent {
  subject: string;
  htmlBody: string;
}

interface GroupedResults {
  championships: VerdictMatchResult[];
  victories: VerdictMatchResult[];
  eliminations: VerdictMatchResult[];
}

function groupResults(results: VerdictMatchResult[]): GroupedResults {
  return {
    championships: results.filter(r => r.isChampionship && r.won),
    victories: results.filter(r => r.won && !r.isChampionship),
    eliminations: results.filter(r => !r.won && !r.isBye),
  };
}

function buildSubject(event: number, grouped: GroupedResults): string {
  const { championships, victories, eliminations } = grouped;

  if (championships.length > 0) {
    const extra = victories.length + eliminations.length;
    return extra > 0
      ? `GW${event}: You're a champion. Plus ${extra} more results.`
      : `GW${event}: You're a champion.`;
  }

  if (victories.length > 0 && eliminations.length > 0) {
    const vWord = victories.length === 1 ? 'victory' : 'victories';
    const eWord = eliminations.length === 1 ? 'elimination' : 'eliminations';
    return `GW${event}: ${victories.length} ${vWord}. ${eliminations.length} ${eWord}.`;
  }

  if (victories.length > 0) {
    return `GW${event}: All ${victories.length} matches won. The run continues.`;
  }

  return `GW${event}: Tough week. But you can still watch.`;
}

function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;
  switch (roundsFromEnd) {
    case 0: return 'Final';
    case 1: return 'Semi-final';
    case 2: return 'Quarter-final';
    default: return `Round of ${Math.pow(2, roundsFromEnd + 1)}`;
  }
}

function buildResultCard(result: VerdictMatchResult, type: 'championship' | 'victory' | 'elimination'): string {
  const roundName = getRoundName(result.roundNumber, result.totalRounds);
  const scoreDisplay = result.userScore !== null && result.opponentScore !== null
    ? `You ${result.userScore} - ${result.opponentScore} ${result.opponentTeamName}`
    : `vs ${result.opponentTeamName}`;

  let outcome = '';
  if (type === 'championship') {
    outcome = 'You won the whole thing.';
  } else if (type === 'victory') {
    const nextRound = getRoundName(result.roundNumber + 1, result.totalRounds);
    outcome = `You advance to the ${nextRound}.`;
  } else {
    outcome = 'Eliminated. You can still watch the bracket.';
  }

  const borderColor = type === 'championship' ? '#FFD700' : type === 'victory' ? '#22C55E' : '#6B7280';

  return `
    <div style="border-left: 4px solid ${borderColor}; padding: 12px 16px; margin: 8px 0; background: #F9FAFB;">
      <div style="font-weight: 600; color: #111827;">${result.tournamentName}</div>
      <div style="color: #6B7280; font-size: 14px;">${roundName}</div>
      <div style="margin-top: 8px; font-size: 16px;">${scoreDisplay}</div>
      <div style="margin-top: 4px; color: #374151; font-size: 14px;">${outcome}</div>
    </div>
  `;
}

function buildHtmlBody(event: number, grouped: GroupedResults): string {
  const { championships, victories, eliminations } = grouped;

  let sectionsHtml = '';

  // Championships section
  if (championships.length > 0) {
    sectionsHtml += `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #B45309; font-size: 14px; font-weight: 600; margin-bottom: 12px;">CHAMPION</h2>
        ${championships.map(r => buildResultCard(r, 'championship')).join('')}
      </div>
    `;
  }

  // Victories section
  if (victories.length > 0) {
    sectionsHtml += `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #15803D; font-size: 14px; font-weight: 600; margin-bottom: 12px;">VICTORIES</h2>
        ${victories.map(r => buildResultCard(r, 'victory')).join('')}
      </div>
    `;
  }

  // Eliminations section
  if (eliminations.length > 0) {
    sectionsHtml += `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #6B7280; font-size: 14px; font-weight: 600; margin-bottom: 12px;">ELIMINATIONS</h2>
        ${eliminations.map(r => buildResultCard(r, 'elimination')).join('')}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111827; font-size: 20px; margin: 0;">KNOCKOUT FPL</h1>
        </div>

        <div style="color: #6B7280; font-size: 14px; margin-bottom: 24px; text-align: center;">
          GAMEWEEK ${event} · FINAL RESULTS
        </div>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">

        ${sectionsHtml}

        <div style="text-align: center; margin-top: 32px;">
          <a href="https://knockoutfpl.com" style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View All Brackets
          </a>
        </div>

        <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px;">
          Knockout FPL
        </div>
      </div>
    </body>
    </html>
  `;
}

export function buildVerdictEmail(
  event: number,
  results: VerdictMatchResult[]
): VerdictEmailContent {
  const grouped = groupResults(results);

  return {
    subject: buildSubject(event, grouped),
    htmlBody: buildHtmlBody(event, grouped),
  };
}
