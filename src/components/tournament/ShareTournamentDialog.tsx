import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Trophy, Copy, Check } from 'lucide-react';

interface ShareTournamentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: number;
  leagueName: string;
}

export function ShareTournamentDialog({
  isOpen,
  onClose,
  leagueId,
  leagueName,
}: ShareTournamentDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/league/${leagueId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Tournament Created!</DialogTitle>
          <DialogDescription className="text-center">
            Share this link with {leagueName} members so they can follow the bracket.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            readOnly
            value={shareUrl}
            className="font-mono text-sm"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy link'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose}>View Bracket</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
