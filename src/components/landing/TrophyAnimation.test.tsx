import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrophyAnimation } from './TrophyAnimation';

describe('TrophyAnimation', () => {
  it('renders trophy element', () => {
    render(<TrophyAnimation />);
    const trophy = document.querySelector('.trophy-css');
    expect(trophy).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<TrophyAnimation />);
    expect(screen.getByLabelText(/championship trophy/i)).toBeInTheDocument();
  });

  it('applies rise animation class', () => {
    render(<TrophyAnimation />);
    const container = document.querySelector('[data-testid="trophy-container"]');
    expect(container).toHaveClass('animate-trophy-rise');
  });

  it('includes shimmer effect overlay', () => {
    render(<TrophyAnimation />);
    const shimmer = document.querySelector('[data-testid="trophy-shimmer"]');
    expect(shimmer).toBeInTheDocument();
    expect(shimmer).toHaveClass('trophy-shimmer');
  });
});
