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

  it('should render Get Started and Log In CTAs', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const getStartedLink = screen.getByRole('link', { name: /get started/i });
    expect(getStartedLink).toBeInTheDocument();
    expect(getStartedLink).toHaveAttribute('href', '/signup');

    const logInLink = screen.getByRole('link', { name: /log in/i });
    expect(logInLink).toBeInTheDocument();
    expect(logInLink).toHaveAttribute('href', '/login');
  });

  it('should render the hero section with badge', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Now Live - Mini-League Knockout Tournaments/i)).toBeInTheDocument();
    expect(screen.getByText(/Transform your FPL mini-leagues into knockout tournaments/i)).toBeInTheDocument();
  });
});
