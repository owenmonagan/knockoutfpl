import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('should render the page title', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/knockout fpl/i)).toBeInTheDocument();
  });
});
