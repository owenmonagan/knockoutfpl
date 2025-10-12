import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders FPL Knockout title', () => {
    render(<App />);
    expect(screen.getByText(/FPL Head-to-Head/i)).toBeInTheDocument();
  });

  it('renders CompareTeams component', () => {
    render(<App />);
    expect(screen.getByLabelText(/team 1 id/i)).toBeInTheDocument();
  });
});
