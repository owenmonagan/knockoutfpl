import { Card, CardContent } from '@/components/ui/card';
import { ParticipantsTable } from '../ParticipantsTable';
import type { Participant } from '@/types/tournament';

interface ParticipantsTabProps {
  participants: Participant[];
  seedingGameweek: number;
}

export function ParticipantsTab({ participants, seedingGameweek }: ParticipantsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <ParticipantsTable
          participants={participants}
          seedingGameweek={seedingGameweek}
        />
      </CardContent>
    </Card>
  );
}
