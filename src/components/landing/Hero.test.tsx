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
    expect(screen.getByText(/Knockout/i)).toBeInTheDocument();
    expect(screen.getByText(/FPL/i)).toBeInTheDocument();
  });

  it('renders the value proposition subheading', () => {
    renderHero();
    expect(
      screen.getByText(/Head-to-head Fantasy Premier League challenges/i)
    ).toBeInTheDocument();
  });

  it('renders a badge with status message', () => {
    renderHero();
    expect(screen.getByText(/Now Live/i)).toBeInTheDocument();
  });
});
