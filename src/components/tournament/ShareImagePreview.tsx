import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Download, Share2 } from 'lucide-react';
import { renderShareImage, type ShareImageData } from '../../lib/shareImage';

interface ShareImagePreviewProps {
  leagueName: string;
  roundName: string;
  participantCount: number;
  shareUrl: string;
  closestMatchStat?: string;
}

export function ShareImagePreview({
  leagueName,
  roundName,
  participantCount,
  shareUrl,
  closestMatchStat,
}: ShareImagePreviewProps) {
  const [imageData, setImageData] = useState<{
    dataUrl: string;
    blob: Blob;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if Web Share API supports sharing files
  const canShareFiles = typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator;

  useEffect(() => {
    async function generateImage() {
      setIsLoading(true);
      setError(null);

      try {
        const data: ShareImageData = {
          leagueName,
          roundName,
          participantCount,
          shareUrl,
          closestMatchStat,
        };

        const result = await renderShareImage(data);
        setImageData(result);
      } catch (err) {
        console.error('Failed to generate share image:', err);
        setError('Failed to generate image');
      } finally {
        setIsLoading(false);
      }
    }

    generateImage();
  }, [leagueName, roundName, participantCount, shareUrl, closestMatchStat]);

  const handleDownload = useCallback(() => {
    if (!imageData) return;

    const link = document.createElement('a');
    link.href = imageData.dataUrl;
    link.download = `${leagueName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-bracket.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageData, leagueName]);

  const handleShare = useCallback(async () => {
    if (!imageData || !canShareFiles) return;

    try {
      const file = new File([imageData.blob], 'knockout-bracket.png', {
        type: 'image/png',
      });

      const shareData = {
        title: `${leagueName} - Knockout FPL`,
        text: `Check out the ${roundName} bracket for ${leagueName}!`,
        url: shareUrl,
        files: [file],
      };

      // Check if we can share files
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to sharing without file
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
      }
    } catch (err) {
      // User cancelled or share failed - this is expected
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }, [imageData, canShareFiles, leagueName, roundName, shareUrl]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full aspect-[1.91/1] rounded-lg" />
        <p className="text-sm text-muted-foreground text-center">Generating preview...</p>
      </div>
    );
  }

  if (error || !imageData) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">{error || 'Could not generate preview'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image preview */}
      <div className="rounded-lg overflow-hidden border">
        <img
          src={imageData.dataUrl}
          alt="Share preview"
          className="w-full"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>

        {canShareFiles && (
          <Button
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
