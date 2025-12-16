import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValueProps } from './ValueProps';

describe('ValueProps', () => {
  it('renders without crashing', () => {
    render(<ValueProps />);
    expect(screen.getByTestId('value-props')).toBeInTheDocument();
  });

  it('displays 3 value prop cards', () => {
    render(<ValueProps />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
  });

  it('card 1 displays sword emoji', () => {
    render(<ValueProps />);
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('card 1 displays headline', () => {
    render(<ValueProps />);
    expect(screen.getByText('One opponent. One winner. Every week.')).toBeInTheDocument();
  });

  it('card 1 displays body', () => {
    render(<ValueProps />);
    expect(screen.getByText('No more chasing points. Just survive.')).toBeInTheDocument();
  });

  it('card 2 displays target emoji', () => {
    render(<ValueProps />);
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('card 2 displays headline', () => {
    render(<ValueProps />);
    expect(screen.getByText('Your team. Higher stakes.')).toBeInTheDocument();
  });

  it('card 3 displays trophy emoji', () => {
    render(<ValueProps />);
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('card 3 displays headline', () => {
    render(<ValueProps />);
    expect(screen.getByText('Turn your league into sudden death.')).toBeInTheDocument();
  });
});
