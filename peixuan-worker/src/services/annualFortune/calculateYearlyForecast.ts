/**
 * Yearly Forecast Calculator
 *
 * Calculates annual fortune forecast by splitting the query period at Lichun boundaries.
 * Each period uses its corresponding annual pillar for fortune analysis.
 *
 * Reference: Phase 1 - Backend Core Implementation, Task 1.2
 * Phase 2: Refactored to support flexible duration (6/12 months)
 */

import { addMonths } from 'date-fns';
import { getAnnualPillar } from '../../calculation/annual/liuchun';
import { locateAnnualLifePalace, type Palace } from '../../calculation/annual/palace';
import type { FourPillars } from '../../calculation/bazi/fourPillars';
import type { GanZhi } from '../../calculation/core/ganZhi';
import { getLichunDatesBetween } from './getLichunDatesBetween';
import { analyzeTaiSui, type TaiSuiAnalysisResult } from '../annual/taiSuiAnalysis';
import {
  detectStemCombinations,
  detectBranchClashes,
  detectHarmoniousCombinations,
  type StemCombination,
  type BranchClash,
  type HarmoniousCombination,
} from '../../calculation/annual/interaction';

/**
 * Yearly forecast period result
 */
export interface YearlyPeriod {
  /** Period start date */
  startDate: Date;
  /** Period end date */
  endDate: Date;
  /** Annual pillar (year stem/branch) for this period */
  annualPillar: GanZhi;
  /** Annual life palace position (0-11) */
  annualLifePalacePosition: number;
  /** Period duration in days */
  durationDays: number;
  /** Period weight (normalized 0-1, based on duration) */
  weight: number;
  /** Tai Sui analysis for this period */
  taiSuiAnalysis?: TaiSuiAnalysisResult;
  /** Interactions (stem combinations, branch clashes, harmonious combinations) */
  interactions?: {
    stemCombinations: StemCombination[];
    branchClashes: BranchClash[];
    harmoniousCombinations: HarmoniousCombination[];
  };
}

/**
 * Yearly forecast result
 */
export interface YearlyForecast {
  /** Query start date */
  queryDate: Date;
  /** Query end date (queryDate + durationMonths) */
  endDate: Date;
  /** Array of forecast periods (1 or 2 periods) */
  periods: YearlyPeriod[];
  /** Forecast duration in months */
  durationMonths: number;
}

/**
 * Options for calculating yearly forecast
 */
export interface YearlyForecastOptions {
  /** User's birth date (not currently used, reserved for future) */
  birthDate: Date;
  /** Start date of the forecast period */
  queryDate: Date;
  /** ZiWei palace array (12 palaces) */
  palaces: Palace[];
  /** User's four pillars */
  fourPillars: FourPillars;
  /** Optional current Dayun (大運) GanZhi for interaction analysis */
  currentDayun?: GanZhi;
  /** Forecast duration in months (default: 12 for backward compatibility) */
  durationMonths?: number;
}

/**
 * Calculate duration in days between two dates
 *
 * @param startDate - Period start date
 * @param endDate - Period end date
 * @returns Duration in days (rounded to 2 decimal places)
 */
export function calculateDuration(startDate: Date, endDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = durationMs / msPerDay;

  // Round to 2 decimal places
  return Math.round(durationDays * 100) / 100;
}

/**
 * Calculate period weight based on duration
 *
 * Weight is normalized to sum to 1.0 across all periods.
 *
 * @param durationDays - Period duration in days
 * @param totalDays - Total duration across all periods
 * @returns Weight value (0-1, rounded to 4 decimal places)
 */
export function calculateWeight(durationDays: number, totalDays: number): number {
  if (totalDays === 0) {
    return 0;
  }

  const weight = durationDays / totalDays;

  // Round to 4 decimal places
  return Math.round(weight * 10000) / 10000;
}

/**
 * Calculate yearly forecast for a given birth date and query date
 *
 * Analyzes the period starting from queryDate with configurable duration:
 * - If Lichun exists within the period: splits into currentYear and nextYear periods
 * - If no Lichun: single currentYear period only
 *
 * Each period includes:
 * - Annual pillar (determined by Lichun boundary)
 * - Annual life palace position (located in ZiWei palaces)
 * - Duration and weight (for proportional analysis)
 * - Tai Sui analysis (犯太歲/沖太歲/刑太歲/破太歲/害太歲)
 * - Interactions (天干五合/地支六沖/三合三會)
 *
 * @param options - Options object containing all parameters
 * @returns YearlyForecast object with period breakdown
 *
 * @example
 * // Query starting 2025-12-06, Lichun 2026 is Feb 3 (12 months)
 * calculateYearlyForecast({
 *   birthDate: new Date('1990-01-01'),
 *   queryDate: new Date('2025-12-06'),
 *   palaces,
 *   fourPillars,
 *   currentDayun: { stem: '甲', branch: '寅' }
 * });
 * // Returns: 2 periods
 * // Period 1: 2025-12-06 to 2026-02-03 (乙巳 year)
 * // Period 2: 2026-02-03 to 2026-12-06 (丙午 year)
 *
 * @example
 * // Query starting 2026-01-02 for 6 months
 * calculateYearlyForecast({
 *   birthDate: new Date('1990-01-01'),
 *   queryDate: new Date('2026-01-02'),
 *   palaces,
 *   fourPillars,
 *   durationMonths: 6
 * });
 * // Returns: 2 periods (spans Lichun 2026-02-04)
 * // Period 1: 2026-01-02 to 2026-02-04 (乙巳 year)
 * // Period 2: 2026-02-04 to 2026-07-02 (丙午 year)
 */
export function calculateYearlyForecast(options: YearlyForecastOptions): YearlyForecast {
  // Extract parameters from options object
  const actualQueryDate: Date = options.queryDate;
  const actualPalaces: Palace[] = options.palaces;
  const actualFourPillars: FourPillars = options.fourPillars;
  const actualCurrentDayun: GanZhi | undefined = options.currentDayun;
  const actualDurationMonths: number = options.durationMonths ?? 12;

  // Safety check: prevent excessive duration that could cause infinite loops
  const MAX_DURATION_MONTHS = 24;
  if (actualDurationMonths < 1 || actualDurationMonths > MAX_DURATION_MONTHS) {
    throw new Error(
      `durationMonths must be between 1 and ${MAX_DURATION_MONTHS}, got ${actualDurationMonths}`
    );
  }

  // Calculate end date using date-fns addMonths
  const endDate = addMonths(actualQueryDate, actualDurationMonths);

  // Get all Lichun dates within the period
  const lichunDates = getLichunDatesBetween(actualQueryDate, endDate);

  const periods: YearlyPeriod[] = [];

  if (lichunDates.length === 0) {
    // No Lichun: single period covering entire year
    const annualPillar = getAnnualPillar(actualQueryDate);
    const annualLifePalacePosition = locateAnnualLifePalace(annualPillar.branch, actualPalaces);
    const durationDays = calculateDuration(actualQueryDate, endDate);

    // Calculate Tai Sui analysis
    const taiSuiAnalysis = analyzeTaiSui(annualPillar, actualFourPillars);

    // Calculate interactions
    const stemCombinations = detectStemCombinations(annualPillar.stem, actualFourPillars);
    const branchClashes = detectBranchClashes(annualPillar.branch, actualFourPillars);
    const harmoniousCombinations = detectHarmoniousCombinations(
      annualPillar.branch,
      actualFourPillars,
      actualCurrentDayun?.branch
    );

    periods.push({
      startDate: actualQueryDate,
      endDate,
      annualPillar,
      annualLifePalacePosition,
      durationDays,
      weight: 1.0, // Single period gets full weight
      taiSuiAnalysis,
      interactions: {
        stemCombinations,
        branchClashes,
        harmoniousCombinations,
      },
    });
  } else {
    // Lichun exists: split into currentYear and nextYear periods
    const lichunDate = lichunDates[0]; // Take the first Lichun

    // Period 1: queryDate → lichunDate (current year)
    const currentYearPillar = getAnnualPillar(actualQueryDate);
    const currentYearPalacePosition = locateAnnualLifePalace(currentYearPillar.branch, actualPalaces);
    const currentYearDuration = calculateDuration(actualQueryDate, lichunDate);

    // Calculate Tai Sui analysis for current year
    const currentTaiSuiAnalysis = analyzeTaiSui(currentYearPillar, actualFourPillars);

    // Calculate interactions for current year
    const currentStemCombinations = detectStemCombinations(currentYearPillar.stem, actualFourPillars);
    const currentBranchClashes = detectBranchClashes(currentYearPillar.branch, actualFourPillars);
    const currentHarmoniousCombinations = detectHarmoniousCombinations(
      currentYearPillar.branch,
      actualFourPillars,
      actualCurrentDayun?.branch
    );

    // Period 2: lichunDate → endDate (next year)
    const nextYearPillar = getAnnualPillar(lichunDate);
    const nextYearPalacePosition = locateAnnualLifePalace(nextYearPillar.branch, actualPalaces);
    const nextYearDuration = calculateDuration(lichunDate, endDate);

    // Calculate Tai Sui analysis for next year
    const nextTaiSuiAnalysis = analyzeTaiSui(nextYearPillar, actualFourPillars);

    // Calculate interactions for next year
    const nextStemCombinations = detectStemCombinations(nextYearPillar.stem, actualFourPillars);
    const nextBranchClashes = detectBranchClashes(nextYearPillar.branch, actualFourPillars);
    const nextHarmoniousCombinations = detectHarmoniousCombinations(
      nextYearPillar.branch,
      actualFourPillars,
      actualCurrentDayun?.branch
    );

    // Calculate total duration for weight normalization
    const totalDuration = currentYearDuration + nextYearDuration;

    periods.push({
      startDate: actualQueryDate,
      endDate: lichunDate,
      annualPillar: currentYearPillar,
      annualLifePalacePosition: currentYearPalacePosition,
      durationDays: currentYearDuration,
      weight: calculateWeight(currentYearDuration, totalDuration),
      taiSuiAnalysis: currentTaiSuiAnalysis,
      interactions: {
        stemCombinations: currentStemCombinations,
        branchClashes: currentBranchClashes,
        harmoniousCombinations: currentHarmoniousCombinations,
      },
    });

    periods.push({
      startDate: lichunDate,
      endDate,
      annualPillar: nextYearPillar,
      annualLifePalacePosition: nextYearPalacePosition,
      durationDays: nextYearDuration,
      weight: calculateWeight(nextYearDuration, totalDuration),
      taiSuiAnalysis: nextTaiSuiAnalysis,
      interactions: {
        stemCombinations: nextStemCombinations,
        branchClashes: nextBranchClashes,
        harmoniousCombinations: nextHarmoniousCombinations,
      },
    });
  }

  return {
    queryDate: actualQueryDate,
    endDate,
    periods,
    durationMonths: actualDurationMonths,
  };
}

/**
 * Calculate six-month forecast for a given birth date and query date
 *
 * Convenience wrapper that calls calculateYearlyForecast with durationMonths = 6.
 * Useful for "near-term fortune" queries.
 *
 * @param options - Options object (same as calculateYearlyForecast, durationMonths will be overridden to 6)
 * @returns YearlyForecast object with 6-month period breakdown
 *
 * @example
 * // Query starting 2026-01-02 for 6 months
 * calculateSixMonthForecast({
 *   birthDate: new Date('1990-01-01'),
 *   queryDate: new Date('2026-01-02'),
 *   palaces,
 *   fourPillars
 * });
 * // Returns: 2 periods (spans Lichun 2026-02-04)
 * // Period 1: 2026-01-02 to 2026-02-04 (乙巳 year)
 * // Period 2: 2026-02-04 to 2026-07-02 (丙午 year)
 */
export function calculateSixMonthForecast(options: YearlyForecastOptions): YearlyForecast {
  return calculateYearlyForecast({
    ...options,
    durationMonths: 6,
  });
}
