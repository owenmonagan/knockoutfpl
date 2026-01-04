// src/components/tournament/ParticipantsTable.tsx
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import type { Participant, TournamentEntry } from '../../types/tournament';
import { getManagerName, getTeamName } from '../../types/tournament';

/**
 * Normalized row data for display.
 * Works with both legacy Participant and new TournamentEntry types.
 */
interface ParticipantRow {
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  status: 'active' | 'eliminated';
  eliminationRound?: number;
}

/**
 * Type guard to check if an item is a TournamentEntry
 */
function isTournamentEntry(
  item: Participant | TournamentEntry
): item is TournamentEntry {
  return 'entryId' in item && 'entry' in item;
}

/**
 * Normalize participants to a common display format
 */
function normalizeToRow(item: Participant | TournamentEntry): ParticipantRow {
  if (isTournamentEntry(item)) {
    return {
      entryId: item.entryId,
      teamName: getTeamName(item),
      managerName: getManagerName(item),
      seed: item.seed,
      status: item.status,
      eliminationRound: item.eliminationRound,
    };
  }
  // Legacy Participant format
  return {
    entryId: item.fplTeamId,
    teamName: item.fplTeamName,
    managerName: item.managerName,
    seed: item.seed,
    status: 'active', // Legacy format doesn't have status
    eliminationRound: undefined,
  };
}

interface ParticipantsTableProps {
  /** Accepts both legacy Participant[] and new TournamentEntry[] formats */
  participants: Participant[] | TournamentEntry[];
  seedingGameweek: number;
  friendIds?: Set<number>;
}

export function ParticipantsTable({
  participants,
  seedingGameweek,
  friendIds = new Set(),
}: ParticipantsTableProps) {
  // Normalize and sort participants
  const sortedRows = useMemo(() => {
    return participants
      .map(normalizeToRow)
      .sort((a, b) => a.seed - b.seed);
  }, [participants]);

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
          {sortedRows.map((row) => (
            <TableRow key={row.entryId}>
              <TableCell className="font-medium">{row.seed}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{row.teamName}</span>
                  {friendIds.has(row.entryId) && (
                    <Badge variant="outline" className="text-xs">
                      Friend
                    </Badge>
                  )}
                  {row.status === 'eliminated' && (
                    <Badge variant="secondary" className="text-xs">
                      Out R{row.eliminationRound}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.managerName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
