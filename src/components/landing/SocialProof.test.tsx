import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialProof } from './SocialProof';

describe('SocialProof', () => {
  it('renders without crashing', () => {
    render(<SocialProof />);
    expect(screen.getByTestId('social-proof')).toBeInTheDocument();
  });

  it('displays quote text', () => {
    render(<SocialProof />);
    expect(screen.getByText('"Finally, FPL with actual stakes."')).toBeInTheDocument();
  });

  it('displays attribution', () => {
    render(<SocialProof />);
    expect(screen.getByText('— Someone on Reddit, probably')).toBeInTheDocument();
  });

  it('quote is styled as italic', () => {
    render(<SocialProof />);
    const quote = screen.getByText('"Finally, FPL with actual stakes."');
    expect(quote).toHaveClass('italic');
  });
});
