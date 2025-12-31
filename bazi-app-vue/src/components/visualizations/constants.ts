/**
 * Shared constants for WuXing visualizations
 * Extracted from WuXingChart.vue for reusability across multiple chart types
 */

export const ELEMENT_COLORS: Record<string, string> = {
  木: '#10b981', // Green (Tailwind emerald-500)
  火: '#ef4444', // Red (Tailwind red-500)
  土: '#f59e0b', // Amber/Orange (Tailwind amber-500)
  金: '#fbbf24', // Gold/Yellow (Tailwind yellow-400)
  水: '#3b82f6', // Blue (Tailwind blue-500)
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
