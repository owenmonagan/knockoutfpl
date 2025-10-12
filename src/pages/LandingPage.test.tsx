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

  it('should render sign up and log in links', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });
});
