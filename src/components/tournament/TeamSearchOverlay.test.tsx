import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TeamSearchOverlay } from './TeamSearchOverlay';
import type { Participant } from '../../types/tournament';

const mockParticipants: Participant[] = [
  { fplTeamId: 1001, fplTeamName: 'Liverpool Legends', managerName: 'John Smith', seed: 1 },
  { fplTeamId: 1002, fplTeamName: 'Arsenal Academy', managerName: 'Jane Doe', seed: 2 },
  { fplTeamId: 1003, fplTeamName: 'Chelsea Champions', managerName: 'Bob Wilson', seed: 3 },
  { fplTeamId: 1004, fplTeamName: 'Spurs Stars', managerName: 'Alice Johnson', seed: 4 },
  { fplTeamId: 1005, fplTeamName: 'Manchester Magic', managerName: 'John Doe', seed: 5 },
];

describe('TeamSearchOverlay', () => {
  const defaultProps = {
    participants: mockParticipants,
    onConfirm: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the search input with correct placeholder', () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      expect(input).toBeInTheDocument();
    });

    it('should render the title', () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      expect(screen.getByText('Find Your Team')).toBeInTheDocument();
    });

    it('should render the close button', () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: 'Close search' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should show initial helper text when no query', () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      expect(screen.getByText('Start typing to find your team')).toBeInTheDocument();
    });

    it('should focus the input on mount', () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      expect(document.activeElement).toBe(input);
    });

    it('should have proper accessibility attributes', () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Search for your team' });
      expect(input).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: 'Close search' });
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search Functionality', () => {
    it('should debounce search input', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'Liverpool' } });

      // Results should not appear immediately
      expect(screen.queryByText('Liverpool Legends')).not.toBeInTheDocument();

      // Advance timers to trigger debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Now results should appear
      expect(screen.getByText('Liverpool Legends')).toBeInTheDocument();
    });

    it('should search by team name (case-insensitive)', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'arsenal' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('Arsenal Academy')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should search by manager name (case-insensitive)', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'bob' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('Chelsea Champions')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should show multiple results when query matches multiple teams', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'john' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should match John Smith (Liverpool Legends) and John Doe (Manchester Magic)
      expect(screen.getByText('Liverpool Legends')).toBeInTheDocument();
      expect(screen.getByText('Manchester Magic')).toBeInTheDocument();
    });

    it('should show no results message when no matches found', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'xyz123' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('No teams found matching "xyz123"')).toBeInTheDocument();
    });

    it('should not show results for whitespace-only query', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: '   ' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('Start typing to find your team')).toBeInTheDocument();
    });

    it('should handle partial matches', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'che' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('Chelsea Champions')).toBeInTheDocument();
      expect(screen.getByText('Manchester Magic')).toBeInTheDocument(); // "che" is in "Manchester"
    });
  });

  describe('Result Items', () => {
    it('should display team name and manager name for each result', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'Liverpool' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('Liverpool Legends')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('should render "This is me" button for each result', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      // Search for "a" which matches Arsenal Academy (team), Chelsea Champions (team),
      // Spurs Stars (team), Manchester Magic (team+manager)
      fireEvent.change(input, { target: { value: 'a' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const buttons = screen.getAllByRole('button', { name: 'This is me' });
      // Should have one button per matching result
      expect(buttons.length).toBeGreaterThan(1);
    });

    it('should have listbox role on results container', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'Liverpool' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const listbox = screen.getByRole('listbox', { name: 'Search results' });
      expect(listbox).toBeInTheDocument();
    });
  });

  describe('Confirm Action', () => {
    it('should call onConfirm with correct fplTeamId when "This is me" is clicked', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'Liverpool' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const confirmButton = screen.getByRole('button', { name: 'This is me' });
      fireEvent.click(confirmButton);

      expect(defaultProps.onConfirm).toHaveBeenCalledWith(1001);
    });

    it('should call onConfirm with correct id for the specific team clicked', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');
      // Search for "jane" to get a unique result (Jane Doe - Arsenal Academy)
      fireEvent.change(input, { target: { value: 'jane' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should only have one result
      const button = screen.getByRole('button', { name: 'This is me' });
      fireEvent.click(button);

      expect(defaultProps.onConfirm).toHaveBeenCalledWith(1002);
    });
  });

  describe('Empty Participants', () => {
    it('should show no results when participants array is empty', async () => {
      render(
        <TeamSearchOverlay
          {...defaultProps}
          participants={[]}
        />
      );

      const input = screen.getByPlaceholderText('Find your team...');
      fireEvent.change(input, { target: { value: 'test' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('No teams found matching "test"')).toBeInTheDocument();
    });
  });

  describe('Overlay Styling', () => {
    it('should have overlay positioning classes', () => {
      const { container } = render(<TeamSearchOverlay {...defaultProps} />);

      const card = container.querySelector('.absolute.inset-0.z-10');
      expect(card).toBeInTheDocument();
    });

    it('should have backdrop blur styling', () => {
      const { container } = render(<TeamSearchOverlay {...defaultProps} />);

      const card = container.querySelector('.backdrop-blur-sm');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Debounce Behavior', () => {
    it('should reset debounce timer on subsequent inputs', async () => {
      render(<TeamSearchOverlay {...defaultProps} />);

      const input = screen.getByPlaceholderText('Find your team...');

      // Type first character
      fireEvent.change(input, { target: { value: 'L' } });

      // Advance partially through debounce
      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Type more characters (should reset debounce)
      fireEvent.change(input, { target: { value: 'Liverpool' } });

      // Advance past original debounce time but not new one
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should not show results yet
      expect(screen.queryByText('Liverpool Legends')).not.toBeInTheDocument();

      // Advance to complete the debounce
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Now should show results
      expect(screen.getByText('Liverpool Legends')).toBeInTheDocument();
    });
  });
});
