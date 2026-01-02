// src/components/tournament/TeamSearchOverlay.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { Participant } from '../../types/tournament';

export interface TeamSearchOverlayProps {
  participants: Participant[];
  onConfirm: (fplTeamId: number) => void;
  onClose: () => void;
}

const DEBOUNCE_DELAY_MS = 300;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function searchParticipants(
  participants: Participant[],
  query: string
): Participant[] {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();

  return participants.filter(
    (p) =>
      p.fplTeamName.toLowerCase().includes(lowerQuery) ||
      p.managerName.toLowerCase().includes(lowerQuery)
  );
}

export function TeamSearchOverlay({
  participants,
  onConfirm,
  onClose,
}: TeamSearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_DELAY_MS);
  const results = searchParticipants(participants, debouncedQuery);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleConfirm = useCallback(
    (fplTeamId: number) => {
      onConfirm(fplTeamId);
    },
    [onConfirm]
  );

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasQuery = searchQuery.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Find Your Team</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close search"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              close
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Find your team..."
          value={searchQuery}
          onChange={handleInputChange}
          aria-label="Search for your team"
        />

        {hasQuery && (
          <ul
            className="space-y-2 max-h-64 overflow-y-auto"
            role="listbox"
            aria-label="Search results"
          >
            {hasResults ? (
              results.map((participant) => (
                <li
                  key={participant.fplTeamId}
                  role="option"
                  aria-selected="false"
                  className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {participant.fplTeamName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {participant.managerName}
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleConfirm(participant.fplTeamId)}
                    className="ml-3 flex-shrink-0"
                  >
                    This is me
                  </Button>
                </li>
              ))
            ) : (
              <li className="text-center py-4 text-muted-foreground">
                No teams found matching "{debouncedQuery}"
              </li>
            )}
          </ul>
        )}

        {!hasQuery && (
          <p className="text-center py-4 text-muted-foreground">
            Start typing to find your team
          </p>
        )}
      </CardContent>
    </Card>
  );
}
