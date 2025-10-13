import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import * as authService from '../../services/auth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  it('should render email and password inputs', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should render a submit button', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should call signInWithEmail when form is submitted', async () => {
    const signInSpy = vi.spyOn(authService, 'signInWithEmail');
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(signInSpy).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should display error message on login failure', async () => {
    const signInSpy = vi.spyOn(authService, 'signInWithEmail');
    signInSpy.mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('should navigate to dashboard on successful login', async () => {
    const signInSpy = vi.spyOn(authService, 'signInWithEmail');
    signInSpy.mockResolvedValue({} as any);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display link to sign up page', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should display forgot password link', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
    const forgotLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotLink).toBeInTheDocument();
  });
});
