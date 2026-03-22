/**
 * Annual Pillar (年柱) Calculation with LiChun Boundary Module
 *
 * Implements annual stem/branch calculation considering the 立春 (Start of Spring) boundary.
 * In BaZi, the year changes at 立春, not at Chinese New Year or January 1st.
 *
 * Reference: doc/八字命理後端模組研究.md §4.1
 */

import { getLichunTime } from '../core/time/solarTerms';
import { indexToGanZhi, type GanZhi } from '../core/ganZhi/conversion';

/**
 * Get the annual pillar (year stem/branch) for a given date, considering LiChun boundary
 *
 * The year pillar changes at 立春 (Start of Spring), not at the calendar new year.
 * - If queryDate < LiChun of current year → use previous year's GanZhi
 * - If queryDate >= LiChun of current year → use current year's GanZhi
 *
 * Annual GanZhi calculation formula:
 * year_index = (year - 4) mod 60
 *
 * The base year 4 CE corresponds to index 0 (甲子) in the 60 Jiazi cycle.
 *
 * @param queryDate - The date to query for annual pillar
 * @returns GanZhi object with stem and branch
 *
 * @example
 * // Date before LiChun 2024 (Feb 4, 2024 ~16:27)
 * getAnnualPillar(new Date('2024-02-03T10:00:00'));
 * // Returns: { stem: '癸', branch: '卯' } (2023's pillar)
 *
 * @example
 * // Date after LiChun 2024
 * getAnnualPillar(new Date('2024-02-05T10:00:00'));
 * // Returns: { stem: '甲', branch: '辰' } (2024's pillar)
 */
export function getAnnualPillar(queryDate: Date): GanZhi {
  const year = queryDate.getFullYear();
  const lichunTime = getLichunTime(year);

  // Determine which year's GanZhi to use
  const effectiveYear = queryDate < lichunTime ? year - 1 : year;

  // Calculate year index in 60 Jiazi cycle
  // Formula: (year - 4) mod 60
  // Year 4 CE = 甲子 (index 0)
  const yearIndex = ((effectiveYear - 4) % 60 + 60) % 60;

  return indexToGanZhi(yearIndex);
}

/**
 * Check if a given date has passed the LiChun (Start of Spring) of its year
 *
 * @param queryDate - The date to check
 * @returns true if queryDate >= LiChun time of the year, false otherwise
 *
 * @example
 * hasPassedLiChun(new Date('2024-02-03T10:00:00')); // false (before LiChun)
 * hasPassedLiChun(new Date('2024-02-05T10:00:00')); // true (after LiChun)
 */
export function hasPassedLiChun(queryDate: Date): boolean {
  const year = queryDate.getFullYear();
  const lichunTime = getLichunTime(year);
  return queryDate >= lichunTime;
}
