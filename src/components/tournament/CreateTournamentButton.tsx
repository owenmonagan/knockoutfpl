// src/components/tournament/CreateTournamentButton.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Trophy } from 'lucide-react';
import { CreationProgressChecklist } from './CreationProgressChecklist';

interface CreateTournamentButtonProps {
  onCreate: () => Promise<void>;
}

export function CreateTournamentButton({ onCreate }: CreateTournamentButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsCreating(true);
    setIsComplete(false);
    setError(null);

    try {
      await onCreate();
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

  return (
    <Button
      onClick={handleClick}
      disabled={isCreating}
      size="lg"
      className="w-full"
    >
      <Trophy className="mr-2 h-4 w-4" />
      Create Tournament
    </Button>
  );
}
