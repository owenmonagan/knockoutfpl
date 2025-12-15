import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordPage } from './ForgotPasswordPage';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  auth: {},
}));

import { sendPasswordResetEmail } from 'firebase/auth';

describe('ForgotPasswordPage', () => {
  it('renders the forgot password form', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  describe('form submission', () => {
    it('shows success message after submitting email', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValue();

      render(
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      expect(await screen.findByText(/password reset link/i)).toBeInTheDocument();
    });

    it('shows error message when submission fails', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error('Network error'));

      render(
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('has a link back to login page', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole('link', { name: /log in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
