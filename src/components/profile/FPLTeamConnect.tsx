import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { getFPLTeamInfo } from '../../services/fpl';
import { connectFPLTeam } from '../../services/user';

interface FPLTeamConnectProps {
  userId: string;
}

export function FPLTeamConnect({ userId }: FPLTeamConnectProps) {
  const [teamId, setTeamId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedTeam, setVerifiedTeam] = useState<{
    teamId: number;
    teamName: string;
    managerName: string;
  } | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const teamIdNum = parseInt(teamId, 10);
      const teamInfo = await getFPLTeamInfo(teamIdNum);
      setVerifiedTeam(teamInfo);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConnect = async () => {
    if (!verifiedTeam) return;
    await connectFPLTeam(userId, verifiedTeam.teamId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your FPL Team</CardTitle>
        <CardDescription>Enter your FPL Team ID to connect your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {verifiedTeam && (
          <div className="space-y-4">
            <div>
              <p>{verifiedTeam.teamName}</p>
              <p>{verifiedTeam.managerName}</p>
            </div>
            <Button onClick={handleConnect}>Connect Team</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
