import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div>
      Knockout FPL
      <Link to="/signup">Sign Up</Link>
      <Link to="/login">Log In</Link>
    </div>
  );
}
