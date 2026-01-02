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
import { Check, Copy, Link, Trophy } from 'lucide-react';
import { ShareImagePreview } from './ShareImagePreview';

interface ShareTournamentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: number;
  leagueName: string;
  // New optional props for enhanced share
  roundName?: string;
  participantCount?: number;
  closestMatchStat?: string;
}

export function ShareTournamentDialog({
  isOpen,
  onClose,
  leagueId,
  leagueName,
  roundName,
  participantCount,
  closestMatchStat,
}: ShareTournamentDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  const shareUrl = `${window.location.origin}/league/${leagueId}`;

  // Determine if we have enhanced data for image preview
  const hasEnhancedData = roundName && participantCount;

  const handleDialogClose = () => {
    setShowLinkInput(false);
    setCopied(false);
    onClose();
  };

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDialogClose()}>
      <DialogContent className="sm:max-w-md">
        {hasEnhancedData ? (
          // Enhanced mode with image preview
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                Share Tournament
              </DialogTitle>
            </DialogHeader>
            <ShareImagePreview
              leagueName={leagueName}
              roundName={roundName}
              participantCount={participantCount}
              shareUrl={shareUrl}
              closestMatchStat={closestMatchStat}
            />
            {showLinkInput ? (
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
            ) : (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setShowLinkInput(true)}
              >
                <Link className="h-4 w-4 mr-2" />
                Copy link instead
              </Button>
            )}
          </>
        ) : (
          // Simple mode (original behavior)
          <>
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">
                Tournament Created!
              </DialogTitle>
              <DialogDescription className="text-center">
                Share this link with {leagueName} members so they can follow the
                bracket.
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
              <Button onClick={handleDialogClose}>View Bracket</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
