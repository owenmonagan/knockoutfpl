import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function Hero() {
  return (
    <div>
      <Badge>Now Live - Challenge Your Friends</Badge>
      <h1>Knockout FPL</h1>
      <p>Head-to-head Fantasy Premier League challenges. Battle your friends each gameweek and track your winning record.</p>
      <Button asChild>
        <Link to="/signup">Get Started</Link>
      </Button>
    </div>
  );
}
