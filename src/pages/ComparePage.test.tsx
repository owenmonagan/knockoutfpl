import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ComparePage } from './ComparePage';

describe('ComparePage', () => {
  it('renders the page', () => {
    render(
      <BrowserRouter>
        <ComparePage />
      </BrowserRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the CompareTeams component', () => {
    render(
      <BrowserRouter>
        <ComparePage />
      </BrowserRouter>
    );

    // CompareTeams has team ID inputs
    expect(screen.getByLabelText(/team 1 id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/team 2 id/i)).toBeInTheDocument();
    // And gameweek input
    expect(screen.getByLabelText(/gameweek/i)).toBeInTheDocument();
  });
});
