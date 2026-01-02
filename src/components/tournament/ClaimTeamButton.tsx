// src/components/tournament/ClaimTeamButton.tsx
import { UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface ClaimTeamButtonProps {
  fplTeamId: number;
  onClaim: (fplTeamId: number) => void;
}

export function ClaimTeamButton({ fplTeamId, onClaim }: ClaimTeamButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation
              e.stopPropagation();
              onClaim(fplTeamId);
            }}
          >
            <UserPlus className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Claim this team</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
