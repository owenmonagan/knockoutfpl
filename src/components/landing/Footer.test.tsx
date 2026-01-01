import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders logo', () => {
    render(<Footer />);

    expect(screen.getByText('Knockout FPL')).toBeInTheDocument();
  });

  it('renders tagline', () => {
    render(<Footer />);

    expect(
      screen.getByText(/The ultimate companion tool for your Fantasy Premier League season/i)
    ).toBeInTheDocument();
  });

  it('renders copyright notice', () => {
    render(<Footer />);

    expect(
      screen.getByText(/2025 Knockout FPL/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Not affiliated with the Premier League or Fantasy Premier League/i)
    ).toBeInTheDocument();
  });
});
