import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
  };

  it('renders Navbar', () => {
    renderLandingPage();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders Hero headline', () => {
    renderLandingPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('KNOCKOUT FPL');
  });

  it('renders Hero CTA linking to signup', () => {
    renderLandingPage();
    const cta = screen.getByRole('link', { name: /enter the arena/i });
    expect(cta).toHaveAttribute('href', '/signup');
  });

  it('renders ValueProps section', () => {
    renderLandingPage();
    expect(screen.getByTestId('value-props')).toBeInTheDocument();
  });

  it('renders SocialProof section', () => {
    renderLandingPage();
    expect(screen.getByTestId('social-proof')).toBeInTheDocument();
  });
});
