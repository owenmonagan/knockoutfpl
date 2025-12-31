import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  const renderNavbar = () => {
    return render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderNavbar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('displays KNOCKOUT FPL logo text', () => {
    renderNavbar();
    expect(screen.getByText('KNOCKOUT FPL')).toBeInTheDocument();
  });

  it('displays Login link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('Login link navigates to /login', () => {
    renderNavbar();
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('logo links to home page', () => {
    renderNavbar();
    const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
