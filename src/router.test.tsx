import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { router } from './router';

describe('Router', () => {
  it('should render landing page at /', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText(/knockout fpl/i)).toBeInTheDocument();
  });

  it('should render login page at /login', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/login'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render signup page at /signup', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/signup'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('should render dashboard page at /dashboard', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/dashboard'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});
