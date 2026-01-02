// src/lib/shareImage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderShareImage, type ShareImageData } from './shareImage';

describe('renderShareImage', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockGradient: CanvasGradient;

  beforeEach(() => {
    mockGradient = {
      addColorStop: vi.fn(),
    } as unknown as CanvasGradient;

    mockContext = {
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      clip: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      createLinearGradient: vi.fn(() => mockGradient),
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 0,
      height: 0,
      toDataURL: vi.fn(() => 'data:image/png;base64,test'),
      toBlob: vi.fn((callback) => callback(new Blob(['test'], { type: 'image/png' }))),
    } as unknown as HTMLCanvasElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
  });

  const defaultData: ShareImageData = {
    leagueName: 'Test League',
    roundName: 'Round of 16',
    participantCount: 16,
    shareUrl: 'https://knockoutfpl.com/league/12345',
  };

  it('creates a canvas with correct dimensions', async () => {
    await renderShareImage(defaultData);
    expect(mockCanvas.width).toBe(600);
    expect(mockCanvas.height).toBe(315);
  });

  it('returns a data URL', async () => {
    const result = await renderShareImage(defaultData);
    expect(result.dataUrl).toBe('data:image/png;base64,test');
  });

  it('returns a blob', async () => {
    const result = await renderShareImage(defaultData);
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it('calls getContext with 2d', async () => {
    await renderShareImage(defaultData);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('draws the league name', async () => {
    await renderShareImage(defaultData);
    expect(mockContext.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Test League'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('draws the round name', async () => {
    await renderShareImage(defaultData);
    expect(mockContext.fillText).toHaveBeenCalledWith(
      'Round of 16',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('draws participant count text', async () => {
    await renderShareImage(defaultData);
    expect(mockContext.fillText).toHaveBeenCalledWith(
      '16 managers battling it out',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('draws the share URL without protocol', async () => {
    await renderShareImage(defaultData);
    expect(mockContext.fillText).toHaveBeenCalledWith(
      'knockoutfpl.com/league/12345',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('draws optional closest match stat when provided', async () => {
    const dataWithStat: ShareImageData = {
      ...defaultData,
      closestMatchStat: 'Closest match: 2 points!',
    };
    await renderShareImage(dataWithStat);
    expect(mockContext.fillText).toHaveBeenCalledWith(
      'Closest match: 2 points!',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('throws error when canvas context is not available', async () => {
    mockCanvas.getContext = vi.fn(() => null);
    await expect(renderShareImage(defaultData)).rejects.toThrow(
      'Could not get canvas context'
    );
  });

  it('throws error when blob creation fails', async () => {
    mockCanvas.toBlob = vi.fn((callback) => callback(null));
    await expect(renderShareImage(defaultData)).rejects.toThrow(
      'Could not create blob'
    );
  });
});
