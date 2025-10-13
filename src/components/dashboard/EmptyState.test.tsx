import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('Step 52: calls onAction when button clicked', () => {
    const mockOnAction = vi.fn();
    render(<EmptyState title="No Challenges" description="Test" actionLabel="Create Challenge" onAction={mockOnAction} />);
    const button = screen.getByRole('button', { name: /create challenge/i });
    fireEvent.click(button);
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('Step 53: has centered layout', () => {
    render(<EmptyState title="No Challenges" description="Test" />);
    const card = screen.getByRole('article');
    const content = card.querySelector('.flex.flex-col.items-center.justify-center');
    expect(content).toBeInTheDocument();
  });

  it('Step 54: uses Card component', () => {
    render(<EmptyState title="No Challenges" description="Test" />);
    const card = screen.getByRole('article');
    // shadcn Card has these classes
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
  });
});
