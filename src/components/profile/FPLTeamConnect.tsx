import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface FPLTeamConnectProps {
  userId: string;
}

export function FPLTeamConnect({ userId }: FPLTeamConnectProps) {
  const [teamId, setTeamId] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fpl-team-id">FPL Team ID</Label>
        <Input
          id="fpl-team-id"
          type="number"
          placeholder="Enter your team ID"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        />
      </div>
      <Button disabled={!teamId}>Verify Team</Button>
    </div>
  );
}
