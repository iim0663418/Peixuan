/**
 * Solar Terms (節氣) Module
 *
 * Integrates lunar-typescript library to retrieve precise solar term times.
 * Solar terms are critical for determining year and month pillars in BaZi.
 *
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Task 1.1, §3
 */

import { Solar } from 'lunar-typescript';

/**
 * Solar term names in Chinese
 */
export const SOLAR_TERMS = [
  '立春', '雨水', '驚蟄', '春分', '清明', '穀雨',
  '立夏', '小滿', '芒種', '夏至', '小暑', '大暑',
  '立秋', '處暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
] as const;

export type SolarTermName = typeof SOLAR_TERMS[number];

/**
 * Get the time of a specific solar term for a given year
 *
 * Uses lunar-typescript's Solar.fromYmdHms() and getJieQiTable() to
 * retrieve exact solar term times based on astronomical calculations.
 *
 * @param year - The year to query
 * @param term - Solar term name (e.g., '立春', '春分')
 * @returns Date object representing the solar term time
 * @throws Error if the solar term name is invalid
 *
 * @example
 * const lichun = getSolarTermTime(2024, '立春');
 * // Returns: Date for 立春 in 2024 (around Feb 4, 2024)
 */
export function getSolarTermTime(year: number, term: SolarTermName): Date {
  if (!SOLAR_TERMS.includes(term)) {
    throw new Error(`Invalid solar term: ${term}`);
  }

  // Create a Solar object for January 1st of the given year
  const solar = Solar.fromYmdHms(year, 1, 1, 0, 0, 0);
  
  // Get lunar calendar and then the solar term table
  const lunar = solar.getLunar();
  const jieQiTable = lunar.getJieQiTable();

  // Retrieve the solar term Solar object
  const termSolar = jieQiTable[term];

  if (!termSolar) {
    throw new Error(`Solar term ${term} not found for year ${year}`);
  }

  // Convert Solar object to Date
  return new Date(
    termSolar.getYear(),
    termSolar.getMonth() - 1, // Month is 1-based in Solar
    termSolar.getDay(),
    termSolar.getHour(),
    termSolar.getMinute(),
    termSolar.getSecond()
  );
}

/**
 * Get all solar terms for a given year
 *
 * @param year - The year to query
 * @returns Map of solar term names to their Date objects
 *
 * @example
 * const terms = getAllSolarTerms(2024);
 * const lichun = terms.get('立春');
 */
export function getAllSolarTerms(year: number): Map<SolarTermName, Date> {
  const solar = Solar.fromYmdHms(year, 1, 1, 0, 0, 0);
  const lunar = solar.getLunar();
  const jieQiTable = lunar.getJieQiTable();

  const result = new Map<SolarTermName, Date>();

  for (const term of SOLAR_TERMS) {
    const termSolar = jieQiTable[term];
    if (termSolar) {
      // Convert Solar object to Date
      const termDate = new Date(
        termSolar.getYear(),
        termSolar.getMonth() - 1,
        termSolar.getDay(),
        termSolar.getHour(),
        termSolar.getMinute(),
        termSolar.getSecond()
      );
      result.set(term, termDate);
    }
  }

  return result;
}

/**
 * Get the 立春 (Start of Spring) time for year pillar calculation
 *
 * Convenience function for the most commonly used solar term in BaZi.
 * Year pillar changes at 立春, not at Chinese New Year.
 *
 * @param year - The year to query
 * @returns Date object for 立春 time
 *
 * @example
 * const lichun = getLichunTime(2024);
 * // Used to determine if a birth date falls before or after year boundary
 */
export function getLichunTime(year: number): Date {
  return getSolarTermTime(year, '立春');
}
