import type { RouteName } from './routes';
import type { ViewportName } from './viewports';

export type ThresholdConfig = {
  /** Maximum allowed pixel difference ratio (0-1). Default: 0.01 (1%) */
  maxDiffRatio: number;
  /** Maximum allowed number of different pixels. Default: 100 */
  maxDiffPixels: number;
  /** Threshold for anti-aliasing detection (0-1). Default: 0.1 */
  antialiasThreshold: number;
};

const defaultThreshold: ThresholdConfig = {
  maxDiffRatio: 0.01,
  maxDiffPixels: 100,
  antialiasThreshold: 0.1,
};

/**
 * Per-route threshold overrides
 * Routes with dynamic content may need higher tolerances
 */
export const routeThresholds: Partial<Record<RouteName, Partial<ThresholdConfig>>> = {
  // Dashboard may have dynamic timestamps, allow slightly higher tolerance
  dashboard: {
    maxDiffRatio: 0.02,
    maxDiffPixels: 200,
  },
  // League view has dynamic bracket data
  league: {
    maxDiffRatio: 0.02,
    maxDiffPixels: 200,
  },
};

/**
 * Per-viewport threshold overrides
 * Mobile viewports may have more anti-aliasing differences
 */
export const viewportThresholds: Partial<Record<ViewportName, Partial<ThresholdConfig>>> = {
  mobile: {
    antialiasThreshold: 0.15,
  },
};

/**
 * Get the threshold config for a specific route and viewport
 */
export function getThreshold(route: RouteName, viewport: ViewportName): ThresholdConfig {
  return {
    ...defaultThreshold,
    ...routeThresholds[route],
    ...viewportThresholds[viewport],
  };
}
