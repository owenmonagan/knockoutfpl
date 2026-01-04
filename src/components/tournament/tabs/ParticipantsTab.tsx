import { Card, CardContent } from '@/components/ui/card';
import { ParticipantsTable } from '../ParticipantsTable';
import type { Participant, TournamentEntry } from '@/types/tournament';

interface ParticipantsTabProps {
  /** Accepts both legacy Participant[] and new TournamentEntry[] formats */
  participants: Participant[] | TournamentEntry[];
  seedingGameweek: number;
  friendIds?: Set<number>;
}

export function ParticipantsTab({
  participants,
  seedingGameweek,
  friendIds = new Set(),
}: ParticipantsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <ParticipantsTable
          participants={participants}
          seedingGameweek={seedingGameweek}
          friendIds={friendIds}
        />
      </CardContent>
    </Card>
  );
}
