import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrophyAnimation } from './TrophyAnimation';

describe('TrophyAnimation', () => {
  it('renders an SVG trophy', () => {
    render(<TrophyAnimation />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
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

  it('trophy is gold colored', () => {
    render(<TrophyAnimation />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('fill', '#C9A227');
  });
});
