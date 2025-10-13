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

  it('Step 50: displays icon when provided', () => {
    const icon = <span data-testid="test-icon">📋</span>;
    render(<EmptyState title="No Challenges" description="Test" icon={icon} />);
    const iconElement = screen.getByTestId('test-icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('Step 51: shows action button when provided', () => {
    render(<EmptyState title="No Challenges" description="Test" actionLabel="Create Challenge" />);
    const button = screen.getByRole('button', { name: /create challenge/i });
    expect(button).toBeInTheDocument();
  });
});
