import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileForm } from './ProfileForm';

describe('ProfileForm', () => {
  const defaultProps = {
    displayName: 'Test User',
    email: 'test@example.com',
    onUpdateDisplayName: vi.fn(),
    isLoading: false,
  };

  it('renders the component', () => {
    render(<ProfileForm {...defaultProps} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
