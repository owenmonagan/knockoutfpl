import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BracketMotif } from './BracketMotif';

describe('BracketMotif', () => {
  it('renders an SVG element', () => {
    render(<BracketMotif />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<BracketMotif />);
    expect(screen.getByLabelText(/tournament bracket/i)).toBeInTheDocument();
  });

  it('applies fade animation class', () => {
    render(<BracketMotif />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('animate-bracket-fade');
  });

  it('uses gold color for bracket lines', () => {
    render(<BracketMotif />);
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach(path => {
      expect(path).toHaveAttribute('stroke', '#C9A227');
    });
  });
});
