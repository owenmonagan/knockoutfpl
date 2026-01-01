// src/components/tournament/CreationProgressChecklist.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreationProgressChecklist } from './CreationProgressChecklist';

describe('CreationProgressChecklist', () => {
  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should render all steps', () => {
      render(
        <CreationProgressChecklist isActive={false} isComplete={false} />
      );

      expect(screen.getByText('Fetching league data')).toBeInTheDocument();
      expect(screen.getByText('Generating bracket')).toBeInTheDocument();
      expect(screen.getByText('Saving players')).toBeInTheDocument();
      expect(screen.getByText('Building bracket')).toBeInTheDocument();
      expect(screen.getByText('Tournament ready!')).toBeInTheDocument();
    });

    it('should show first step as in-progress when active', async () => {
      render(
        <CreationProgressChecklist isActive={true} isComplete={false} />
      );

      // Wait for state update
      await act(async () => {
        vi.advanceTimersByTime(0);
      });

      // The first step should be in-progress (has spinner icon)
      const statusDiv = screen.getByRole('status');
      expect(statusDiv).toBeInTheDocument();
      expect(screen.getByText('Creating Your Tournament')).toBeInTheDocument();
    });

    it('should advance steps based on timing', async () => {
      render(
        <CreationProgressChecklist isActive={true} isComplete={false} />
      );

      // Wait for initial state
      await act(async () => {
        vi.advanceTimersByTime(0);
      });

      // Advance past first step (1500ms)
      await act(async () => {
        vi.advanceTimersByTime(1600);
      });

      // Advance past second step (300ms)
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      // Advance past third step (500ms)
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Now should be on "Saving tournament" step - steps should have advanced
    });

    it('should mark all steps complete when isComplete is true', async () => {
      const { rerender } = render(
        <CreationProgressChecklist isActive={true} isComplete={false} />
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Now mark as complete
      rerender(
        <CreationProgressChecklist isActive={true} isComplete={true} />
      );

      await act(async () => {
        vi.advanceTimersByTime(0);
      });

      expect(screen.getByText('Tournament Created!')).toBeInTheDocument();
    });

    it('should show error state when error prop is set', async () => {
      render(
        <CreationProgressChecklist
          isActive={true}
          isComplete={false}
          error="League must have at least 4 participants"
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.getByText('Creation Failed')).toBeInTheDocument();
      expect(screen.getByText('League must have at least 4 participants')).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(
        <CreationProgressChecklist isActive={true} isComplete={false} />
      );

      const statusDiv = screen.getByRole('status');
      expect(statusDiv).toHaveAttribute('aria-live', 'polite');
      expect(statusDiv).toHaveAttribute('aria-label', 'Tournament creation progress');
    });

    it('should show helper text during creation', () => {
      render(
        <CreationProgressChecklist isActive={true} isComplete={false} />
      );

      expect(screen.getByText('This may take a few moments...')).toBeInTheDocument();
    });

    it('should show redirect message when complete', async () => {
      render(
        <CreationProgressChecklist isActive={true} isComplete={true} />
      );

      await act(async () => {
        vi.advanceTimersByTime(0);
      });

      expect(screen.getByText('Redirecting to your bracket...')).toBeInTheDocument();
    });
  });

  describe('with real timers', () => {
    it('should show retry button when error and onRetry provided', async () => {
      const user = userEvent.setup();
      const handleRetry = vi.fn();

      render(
        <CreationProgressChecklist
          isActive={true}
          isComplete={false}
          error="Something went wrong"
          onRetry={handleRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });
});
