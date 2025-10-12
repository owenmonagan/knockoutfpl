import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';

// Mock auth and user services
vi.mock('../../services/auth');
vi.mock('../../services/user');

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render email input', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render all required form fields', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should call signUpWithEmail when form is submitted', async () => {
    const { signUpWithEmail } = await import('../../services/auth');

    vi.mocked(signUpWithEmail).mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
    } as any);

    const user = userEvent.setup();

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(signUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should create user profile after successful signup', async () => {
    const { signUpWithEmail } = await import('../../services/auth');
    const { createUserProfile } = await import('../../services/user');

    vi.mocked(signUpWithEmail).mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
    } as any);

    const user = userEvent.setup();

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(createUserProfile).toHaveBeenCalledWith({
      userId: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    });
  });
});
