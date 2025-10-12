import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignUpPage } from './SignUpPage';

describe('SignUpPage', () => {
  it('should render the signup form', () => {
    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
