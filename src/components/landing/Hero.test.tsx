import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Hero } from './Hero';

describe('Hero', () => {
  const renderHero = () => {
    return render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
  };

  it('renders the hero heading with gradient text', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Knockout/i);
    expect(heading).toHaveTextContent(/FPL/i);
  });

  it('renders the value proposition subheading', () => {
    renderHero();
    expect(
      screen.getByText(/Transform your FPL mini-leagues into knockout tournaments/i)
    ).toBeInTheDocument();
  });

  it('renders a badge with status message', () => {
    renderHero();
    expect(screen.getByText(/Now Live/i)).toBeInTheDocument();
  });

  it('renders Get Started CTA button linking to signup', () => {
    renderHero();
    const getStartedButton = screen.getByRole('link', { name: /Get Started/i });
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton).toHaveAttribute('href', '/signup');
  });

  it('renders Log In button linking to login', () => {
    renderHero();
    const loginButton = screen.getByRole('link', { name: /Log In/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('href', '/login');
  });
});
