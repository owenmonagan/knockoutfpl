import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
