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
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const teamIdNum = parseInt(teamId, 10);
      await getFPLTeamInfo(teamIdNum);
    } finally {
      setIsVerifying(false);
    }
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
      <Button disabled={!teamId || isVerifying} onClick={handleVerify}>
        {isVerifying ? 'Verifying...' : 'Verify Team'}
      </Button>
    </div>
  );
}
