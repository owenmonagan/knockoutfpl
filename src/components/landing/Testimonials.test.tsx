import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Testimonials } from './Testimonials';

describe('Testimonials', () => {
  it('renders section header', () => {
    render(<Testimonials />);

    expect(screen.getByText('What Managers Are Saying')).toBeInTheDocument();
    expect(
      screen.getByText(/Trusted by over 5,000 mini-leagues worldwide/i)
    ).toBeInTheDocument();
  });

  it('renders all testimonial cards', () => {
    render(<Testimonials />);

    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
    expect(screen.getByText('Mike Davies')).toBeInTheDocument();
  });

  it('renders testimonial handles', () => {
    render(<Testimonials />);

    expect(screen.getByText('@FPL_AlexJ')).toBeInTheDocument();
    expect(screen.getByText('@SoccerSarah99')).toBeInTheDocument();
    expect(screen.getByText('@LeagueAdminMike')).toBeInTheDocument();
  });

  it('renders testimonial quotes', () => {
    render(<Testimonials />);

    expect(
      screen.getByText(/Made our office league 10x more interesting/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Finally, a way to settle the H2H debate/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Set it up in 5 minutes for our mini-league/i)
    ).toBeInTheDocument();
  });

  it('renders star ratings', () => {
    render(<Testimonials />);

    const starRatings = screen.getAllByRole('img', { name: /5 out of 5 stars/i });
    expect(starRatings).toHaveLength(3); // One for each testimonial
  });
});
