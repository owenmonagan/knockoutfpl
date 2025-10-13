import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';
import { BrowserRouter } from 'react-router-dom';

// Mock auth and user services
vi.mock('../../services/auth');
vi.mock('../../services/user');

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  it('should show error when passwords do not match', async () => {
    const { signUpWithEmail } = await import('../../services/auth');
    const user = userEvent.setup();

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different123');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(signUpWithEmail).not.toHaveBeenCalled();
  });

  it('should handle signup errors', async () => {
    const { signUpWithEmail } = await import('../../services/auth');

    vi.mocked(signUpWithEmail).mockRejectedValue(new Error('Email already in use'));

    const user = userEvent.setup();

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
  });

  it('should show loading state during signup', async () => {
    const { signUpWithEmail } = await import('../../services/auth');
    const { createUserProfile } = await import('../../services/user');

    // Create a promise that we can control
    let resolveSignup: any;
    const signupPromise = new Promise((resolve) => {
      resolveSignup = resolve;
    });

    vi.mocked(signUpWithEmail).mockReturnValue(signupPromise as any);
    vi.mocked(createUserProfile).mockResolvedValue();

    const user = userEvent.setup();

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Button should be disabled during loading
    expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled();

    // Resolve the signup
    resolveSignup({ user: { uid: 'test-uid', email: 'test@example.com' } });
  });
});
