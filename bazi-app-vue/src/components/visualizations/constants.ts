/**
 * Shared constants for WuXing visualizations
 * Extracted from WuXingChart.vue for reusability across multiple chart types
 * Phase 3: Direct CSS variable mapping for optimal performance and SSR compatibility
 */

/**
 * Element colors mapped directly to CSS variable references
 * These CSS variables are defined in design-tokens.css and support automatic dark mode adaptation
 *
 * Phase 3 Optimization Benefits:
 * - ✅ Zero runtime overhead (no getComputedStyle calls)
 * - ✅ SSR hydration safe (server and client render identical strings)
 * - ✅ Native browser CSS variable resolution
 * - ✅ Instant theme switching without Vue re-renders
 *
 * Format: 'var(--css-variable, fallback-hex)'
 * - Browser automatically resolves CSS variables based on current theme
 * - Fallback hex colors match Light Mode values for progressive enhancement
 */
export const ELEMENT_COLORS: Record<string, string> = {
  木: 'var(--element-wood, #2e7d32)',
  火: 'var(--element-fire, #c62828)',
  土: 'var(--element-earth, #5d4037)',
  金: 'var(--element-metal, #424242)',
  水: 'var(--element-water, #01579b)',
};

export const ELEMENT_NAMES = ['木', '火', '土', '金', '水'] as const;

export type ElementName = (typeof ELEMENT_NAMES)[number];

export interface WuXingDistribution {
  raw: { 木: number; 火: number; 土: number; 金: number; 水: number };
  adjusted: { 木: number; 火: number; 土: number; 金: number; 水: number };
  dominant: string | null;
  deficient: string | null;
  balance: number;
}
