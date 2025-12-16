import { useState } from 'react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function ConnectPage() {
  const [teamId, setTeamId] = useState('');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Connect Your FPL Team</h1>
          <p className="text-muted-foreground">Let's see what you're made of.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-id">FPL Team ID</Label>
          <Input
            id="team-id"
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="158256"
          />
          <button
            type="button"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Where's my Team ID?
          </button>
        </div>

        <Button type="button" className="w-full" size="lg">
          Find My Team
        </Button>
      </div>
    </main>
  );
}
