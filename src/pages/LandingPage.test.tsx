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

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/knockout/i);
    expect(heading).toHaveTextContent(/fpl/i);
  });

  it('should render primary CTA', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const ctaLink = screen.getByRole('link', { name: /enter the arena/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/signup');
  });

  it('should render the hero section with tagline', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Every gameweek is a cup final/i)).toBeInTheDocument();
  });
});
