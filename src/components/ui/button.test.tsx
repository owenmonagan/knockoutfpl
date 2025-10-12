import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('should render a button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should accept and apply className prop', () => {
    render(<Button className="custom-class">Styled Button</Button>);
    const button = screen.getByRole('button', { name: /styled button/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should apply default variant styling', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button', { name: /default/i });
    expect(button.className).toContain('bg-primary');
  });

  it('should apply destructive variant styling', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button.className).toContain('bg-destructive');
  });

  it('should apply outline variant styling', () => {
    render(<Button variant="outline">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button.className).toContain('border');
  });

  it('should forward onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    button.click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
