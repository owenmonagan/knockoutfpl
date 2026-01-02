import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareImagePreview } from './ShareImagePreview';

// Mock the shareImage module
vi.mock('../../lib/shareImage', () => ({
  renderShareImage: vi.fn().mockResolvedValue({
    dataUrl: 'data:image/png;base64,mockImageData',
    blob: new Blob(['mock'], { type: 'image/png' }),
  }),
}));

describe('ShareImagePreview', () => {
  const defaultProps = {
    leagueName: 'Test League',
    roundName: 'Round of 16',
    participantCount: 16,
    shareUrl: 'https://knockoutfpl.com/league/12345',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ShareImagePreview {...defaultProps} />);
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  it('renders the image preview when loaded', async () => {
    render(<ShareImagePreview {...defaultProps} />);

    // Wait for image to be generated
    const image = await screen.findByRole('img', { name: /share preview/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'data:image/png;base64,mockImageData');
  });

  it('renders download button', async () => {
    render(<ShareImagePreview {...defaultProps} />);
    await screen.findByRole('img');

    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('renders share button when Web Share API is available', async () => {
    // Mock navigator.share
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    Object.defineProperty(navigator, 'canShare', {
      value: vi.fn(() => true),
      configurable: true,
    });

    render(<ShareImagePreview {...defaultProps} />);
    await screen.findByRole('img');

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });
});
