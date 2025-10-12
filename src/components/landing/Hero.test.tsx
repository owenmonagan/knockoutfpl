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
});
