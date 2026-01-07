/**
 * Shared constants for WuXing visualizations
 * Extracted from WuXingChart.vue for reusability across multiple chart types
 * Phase 2: Migrated to CSS variables for dark mode support
 */

/**
 * Get element color from CSS variable
 * This function reads the color value from CSS variables defined in design-tokens.css
 * Supports automatic dark mode adaptation via CSS variable system
 */
function getElementColor(element: string): string {
  if (typeof window === 'undefined') {
    // Fallback for SSR or non-browser environments
    const fallbacks: Record<string, string> = {
      木: '#2e7d32',
      火: '#c62828',
      土: '#5d4037',
      金: '#424242',
      水: '#01579b',
    };
    return fallbacks[element] || '#000000';
  }

  const varMap: Record<string, string> = {
    木: '--element-wood',
    火: '--element-fire',
    土: '--element-earth',
    金: '--element-metal',
    水: '--element-water',
  };

  const cssVar = varMap[element];
  if (!cssVar) return '#000000';

  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();

  return color || fallbacks[element] || '#000000';
}

// Fallback colors for SSR/initial render
const fallbacks: Record<string, string> = {
  木: '#2e7d32',
  火: '#c62828',
  土: '#5d4037',
  金: '#424242',
  水: '#01579b',
};

/**
 * Element colors mapped to CSS variables
 * These values are computed at runtime to support dark mode adaptation
 */
export const ELEMENT_COLORS: Record<string, string> = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      return getElementColor(prop);
    },
  }
);

export const ELEMENT_NAMES = ['木', '火', '土', '金', '水'] as const;

export type ElementName = (typeof ELEMENT_NAMES)[number];

export interface WuXingDistribution {
  raw: { 木: number; 火: number; 土: number; 金: number; 水: number };
  adjusted: { 木: number; 火: number; 土: number; 金: number; 水: number };
  dominant: string | null;
  deficient: string | null;
  balance: number;
}
