import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface FPLTeamConnectProps {
  userId: string;
}

export function FPLTeamConnect({ userId }: FPLTeamConnectProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fpl-team-id">FPL Team ID</Label>
        <Input
          id="fpl-team-id"
          type="number"
          placeholder="Enter your team ID"
        />
      </div>
      <Button>Verify Team</Button>
    </div>
  );
}
