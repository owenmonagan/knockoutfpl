import { useEffect, useState, useRef } from 'react';
import { Circle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

type StepStatus = 'pending' | 'in-progress' | 'complete' | 'error';

interface CreationStep {
  id: string;
  label: string;
  duration: number;
}

const CREATION_STEPS: CreationStep[] = [
  { id: 'fetchingData', label: 'Fetching league data', duration: 1200 },
  { id: 'generating', label: 'Generating bracket', duration: 400 },
  { id: 'savingPlayers', label: 'Saving players', duration: 1500 },
  { id: 'buildingBracket', label: 'Building bracket', duration: 2000 },
  { id: 'complete', label: 'Tournament ready!', duration: 0 },
];

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
}

export function CreationProgressChecklist({
  isActive,
  isComplete,
  error,
  onRetry,
}: CreationProgressChecklistProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    CREATION_STEPS.map(() => 'pending')
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  // Start the timer sequence when isActive becomes true
  useEffect(() => {
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
  }, [isActive]);

  // Handle step progression based on timing
  useEffect(() => {
    if (!isActive || isComplete || error) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    const currentStep = CREATION_STEPS[currentStepIndex];
    if (!currentStep || currentStep.duration === 0) {
      return;
    }

    // Don't advance past the "saving" step (index 3) - wait for completion
    if (currentStepIndex >= CREATION_STEPS.length - 2) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setStepStatuses((prev) => {
        const next = [...prev];
        next[currentStepIndex] = 'complete';
        if (currentStepIndex + 1 < CREATION_STEPS.length) {
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
  }, [isActive, currentStepIndex, isComplete, error]);

  // Handle completion - mark all remaining steps as complete
  useEffect(() => {
    if (isComplete) {
      setStepStatuses(CREATION_STEPS.map(() => 'complete'));
      setCurrentStepIndex(CREATION_STEPS.length - 1);
    }
  }, [isComplete]);

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

  // Reset when no longer active and not complete
  useEffect(() => {
    if (!isActive && !isComplete && !error) {
      hasStartedRef.current = false;
      setCurrentStepIndex(0);
      setStepStatuses(CREATION_STEPS.map(() => 'pending'));
    }
  }, [isActive, isComplete, error]);

  const title = error
    ? 'Creation Failed'
    : isComplete
      ? 'Tournament Created!'
      : 'Creating Your Tournament';

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
          {CREATION_STEPS.map((step, index) => {
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
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

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
            This may take a few moments...
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
