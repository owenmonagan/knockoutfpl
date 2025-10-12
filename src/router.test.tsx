import { describe, it, expect } from 'vitest';
import { createMemoryRouter } from 'react-router-dom';
import { router } from './router';

describe('Router', () => {
  it('should have a route for the landing page', () => {
    const testRouter = createMemoryRouter(router, {
      initialEntries: ['/'],
    });

    expect(testRouter.state.location.pathname).toBe('/');
  });
});
