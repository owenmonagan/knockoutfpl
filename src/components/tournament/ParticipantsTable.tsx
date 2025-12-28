// src/components/tournament/ParticipantsTable.tsx
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
}

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  const sortedParticipants = [...participants].sort((a, b) => a.seed - b.seed);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Participants</h3>
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
              <TableCell>{participant.fplTeamName}</TableCell>
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
