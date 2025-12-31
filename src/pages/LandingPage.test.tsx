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

  it('renders Hero headline', () => {
    renderLandingPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/knockout cup/i);
  });

  it('renders Hero CTA linking to signup', () => {
    renderLandingPage();
    const cta = screen.getByRole('link', { name: /create your tournament/i });
    expect(cta).toHaveAttribute('href', '/signup');
  });

  it('renders Features section', () => {
    renderLandingPage();
    expect(
      screen.getByRole('heading', { name: /everything you need to run a cup/i })
    ).toBeInTheDocument();
  });

  it('renders Testimonials section', () => {
    renderLandingPage();
    expect(
      screen.getByRole('heading', { name: /what managers are saying/i })
    ).toBeInTheDocument();
  });
});
