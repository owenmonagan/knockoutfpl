import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('Step 47: renders', () => {
    render(<EmptyState title="Test Title" description="Test Description" />);
    const emptyState = screen.getByRole('article');
    expect(emptyState).toBeInTheDocument();
  });
});
