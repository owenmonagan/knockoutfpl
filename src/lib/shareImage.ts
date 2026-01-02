// src/lib/shareImage.ts

export interface ShareImageData {
  leagueName: string;
  roundName: string;
  participantCount: number;
  shareUrl: string;
  closestMatchStat?: string; // Optional: "Closest match: 2 points!"
}

export interface ShareImageResult {
  dataUrl: string;
  blob: Blob;
}

// Image dimensions (1.91:1 ratio - optimal for Twitter/Facebook)
const WIDTH = 600;
const HEIGHT = 315;

// Colors (matching brand)
const COLORS = {
  background: '#1a1a2e', // Dark background
  backgroundEnd: '#16213e', // Gradient end
  primary: '#4f46e5', // Indigo primary
  text: '#ffffff', // White text
  textMuted: '#a1a1aa', // Muted gray
  accent: '#22c55e', // Green accent
};

/**
 * Renders a shareable tournament image using HTML Canvas.
 */
export async function renderShareImage(
  data: ShareImageData
): Promise<ShareImageResult> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, COLORS.background);
  gradient.addColorStop(1, COLORS.backgroundEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Decorative bracket lines (subtle)
  ctx.strokeStyle = COLORS.primary + '40'; // 25% opacity
  ctx.lineWidth = 2;
  drawBracketDecoration(ctx);

  // Logo/Brand text
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText('KNOCKOUT FPL', 30, 40);

  // League name (main title)
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 32px system-ui, sans-serif';
  const leagueName = truncateText(ctx, data.leagueName, WIDTH - 60);
  ctx.fillText(leagueName, 30, 100);

  // Round name badge
  ctx.fillStyle = COLORS.primary;
  roundRect(ctx, 30, 120, ctx.measureText(data.roundName).width + 24, 32, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(data.roundName, 42, 141);

  // Participant count
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(`${data.participantCount} managers battling it out`, 30, 185);

  // Optional stat
  if (data.closestMatchStat) {
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'italic 14px system-ui, sans-serif';
    ctx.fillText(data.closestMatchStat, 30, 210);
  }

  // URL watermark at bottom
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '12px system-ui, sans-serif';
  const urlText = data.shareUrl.replace(/^https?:\/\//, '');
  ctx.fillText(urlText, 30, HEIGHT - 20);

  // Trophy icon (simple geometric representation)
  drawTrophyIcon(ctx, WIDTH - 80, HEIGHT - 80);

  // Get data URL
  const dataUrl = canvas.toDataURL('image/png');

  // Get blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Could not create blob'));
    }, 'image/png');
  });

  return { dataUrl, blob };
}

function drawBracketDecoration(ctx: CanvasRenderingContext2D) {
  // Right side bracket lines
  ctx.beginPath();
  ctx.moveTo(WIDTH - 100, 80);
  ctx.lineTo(WIDTH - 60, 80);
  ctx.lineTo(WIDTH - 60, 140);
  ctx.lineTo(WIDTH - 100, 140);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(WIDTH - 100, 175);
  ctx.lineTo(WIDTH - 60, 175);
  ctx.lineTo(WIDTH - 60, 235);
  ctx.lineTo(WIDTH - 100, 235);
  ctx.stroke();

  // Connecting line
  ctx.beginPath();
  ctx.moveTo(WIDTH - 60, 110);
  ctx.lineTo(WIDTH - 30, 110);
  ctx.lineTo(WIDTH - 30, 205);
  ctx.lineTo(WIDTH - 60, 205);
  ctx.stroke();
}

function drawTrophyIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = COLORS.primary + '60';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 40, y);
  ctx.lineTo(x + 35, y + 30);
  ctx.lineTo(x + 5, y + 30);
  ctx.closePath();
  ctx.fill();

  // Base
  ctx.fillRect(x + 10, y + 35, 20, 5);
  ctx.fillRect(x + 5, y + 40, 30, 5);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
  ctx.lineTo(x + radius, y + height);
  ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + radius);
  ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
  ctx.closePath();
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  let truncated = text;
  while (
    truncated.length > 0 &&
    ctx.measureText(truncated + '...').width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}
