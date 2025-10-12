import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render a badge with text', () => {
    render(<Badge>Winner</Badge>);
    expect(screen.getByText('Winner')).toBeInTheDocument();
  });

  it('should accept a custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge).toHaveClass('custom-class');
  });
});
