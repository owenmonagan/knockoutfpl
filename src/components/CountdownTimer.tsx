import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface CountdownTimerProps {
  deadline: Date;
  onDeadlineReached?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

function calculateTimeRemaining(deadline: Date): TimeRemaining {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
  }

  const totalHours = diff / (1000 * 60 * 60);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, totalHours };
}

function getUrgencyColor(totalHours: number): string {
  if (totalHours > 48) {
    return 'text-blue-500'; // Calm
  } else if (totalHours > 24) {
    return 'text-orange-500'; // Urgent
  } else {
    return 'text-red-500'; // Imminent
  }
}

export function CountdownTimer({ deadline, onDeadlineReached }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(deadline)
  );
  const callbackCalledRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(deadline);
      setTimeRemaining(remaining);

      // Call callback when deadline is reached (only once)
      if (remaining.totalHours <= 0 && onDeadlineReached && !callbackCalledRef.current) {
        callbackCalledRef.current = true;
        onDeadlineReached();
      }
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [deadline, onDeadlineReached]);

  const colorClass = getUrgencyColor(timeRemaining.totalHours);
  const shouldPulse = timeRemaining.totalHours < 24;

  const formattedDeadline = deadline.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div role="timer" className={cn(colorClass, shouldPulse && 'animate-pulse')}>
      <div data-testid="countdown-text" className="text-5xl font-bold">Kicks off in {timeRemaining.days} days, {timeRemaining.hours} hours</div>
      <div>Deadline: {formattedDeadline}</div>
    </div>
  );
}
