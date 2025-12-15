// src/components/tournament/CreateTournamentButton.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Trophy } from 'lucide-react';

interface CreateTournamentButtonProps {
  onCreate: () => Promise<void>;
}

export function CreateTournamentButton({ onCreate }: CreateTournamentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleClick}
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Tournament...
          </>
        ) : (
          <>
            <Trophy className="mr-2 h-4 w-4" />
            Create Tournament
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
