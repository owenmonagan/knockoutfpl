import { render, screen, waitFor } from '@testing-library/react';
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

  it('calls onUpdateDisplayName when Save is clicked', async () => {
    const user = userEvent.setup();
    const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

    render(<ProfileForm {...defaultProps} onUpdateDisplayName={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'New Name');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnUpdate).toHaveBeenCalledWith('New Name');
  });

  it('exits edit mode after successful save', async () => {
    const user = userEvent.setup();
    const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

    render(<ProfileForm {...defaultProps} onUpdateDisplayName={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('shows loading state while saving', async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void;
    const mockOnUpdate = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
    });

    render(<ProfileForm {...defaultProps} onUpdateDisplayName={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();

    resolvePromise!();
  });
});
