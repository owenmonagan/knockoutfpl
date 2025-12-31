import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  it('redirects to /leagues', () => {
    let currentPath = '/dashboard';

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/leagues"
            element={
              <div>
                {(() => {
                  currentPath = '/leagues';
                  return 'Leagues Page';
                })()}
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(currentPath).toBe('/leagues');
  });
});
