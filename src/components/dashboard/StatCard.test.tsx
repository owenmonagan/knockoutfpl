import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('Step 37: renders', () => {
    render(<StatCard label="Test Label" value="Test Value" />);
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });

  it('Step 38: displays label', () => {
    render(<StatCard label="Total Challenges" value={42} />);
    const label = screen.getByText('Total Challenges');
    expect(label).toBeInTheDocument();
  });

  it('Step 39: displays value', () => {
    render(<StatCard label="Total Challenges" value={42} />);
    const value = screen.getByText('42');
    expect(value).toBeInTheDocument();
  });

  it('Step 40: displays icon when provided', () => {
    const icon = <span data-testid="test-icon">🏆</span>;
    render(<StatCard label="Total Challenges" value={42} icon={icon} />);
    const iconElement = screen.getByTestId('test-icon');
    expect(iconElement).toBeInTheDocument();
  });
});
