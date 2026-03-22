/**
 * WuXing Distribution Module
 *
 * Implements weighted Five Elements analysis with seasonality adjustments
 * Reference: 八字命理後端模組研究.md §2.1-2.3
 */

import type { WuXing} from '../core/wuXing/relations';
import { stemToWuXing } from '../core/wuXing/relations';
import { getHiddenStems } from '../bazi/hiddenStems';
import { applySeasonalityAdjustment } from './seasonality';

export interface FourPillars {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}

export interface WuXingDistribution {
  /** Raw counts without weights */
  raw: {
    tiangan: Record<WuXing, number>;
    hiddenStems: Record<WuXing, number>;
  };
  /** Weighted scores after seasonality adjustment */
  adjusted: Record<WuXing, number>;
  /** Dominant element (max score) */
  dominant: WuXing;
  /** Deficient element (min score) */
  deficient: WuXing;
  /** Balance score (0-1, 1 is perfect balance) */
  balance: number;
}

/**
 * Count Tiangan (天干) scores - weight 1.0 each
 * Reference: §2.1.2
 */
export function getTianganScores(stems: string[]): Record<WuXing, number> {
  const scores: Record<WuXing, number> = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  };

  for (const stem of stems) {
    const wuXing = stemToWuXing(stem);
    scores[wuXing] += 1.0;
  }

  return scores;
}

/**
 * Calculate weighted hidden stem scores from branches
 * Reference: §2.2.2
 *
 * Weights:
 * - Primary (本气): 1.0 for single-stem branches, 0.6 for multi-stem
 * - Middle (中气): 0.3
 * - Residual (余气): 0.1
 */
export function getHiddenStemScores(branches: string[]): Record<WuXing, number> {
  const scores: Record<WuXing, number> = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  };

  for (const branch of branches) {
    const hiddenStems = getHiddenStems(branch);

    for (const hs of hiddenStems) {
      const wuXing = stemToWuXing(hs.stem);

      // Convert weight category to numeric value
      let weight = 0;
      if (hs.weight === 'primary') {
        // Single stem branches get 1.0, multi-stem get 0.6
        weight = hiddenStems.length === 1 ? 1.0 : 0.6;
      } else if (hs.weight === 'middle') {
        weight = 0.3;
      } else if (hs.weight === 'residual') {
        weight = 0.1;
      }

      scores[wuXing] += weight;
    }
  }

  return scores;
}

/**
 * Calculate total scores with seasonality adjustment
 * Reference: §2.3.2
 *
 * Formula: Total_Score[Element] = (Tiangan_Count + Hidden_Stem_Weighted_Sum) * Seasonality_Coefficient
 */
export function getTotalScores(
  tianganScores: Record<WuXing, number>,
  hiddenStemScores: Record<WuXing, number>,
  monthBranch: string
): Record<WuXing, number> {
  // Combine raw scores
  const rawScores: Record<WuXing, number> = {
    Wood: tianganScores.Wood + hiddenStemScores.Wood,
    Fire: tianganScores.Fire + hiddenStemScores.Fire,
    Earth: tianganScores.Earth + hiddenStemScores.Earth,
    Metal: tianganScores.Metal + hiddenStemScores.Metal,
    Water: tianganScores.Water + hiddenStemScores.Water,
  };

  // Apply seasonality adjustment
  return applySeasonalityAdjustment(rawScores, monthBranch);
}

/**
 * Calculate WuXing distribution from four pillars
 * Main entry point
 * Reference: §2.1-2.3
 */
export function calculateWuXingDistribution(fourPillars: FourPillars): WuXingDistribution {
  // Extract stems and branches
  const stems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem,
  ];

  const branches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];

  // Calculate raw scores
  const tianganScores = getTianganScores(stems);
  const hiddenStemScores = getHiddenStemScores(branches);

  // Calculate adjusted scores
  const adjustedScores = getTotalScores(
    tianganScores,
    hiddenStemScores,
    fourPillars.month.branch
  );

  // Find dominant and deficient elements
  let dominant: WuXing = 'Wood';
  let deficient: WuXing = 'Wood';
  let maxScore = adjustedScores.Wood;
  let minScore = adjustedScores.Wood;

  const elements: WuXing[] = ['Fire', 'Earth', 'Metal', 'Water'];
  for (const element of elements) {
    if (adjustedScores[element] > maxScore) {
      maxScore = adjustedScores[element];
      dominant = element;
    }
    if (adjustedScores[element] < minScore) {
      minScore = adjustedScores[element];
      deficient = element;
    }
  }

  // Calculate balance (1 - stddev/mean)
  const values = Object.values(adjustedScores);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stddev = Math.sqrt(variance);
  const balance = mean > 0 ? Math.max(0, 1 - stddev / mean) : 0;

  return {
    raw: {
      tiangan: tianganScores,
      hiddenStems: hiddenStemScores,
    },
    adjusted: adjustedScores,
    dominant,
    deficient,
    balance,
  };
}
