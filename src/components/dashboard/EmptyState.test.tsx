import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('Step 47: renders', () => {
    render(<EmptyState title="Test Title" description="Test Description" />);
    const emptyState = screen.getByRole('article');
    expect(emptyState).toBeInTheDocument();
  });

  it('Step 48: displays title', () => {
    render(<EmptyState title="No Challenges" description="Test Description" />);
    const title = screen.getByText('No Challenges');
    expect(title).toBeInTheDocument();
  });

  it('Step 49: displays description', () => {
    render(<EmptyState title="No Challenges" description="Create your first challenge" />);
    const description = screen.getByText('Create your first challenge');
    expect(description).toBeInTheDocument();
  });
});
