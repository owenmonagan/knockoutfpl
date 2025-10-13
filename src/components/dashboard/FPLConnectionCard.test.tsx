import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FPLConnectionCard } from './FPLConnectionCard';

describe('FPLConnectionCard', () => {
  describe('PHASE 2: Not Connected State', () => {
    it('Step 6: component renders', () => {
      render(
        <FPLConnectionCard
          user={null}
          fplData={null}
          isLoading={false}
          onConnect={async () => {}}
          onUpdate={async () => {}}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });
});
