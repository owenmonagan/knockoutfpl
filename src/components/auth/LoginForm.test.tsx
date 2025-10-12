import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import * as authService from '../../services/auth';

describe('LoginForm', () => {
  it('should render email and password inputs', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should render a submit button', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should call signInWithEmail when form is submitted', async () => {
    const signInSpy = vi.spyOn(authService, 'signInWithEmail');
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(signInSpy).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should display error message on login failure', async () => {
    const signInSpy = vi.spyOn(authService, 'signInWithEmail');
    signInSpy.mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
