import { useState, useEffect } from 'react';
import { getFPLTeamInfo } from '../services/fpl';
import type { FPLTeamInfo } from '../services/fpl';
import { calculateAveragePoints, calculateForm, calculateAdvantage } from '../lib/teamStats';
import type { AdvantageResult } from '../lib/teamStats';

interface HeadToHeadPreviewProps {
  creatorFplId: number;
  creatorName: string;
  opponentFplId: number;
  opponentName: string;
  gameweek: number;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function HeadToHeadPreview({
  creatorFplId,
  creatorName,
  opponentFplId,
  opponentName,
  gameweek,
}: HeadToHeadPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [creatorData, setCreatorData] = useState<FPLTeamInfo | null>(null);
  const [opponentData, setOpponentData] = useState<FPLTeamInfo | null>(null);
  const [creatorAvg, setCreatorAvg] = useState<number | null>(null);
  const [opponentAvg, setOpponentAvg] = useState<number | null>(null);
  const [creatorForm, setCreatorForm] = useState<string | null>(null);
  const [opponentForm, setOpponentForm] = useState<string | null>(null);
  const [advantage, setAdvantage] = useState<AdvantageResult | null>(null);

  useEffect(() => {
    Promise.all([
      getFPLTeamInfo(creatorFplId),
      getFPLTeamInfo(opponentFplId),
      calculateAveragePoints(creatorFplId, gameweek),
      calculateAveragePoints(opponentFplId, gameweek),
      calculateForm(creatorFplId, gameweek),
      calculateForm(opponentFplId, gameweek),
    ]).then(([creator, opponent, creatorAverage, opponentAverage, creatorFormData, opponentFormData]) => {
      setCreatorData(creator);
      setOpponentData(opponent);
      setCreatorAvg(creatorAverage);
      setOpponentAvg(opponentAverage);
      setCreatorForm(creatorFormData);
      setOpponentForm(opponentFormData);

      const advantageResult = calculateAdvantage(creatorAverage, opponentAverage);
      setAdvantage(advantageResult);

      setLoading(false);
    });
  }, [creatorFplId, opponentFplId, gameweek]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <div className="font-bold">{creatorName}</div>
        </div>
        <span className="text-2xl font-bold text-muted-foreground">VS</span>
        <div className="flex-1 text-center">
          <div className="font-bold">{opponentName}</div>
        </div>
      </div>
      <div data-testid="team-separator" className="border-t border-gray-300 my-4" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          {creatorData && (
            <>
              <div>🎯 Rank: {formatNumber(creatorData.overallRank)}</div>
              <div>Points: {formatNumber(creatorData.overallPoints)}</div>
            </>
          )}
          {creatorAvg !== null && (
            <div>📈 Avg: {creatorAvg} pts/GW</div>
          )}
          {creatorForm !== null && (
            <div>🔥 Form: {creatorForm}</div>
          )}
        </div>
        <div className="flex-1 text-center">
          {opponentData && (
            <>
              <div>🎯 Rank: {formatNumber(opponentData.overallRank)}</div>
              <div>Points: {formatNumber(opponentData.overallPoints)}</div>
            </>
          )}
          {opponentAvg !== null && (
            <div>📈 Avg: {opponentAvg} pts/GW</div>
          )}
          {opponentForm !== null && (
            <div>🔥 Form: {opponentForm}</div>
          )}
        </div>
      </div>
      {advantage !== null && (
        <div className="text-center mt-2">{advantage.message}</div>
      )}
    </>
  );
}
