import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('Step 37: renders', () => {
    render(<StatCard label="Test Label" value="Test Value" />);
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });
});
