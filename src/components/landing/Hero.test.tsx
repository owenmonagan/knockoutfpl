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

  it('displays KNOCKOUT FPL headline', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('KNOCKOUT FPL');
  });

  it('headline is uppercase', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('uppercase');
  });

  it('displays tagline', () => {
    renderHero();
    expect(screen.getByText('Every gameweek is a cup final.')).toBeInTheDocument();
  });

  it('displays Enter the Arena CTA', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /enter the arena/i })).toBeInTheDocument();
  });

  it('CTA links to /signup', () => {
    renderHero();
    const cta = screen.getByRole('link', { name: /enter the arena/i });
    expect(cta).toHaveAttribute('href', '/signup');
  });
});
