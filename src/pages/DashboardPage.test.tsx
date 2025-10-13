import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  describe('PHASE 1: Basic Page Structure', () => {
    it('Step 1: renders with main element', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('Step 2: shows "Dashboard" heading', () => {
      render(<DashboardPage />);
      const heading = screen.getByRole('heading', { name: /dashboard/i });
      expect(heading).toBeInTheDocument();
    });

    it('Step 3: has container with proper spacing', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      // Check for container classes (max-w, mx-auto, padding)
      expect(main).toHaveClass('container');
    });
  });
});
