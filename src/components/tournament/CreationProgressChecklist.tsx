import { useEffect, useState, useRef } from 'react';
import { Circle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import type { TournamentImportStatus } from '../../services/tournament';

type StepStatus = 'pending' | 'in-progress' | 'complete' | 'error';

interface CreationStep {
  id: string;
  label: string;
  duration: number;
}

// Steps for small tournaments (time-based progression)
const SMALL_TOURNAMENT_STEPS: CreationStep[] = [
  { id: 'fetchingData', label: 'Fetching league data', duration: 1200 },
  { id: 'generating', label: 'Generating bracket', duration: 400 },
  { id: 'savingPlayers', label: 'Saving players', duration: 1500 },
  { id: 'buildingBracket', label: 'Building bracket', duration: 2000 },
  { id: 'complete', label: 'Tournament ready!', duration: 0 },
];

// Steps for large tournaments (backend status-based)
const LARGE_TOURNAMENT_STEPS: CreationStep[] = [
  { id: 'pending', label: 'Initializing import...', duration: 0 },
  { id: 'importing', label: 'Importing players from FPL', duration: 0 },
  { id: 'creating_rounds', label: 'Creating tournament rounds', duration: 0 },
  { id: 'creating_matches', label: 'Building bracket structure', duration: 0 },
  { id: 'creating_picks', label: 'Finalizing match assignments', duration: 0 },
  { id: 'complete', label: 'Tournament ready!', duration: 0 },
];

// Map backend status to step index
function getStepIndexFromStatus(status: string | null): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'importing':
      return 1;
    case 'creating_rounds':
      return 2;
    case 'creating_matches':
      return 3;
    case 'creating_picks':
      return 4;
    case 'complete':
      return 5;
    default:
      return 0;
  }
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'pending':
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    case 'in-progress':
      return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    case 'complete':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-destructive" />;
  }
}

interface CreationProgressChecklistProps {
  isActive: boolean;
  isComplete: boolean;
  error?: string | null;
  onRetry?: () => void;
  // Large tournament backend progress
  isLargeTournament?: boolean;
  backendStatus?: TournamentImportStatus | null;
}

export function CreationProgressChecklist({
  isActive,
  isComplete,
  error,
  onRetry,
  isLargeTournament = false,
  backendStatus,
}: CreationProgressChecklistProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    SMALL_TOURNAMENT_STEPS.map(() => 'pending')
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  const steps = isLargeTournament ? LARGE_TOURNAMENT_STEPS : SMALL_TOURNAMENT_STEPS;

  // Update step statuses based on backend status for large tournaments
  useEffect(() => {
    if (!isLargeTournament || !backendStatus) return;

    const currentIndex = getStepIndexFromStatus(backendStatus.importStatus);
    const newStatuses: StepStatus[] = steps.map((_, index) => {
      if (index < currentIndex) return 'complete';
      if (index === currentIndex) return 'in-progress';
      return 'pending';
    });

    // Handle complete state
    if (backendStatus.importStatus === 'complete') {
      newStatuses[steps.length - 1] = 'complete';
    }

    setStepStatuses(newStatuses);
    setCurrentStepIndex(currentIndex);
  }, [isLargeTournament, backendStatus, steps]);

  // Start the timer sequence when isActive becomes true (small tournaments only)
  useEffect(() => {
    if (isLargeTournament) return; // Skip for large tournaments

    if (isActive && !hasStartedRef.current) {
      hasStartedRef.current = true;
      // Set first step to in-progress
      setStepStatuses((prev) => {
        const next = [...prev];
        next[0] = 'in-progress';
        return next;
      });
      setCurrentStepIndex(0);
    }
  }, [isActive, isLargeTournament]);

  // Handle step progression based on timing (small tournaments only)
  useEffect(() => {
    if (isLargeTournament) return; // Skip for large tournaments

    if (!isActive || isComplete || error) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    const currentStep = steps[currentStepIndex];
    if (!currentStep || currentStep.duration === 0) {
      return;
    }

    // Don't advance past the "saving" step (index 3) - wait for completion
    if (currentStepIndex >= steps.length - 2) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setStepStatuses((prev) => {
        const next = [...prev];
        next[currentStepIndex] = 'complete';
        if (currentStepIndex + 1 < steps.length) {
          next[currentStepIndex + 1] = 'in-progress';
        }
        return next;
      });
      setCurrentStepIndex((prev) => prev + 1);
    }, currentStep.duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, currentStepIndex, isComplete, error, isLargeTournament, steps]);

  // Handle completion - mark all remaining steps as complete
  useEffect(() => {
    if (isComplete) {
      setStepStatuses(steps.map(() => 'complete'));
      setCurrentStepIndex(steps.length - 1);
    }
  }, [isComplete, steps]);

  // Handle error - mark current step as error
  useEffect(() => {
    if (error && isActive) {
      setStepStatuses((prev) => {
        const next = [...prev];
        // Find the in-progress step and mark it as error
        const inProgressIndex = next.findIndex((s) => s === 'in-progress');
        if (inProgressIndex !== -1) {
          next[inProgressIndex] = 'error';
        }
        return next;
      });
    }
  }, [error, isActive]);

  // Reset when no longer active and not complete (small tournaments only)
  useEffect(() => {
    if (isLargeTournament) return;

    if (!isActive && !isComplete && !error) {
      hasStartedRef.current = false;
      setCurrentStepIndex(0);
      setStepStatuses(steps.map(() => 'pending'));
    }
  }, [isActive, isComplete, error, isLargeTournament, steps]);

  // Get step label with count for importing step
  const getStepLabel = (step: CreationStep, index: number): string => {
    if (isLargeTournament && step.id === 'importing' && backendStatus) {
      const { importedCount, totalCount } = backendStatus;
      if (importedCount !== null && totalCount !== null && totalCount > 0) {
        return `Importing players from FPL (${importedCount} of ${totalCount})`;
      }
    }
    return step.label;
  };

  const title = error
    ? 'Creation Failed'
    : isComplete
      ? 'Tournament Created!'
      : 'Creating Your Tournament';

  // Calculate progress percentage for large tournaments
  const progressPercent = isLargeTournament && backendStatus?.importProgress != null
    ? backendStatus.importProgress
    : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          role="status"
          aria-live="polite"
          aria-label="Tournament creation progress"
          className="space-y-3"
        >
          {steps.map((step, index) => {
            const status = stepStatuses[index];
            const isCurrentStep = status === 'in-progress';
            const justCompleted = status === 'complete' && index === currentStepIndex - 1;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 transition-all duration-300',
                  isCurrentStep && 'font-medium',
                  status === 'pending' && 'opacity-50',
                  justCompleted && 'animate-step-complete'
                )}
              >
                <StepIcon status={status} />
                <span
                  className={cn(
                    'text-sm',
                    status === 'error' && 'text-destructive'
                  )}
                >
                  {getStepLabel(step, index)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar for large tournaments */}
        {isLargeTournament && progressPercent !== null && !isComplete && !error && (
          <div className="mt-4 space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progressPercent}% complete
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Try Again
              </Button>
            )}
          </div>
        )}

        {!error && !isComplete && (
          <p className="mt-4 text-sm text-muted-foreground">
            {isLargeTournament
              ? 'Large tournaments take a few minutes to set up. Please wait...'
              : 'This may take a few moments...'}
          </p>
        )}

        {isComplete && (
          <p className="mt-4 text-sm text-muted-foreground">
            Redirecting to your bracket...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
