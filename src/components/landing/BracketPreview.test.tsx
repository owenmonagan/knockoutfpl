import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketPreview } from './BracketPreview';

describe('BracketPreview', () => {
  it('renders winner card', () => {
    render(<BracketPreview />);

    expect(screen.getByText('Winner')).toBeInTheDocument();
    expect(screen.getAllByText('The Invincibles')).toHaveLength(2); // Winner card and seed card
  });

  it('renders seed cards', () => {
    render(<BracketPreview />);

    expect(screen.getByText('Seed #1')).toBeInTheDocument();
    expect(screen.getByText('Seed #8')).toBeInTheDocument();
    expect(screen.getByText('Underdog United')).toBeInTheDocument();
  });

  it('renders scores', () => {
    render(<BracketPreview />);

    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
  });
});
