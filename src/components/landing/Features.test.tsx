import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Features } from './Features';

describe('Features', () => {
  it('renders section header', () => {
    render(<Features />);

    expect(
      screen.getByText('Everything You Need to Run a Cup')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ditch the spreadsheets/i)
    ).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<Features />);

    expect(screen.getByText('Instant Brackets')).toBeInTheDocument();
    expect(screen.getByText('Auto-Scoring')).toBeInTheDocument();
    expect(screen.getByText('Shareable Links')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Features />);

    expect(
      screen.getByText(/Automatically seeds players based on current rank/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Scores sync directly from the official FPL API/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Send a single public link to your league mates/i)
    ).toBeInTheDocument();
  });
});
