// src/components/tournament/FriendsActivity.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { FriendInTournament } from '@/services/friends';

interface FriendsActivityProps {
  friends: FriendInTournament[] | null;
  isLoading?: boolean;
  maxDisplay?: number;
}

/**
 * Friends Activity section for the Overview tab.
 * Shows friends in the tournament and their shared league connections.
 */
export function FriendsActivity({
  friends,
  isLoading = false,
  maxDisplay = 5,
}: FriendsActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No friends found in this tournament. Friends are managers you share other mini-leagues with.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedFriends = friends.slice(0, maxDisplay);
  const remainingCount = friends.length - maxDisplay;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Friends Activity
          <Badge variant="secondary" className="ml-auto">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedFriends.map((friend) => (
          <div
            key={friend.fplTeamId}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{friend.teamName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {friend.managerName} • Seed #{friend.seed}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-4">
              <Badge
                variant={friend.status === 'in' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {friend.status === 'in' ? 'Active' : `Out R${friend.eliminatedRound}`}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {friend.sharedLeagueCount} shared league{friend.sharedLeagueCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            +{remainingCount} more friend{remainingCount !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
