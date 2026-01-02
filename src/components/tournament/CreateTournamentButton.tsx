// src/components/tournament/CreateTournamentButton.tsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Trophy } from 'lucide-react';
import { CreationProgressChecklist } from './CreationProgressChecklist';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { getFPLBootstrapData } from '../../services/fpl';
import { TournamentPreview } from './TournamentPreview';

interface CreateTournamentButtonProps {
  onCreate: (startEvent: number, matchSize: number) => Promise<void>;
  managerCount: number;
}

export function CreateTournamentButton({ onCreate, managerCount }: CreateTournamentButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);
  const [selectedGameweek, setSelectedGameweek] = useState<number>(1);
  const [matchSize, setMatchSize] = useState<number>(2);

  useEffect(() => {
    async function loadBootstrapData() {
      try {
        const data = await getFPLBootstrapData();
        setCurrentGameweek(data.currentGameweek);
        // Default to next gameweek, but cap at 38
        const nextGameweek = Math.min(data.currentGameweek + 1, 38);
        setSelectedGameweek(nextGameweek);
      } catch {
        // On error, default to GW 1
        setCurrentGameweek(null);
        setSelectedGameweek(1);
      }
    }
    loadBootstrapData();
  }, []);

  const handleClick = async () => {
    setIsCreating(true);
    setIsComplete(false);
    setError(null);

    try {
      await onCreate(selectedGameweek, matchSize);
      setIsComplete(true);
      // Brief pause to show completion state before parent handles navigation
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsComplete(false);
    handleClick();
  };

  if (isCreating || error) {
    return (
      <CreationProgressChecklist
        isActive={isCreating}
        isComplete={isComplete}
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  const gameweeks = Array.from({ length: 38 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gameweek-select">Starting Gameweek</Label>
        <Select
          value={selectedGameweek.toString()}
          onValueChange={(value) => setSelectedGameweek(parseInt(value, 10))}
          disabled={isCreating}
        >
          <SelectTrigger id="gameweek-select">
            <SelectValue placeholder="Select gameweek" />
          </SelectTrigger>
          <SelectContent>
            {gameweeks.map((gw) => (
              <SelectItem key={gw} value={gw.toString()}>
                GW {gw}{gw === currentGameweek ? ' (current)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="match-size-select">Match Size</Label>
        <Select
          value={matchSize.toString()}
          onValueChange={(value) => setMatchSize(parseInt(value, 10))}
          disabled={isCreating}
        >
          <SelectTrigger id="match-size-select">
            <SelectValue placeholder="Select match size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">1v1 (Traditional)</SelectItem>
            <SelectItem value="3">3-way (Top 1 advances)</SelectItem>
            <SelectItem value="4">4-way (Top 1 advances)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TournamentPreview
        managerCount={managerCount}
        matchSize={matchSize}
        startGameweek={selectedGameweek}
      />

      <Button
        onClick={handleClick}
        disabled={isCreating}
        size="lg"
        className="w-full"
      >
        <Trophy className="mr-2 h-4 w-4" />
        Create Tournament
      </Button>
    </div>
  );
}
