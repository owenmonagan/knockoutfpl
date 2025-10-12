import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div>
      Knockout FPL
      <Link to="/signup">Get Started</Link>
      <Link to="/login">Log In</Link>
    </div>
  );
}
