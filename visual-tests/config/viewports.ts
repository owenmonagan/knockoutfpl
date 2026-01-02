export const viewports = {
  mobile: { width: 375, height: 667, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1920, height: 1080, name: 'desktop' },
} as const;

export type ViewportName = keyof typeof viewports;
export type Viewport = (typeof viewports)[ViewportName];

/**
 * Get filename suffix for a viewport
 * @example getViewportFilename('mobile') // 'mobile-375x667'
 */
export function getViewportFilename(name: ViewportName): string {
  const vp = viewports[name];
  return `${vp.name}-${vp.width}x${vp.height}`;
}
