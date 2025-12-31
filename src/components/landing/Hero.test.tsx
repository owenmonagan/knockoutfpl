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

  it('renders without crashing', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('displays main headline with Knockout Cup text', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/knockout cup/i);
  });

  it('displays tagline', () => {
    renderHero();
    expect(
      screen.getByText(/head-to-head battles.*one survives/i)
    ).toBeInTheDocument();
  });

  it('displays Create Your Tournament CTA', () => {
    renderHero();
    expect(
      screen.getByRole('link', { name: /create your tournament/i })
    ).toBeInTheDocument();
  });

  it('CTA links to /signup', () => {
    renderHero();
    const cta = screen.getByRole('link', { name: /create your tournament/i });
    expect(cta).toHaveAttribute('href', '/signup');
  });

  it('displays View Demo link', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /view demo/i })).toBeInTheDocument();
  });

  it('displays trust badges', () => {
    renderHero();
    expect(screen.getByText(/free to start/i)).toBeInTheDocument();
    expect(screen.getByText(/official fpl sync/i)).toBeInTheDocument();
  });
});
