import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamIdentity } from './TeamIdentity';

describe('TeamIdentity', () => {
  const defaultProps = {
    teamName: "Haaland's Hairband FC",
    managerName: 'Owen Smith',
  };

  it('renders without crashing', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the team name with correct styling', () => {
    render(<TeamIdentity {...defaultProps} />);
    const teamName = screen.getByText("Haaland's Hairband FC");
    expect(teamName).toBeInTheDocument();
    expect(teamName).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays the manager name with "Manager:" prefix', () => {
    render(<TeamIdentity {...defaultProps} />);
    const managerText = screen.getByText(/Manager:/);
    expect(managerText).toBeInTheDocument();
    expect(managerText).toHaveTextContent('Manager: Owen Smith');
  });

  it('applies muted foreground styling to manager name', () => {
    render(<TeamIdentity {...defaultProps} />);
    const managerText = screen.getByText(/Manager:/);
    expect(managerText).toHaveClass('text-muted-foreground');
  });

  it('handles long team names', () => {
    const longTeamName =
      'This Is An Extremely Long Team Name That Might Cause Layout Issues';
    render(<TeamIdentity teamName={longTeamName} managerName="John Doe" />);
    expect(screen.getByText(longTeamName)).toBeInTheDocument();
  });

  it('handles special characters in team name', () => {
    const specialTeamName = "FC <Script>alert('xss')</Script>";
    render(<TeamIdentity teamName={specialTeamName} managerName="Test User" />);
    expect(screen.getByText(specialTeamName)).toBeInTheDocument();
  });

  it('handles special characters in manager name', () => {
    const specialManagerName = "O'Connor-Smith Jr.";
    render(
      <TeamIdentity teamName="Test Team" managerName={specialManagerName} />
    );
    expect(
      screen.getByText(`Manager: ${specialManagerName}`)
    ).toBeInTheDocument();
  });
});
