import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ShineEffect } from './ShineEffect';

describe('ShineEffect', () => {
  it('renders shine burst element', () => {
    render(<ShineEffect />);
    const burst = document.querySelector('[data-testid="shine-burst"]');
    expect(burst).toBeInTheDocument();
  });

  it('renders shimmer overlay element', () => {
    render(<ShineEffect />);
    const shimmer = document.querySelector('[data-testid="shimmer-overlay"]');
    expect(shimmer).toBeInTheDocument();
  });

  it('applies burst animation class', () => {
    render(<ShineEffect />);
    const burst = document.querySelector('[data-testid="shine-burst"]');
    expect(burst).toHaveClass('animate-shine-burst');
  });

  it('applies shimmer animation class', () => {
    render(<ShineEffect />);
    const shimmer = document.querySelector('[data-testid="shimmer-overlay"]');
    expect(shimmer).toHaveClass('animate-shimmer');
  });

  it('is not visible to screen readers (decorative)', () => {
    render(<ShineEffect />);
    const container = document.querySelector('[aria-hidden="true"]');
    expect(container).toBeInTheDocument();
  });
});
