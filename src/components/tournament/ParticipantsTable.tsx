// src/components/tournament/ParticipantsTable.tsx
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import type { Participant } from '../../types/tournament';

interface ParticipantsTableProps {
  participants: Participant[];
  seedingGameweek: number;
  friendIds?: Set<number>;
}

export function ParticipantsTable({
  participants,
  seedingGameweek,
  friendIds = new Set(),
}: ParticipantsTableProps) {
  const sortedParticipants = [...participants].sort((a, b) => a.seed - b.seed);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-1">Participants</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Initial seeding based on GW{seedingGameweek} league standings
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Seed</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Manager</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.map((participant) => (
            <TableRow key={participant.fplTeamId}>
              <TableCell className="font-medium">{participant.seed}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{participant.fplTeamName}</span>
                  {friendIds.has(participant.fplTeamId) && (
                    <Badge variant="outline" className="text-xs">
                      Friend
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {participant.managerName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
