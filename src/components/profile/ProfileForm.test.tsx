import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
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

  it('shows "Account Details" title', () => {
    render(<ProfileForm {...defaultProps} />);
    expect(screen.getByText('Account Details')).toBeInTheDocument();
  });

  it('shows user email', () => {
    render(<ProfileForm {...defaultProps} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows display name label', () => {
    render(<ProfileForm {...defaultProps} />);
    expect(screen.getByText('Display Name')).toBeInTheDocument();
  });

  it('shows current display name', () => {
    render(<ProfileForm {...defaultProps} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows Edit button', () => {
    render(<ProfileForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('shows input field when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('pre-fills input with current display name', async () => {
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('textbox')).toHaveValue('Test User');
  });

  it('shows Save and Cancel buttons in edit mode', async () => {
    const user = userEvent.setup();
    render(<ProfileForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
