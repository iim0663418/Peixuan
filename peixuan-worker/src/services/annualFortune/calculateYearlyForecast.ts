/**
 * Yearly Forecast Calculator
 *
 * Calculates annual fortune forecast by splitting the query period at Lichun boundaries.
 * Each period uses its corresponding annual pillar for fortune analysis.
 *
 * Reference: Phase 1 - Backend Core Implementation, Task 1.2
 */

import { getAnnualPillar } from '../../calculation/annual/liuchun';
import { locateAnnualLifePalace } from '../../calculation/annual/palace';
import type { Palace } from '../../calculation/annual/palace';
import type { FourPillars } from '../../calculation/bazi/fourPillars';
import type { GanZhi } from '../../calculation/core/ganZhi';
import { getLichunDatesBetween } from './getLichunDatesBetween';
import { analyzeTaiSui } from '../annual/taiSuiAnalysis';
import type { TaiSuiAnalysisResult } from '../annual/taiSuiAnalysis';
import {
  detectStemCombinations,
  detectBranchClashes,
  detectHarmoniousCombinations,
} from '../../calculation/annual/interaction';
import type {
  StemCombination,
  BranchClash,
  HarmoniousCombination,
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
  /** Query end date (queryDate + 365 days) */
  endDate: Date;
  /** Array of forecast periods (1 or 2 periods) */
  periods: YearlyPeriod[];
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
 * Analyzes the one-year period starting from queryDate:
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
 * @param birthDate - User's birth date (not currently used, reserved for future)
 * @param queryDate - Start date of the forecast period
 * @param palaces - ZiWei palace array (12 palaces)
 * @param fourPillars - User's four pillars
 * @param currentDayun - Optional current Dayun (大運) GanZhi for interaction analysis
 * @returns YearlyForecast object with period breakdown
 *
 * @example
 * // Query starting 2025-12-06, Lichun 2026 is Feb 3
 * calculateYearlyForecast(
 *   new Date('1990-01-01'),
 *   new Date('2025-12-06'),
 *   palaces,
 *   fourPillars,
 *   { stem: '甲', branch: '寅' }
 * );
 * // Returns: 2 periods
 * // Period 1: 2025-12-06 to 2026-02-03 (乙巳 year)
 * // Period 2: 2026-02-03 to 2026-12-06 (丙午 year)
 *
 * @example
 * // Query starting 2026-03-01, no Lichun until 2027-02-03
 * calculateYearlyForecast(
 *   new Date('1990-01-01'),
 *   new Date('2026-03-01'),
 *   palaces,
 *   fourPillars
 * );
 * // Returns: 1 period
 * // Period 1: 2026-03-01 to 2027-03-01 (丙午 year)
 */
export function calculateYearlyForecast(
  // eslint-disable-next-line no-unused-vars
  birthDate: Date,
  queryDate: Date,
  palaces: Palace[],
  fourPillars: FourPillars,
  currentDayun?: GanZhi
): YearlyForecast {
  // Calculate end date: queryDate + 365 days
  const endDate = new Date(queryDate);
  endDate.setDate(endDate.getDate() + 365);

  // Get all Lichun dates within the period
  const lichunDates = getLichunDatesBetween(queryDate, endDate);

  const periods: YearlyPeriod[] = [];

  if (lichunDates.length === 0) {
    // No Lichun: single period covering entire year
    const annualPillar = getAnnualPillar(queryDate);
    const annualLifePalacePosition = locateAnnualLifePalace(annualPillar.branch, palaces);
    const durationDays = calculateDuration(queryDate, endDate);

    // Calculate Tai Sui analysis
    const taiSuiAnalysis = analyzeTaiSui(annualPillar, fourPillars);

    // Calculate interactions
    const stemCombinations = detectStemCombinations(annualPillar.stem, fourPillars);
    const branchClashes = detectBranchClashes(annualPillar.branch, fourPillars);
    const harmoniousCombinations = detectHarmoniousCombinations(
      annualPillar.branch,
      fourPillars,
      currentDayun?.branch
    );

    periods.push({
      startDate: queryDate,
      endDate: endDate,
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
    const currentYearPillar = getAnnualPillar(queryDate);
    const currentYearPalacePosition = locateAnnualLifePalace(currentYearPillar.branch, palaces);
    const currentYearDuration = calculateDuration(queryDate, lichunDate);

    // Calculate Tai Sui analysis for current year
    const currentTaiSuiAnalysis = analyzeTaiSui(currentYearPillar, fourPillars);

    // Calculate interactions for current year
    const currentStemCombinations = detectStemCombinations(currentYearPillar.stem, fourPillars);
    const currentBranchClashes = detectBranchClashes(currentYearPillar.branch, fourPillars);
    const currentHarmoniousCombinations = detectHarmoniousCombinations(
      currentYearPillar.branch,
      fourPillars,
      currentDayun?.branch
    );

    // Period 2: lichunDate → endDate (next year)
    const nextYearPillar = getAnnualPillar(lichunDate);
    const nextYearPalacePosition = locateAnnualLifePalace(nextYearPillar.branch, palaces);
    const nextYearDuration = calculateDuration(lichunDate, endDate);

    // Calculate Tai Sui analysis for next year
    const nextTaiSuiAnalysis = analyzeTaiSui(nextYearPillar, fourPillars);

    // Calculate interactions for next year
    const nextStemCombinations = detectStemCombinations(nextYearPillar.stem, fourPillars);
    const nextBranchClashes = detectBranchClashes(nextYearPillar.branch, fourPillars);
    const nextHarmoniousCombinations = detectHarmoniousCombinations(
      nextYearPillar.branch,
      fourPillars,
      currentDayun?.branch
    );

    // Calculate total duration for weight normalization
    const totalDuration = currentYearDuration + nextYearDuration;

    periods.push({
      startDate: queryDate,
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
      endDate: endDate,
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
    queryDate,
    endDate,
    periods
  };
}
