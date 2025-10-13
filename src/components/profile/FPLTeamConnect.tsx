import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { getFPLTeamInfo } from '../../services/fpl';

interface FPLTeamConnectProps {
  userId: string;
}

export function FPLTeamConnect({ userId }: FPLTeamConnectProps) {
  const [teamId, setTeamId] = useState('');

  const handleVerify = async () => {
    const teamIdNum = parseInt(teamId, 10);
    await getFPLTeamInfo(teamIdNum);
  };

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
      <Button disabled={!teamId} onClick={handleVerify}>Verify Team</Button>
    </div>
  );
}
