import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { LandingHeader } from './LandingHeader';

describe('LandingHeader', () => {
  it('renders logo and navigation', () => {
    render(
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>
    );

    expect(screen.getByText('Knockout FPL')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Create Tournament')).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    render(
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole('link', { name: 'Login' });
    expect(loginLink).toHaveAttribute('href', '/login');

    const createTournamentLink = screen.getByRole('link', { name: 'Create Tournament' });
    expect(createTournamentLink).toHaveAttribute('href', '/signup');
  });

  it('logo links to home', () => {
    render(
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>
    );

    const logoLink = screen.getByRole('link', { name: /Knockout FPL/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
