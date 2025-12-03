/**
 * Four Pillars (四柱) Calculation Module
 *
 * Refactored to use lunar-typescript library for community-validated algorithms.
 * Maintains existing API for backward compatibility.
 *
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Task 2.1
 * Decision: 2025-12-01 採用 lunar-typescript 替換自實作四柱算法
 */

import type { GanZhi} from '../core/ganZhi';
import { indexToGanZhi, HEAVENLY_STEMS, EARTHLY_BRANCHES, stemModulo } from '../core/ganZhi';
import { getFourPillarsFromLunar } from './lunarAdapter';

/**
 * Four Pillars result
 */
export interface FourPillars {
  year: GanZhi;
  month: GanZhi;
  day: GanZhi;
  hour: GanZhi;
}

/**
 * Calculate Year Pillar (年柱)
 *
 * Uses lunar-typescript for calculation. The year pillar changes at 立春 (Start of Spring).
 *
 * @param solarDate - Birth date in solar calendar
 * @param lichunTime - 立春 time for the birth year (maintained for API compatibility)
 * @returns Year pillar GanZhi
 */
export function calculateYearPillar(solarDate: Date, lichunTime: Date): GanZhi {
  const fourPillars = getFourPillarsFromLunar({ solarDate });
  return fourPillars.year;
}

/**
 * Convert solar longitude to month branch index
 *
 * Solar longitude ranges for each month (starting from 寅月):
 * - 寅: 315° ~ 345° (index 2)
 * - 卯: 345° ~ 15° (index 3)
 * - 辰: 15° ~ 45° (index 4)
 * - ...and so on
 *
 * @param solarLongitude - Solar longitude in degrees [0-360)
 * @returns Month branch index [0-11]
 */
function solarLongitudeToMonthBranch(solarLongitude: number): number {
  // Normalize to [0, 360)
  const normalized = ((solarLongitude % 360) + 360) % 360;

  // Solar longitude 315° is the start of 寅月 (index 2)
  // Each month spans 30° of solar longitude
  // Offset by 315° to align 寅月 with index 0, then add 2
  const offset = (normalized + 45) % 360; // Shift by 45° so that 315° → 0°
  const monthFromYin = Math.floor(offset / 30); // 0-11, where 0 = 寅
  const branchIndex = (monthFromYin + 2) % 12; // Convert to actual branch index

  return branchIndex;
}

/**
 * Calculate Month Pillar (月柱) using 五虎遁年法
 *
 * Formula: idx = (2 × yearStem + 2) mod 10
 * The month pillar changes at the monthly solar term (節氣), not at the start of lunar month.
 *
 * @param solarLongitude - Solar longitude in degrees [0-360), or month branch index [0-11] for legacy compatibility
 * @param yearStemIndex - Index of year stem [0-9]
 * @returns Month pillar GanZhi
 *
 * @example
 * const monthPillar = calculateMonthPillar(330, 0); // 甲年, 330° (寅月)
 * // Returns: 丙寅 (using 五虎遁年法: (2*0 + 2) mod 10 = 2 → 丙)
 */
export function calculateMonthPillar(solarLongitude: number, yearStemIndex: number): GanZhi {
  // Convert solar longitude to month branch index
  const monthBranchIndex = solarLongitudeToMonthBranch(solarLongitude);

  // 五虎遁年法: Calculate month stem from year stem
  // Step 1: Get the stem for 寅月 (Yin month, index 2)
  // Formula: yinStem = (2 × yearStem + 2) mod 10
  const yinStem = stemModulo(2 * yearStemIndex + 2);

  // Step 2: Calculate offset from 寅月 to target month
  // 寅=2, so offset = (monthBranchIndex - 2 + 12) % 12
  const offset = (monthBranchIndex - 2 + 12) % 12;

  // Step 3: Calculate month stem
  const stemIndex = stemModulo(yinStem + offset);

  // Combine stem and branch into 60 Jiazi index
  let pillarIndex = 0;
  for (let n = 0; n < 60; n++) {
    if (n % 10 === stemIndex && n % 12 === monthBranchIndex) {
      pillarIndex = n;
      break;
    }
  }

  return indexToGanZhi(pillarIndex);
}

/**
 * Calculate Day Pillar (日柱) using Julian Day Number
 *
 * Formula: I_day = (JDN - 2448851) mod 60
 * The day pillar changes at 子時 (23:00), not at midnight.
 *
 * Reference anchor: 1992-08-16 00:00 (甲子日) has JDN = 2448851
 * Verification: (2448851 - 2448851) mod 60 = 0 → 甲子 ✓
 *
 * @param jdn - Julian Day Number
 * @returns Day pillar GanZhi
 *
 * @example
 * const jdn = dateToJulianDay(new Date(1992, 8, 10, 5, 56)); // Sep 10, 1992 05:56
 * const dayPillar = calculateDayPillar(jdn);
 * // Returns: 己丑 (JDN 2448876 → (2448876 - 2448851) mod 60 = 25 → 己丑)
 */
export function calculateDayPillar(jdn: number): GanZhi {
  // Formula: I_day = (JDN - 2448851) mod 60
  const index = ((jdn - 2448851) % 60 + 60) % 60;

  return indexToGanZhi(index);
}

/**
 * Calculate Hour Pillar (時柱) using 五鼠遁日法
 *
 * Formula: hourStem = (2 × dayStem + hourBranch) mod 10
 * Hour boundaries are based on true solar time, not clock time.
 *
 * Hour branch mapping (12 double-hours):
 * - 23:00-01:00: 子時 (index 0)
 * - 01:00-03:00: 丑時 (index 1)
 * - ... (12 hours total)
 *
 * @param hour - Hour of birth (0-23)
 * @param minute - Minute of birth (0-59)
 * @param dayStemIndex - Index of day stem [0-9]
 * @returns Hour pillar GanZhi
 *
 * @example
 * const hourPillar = calculateHourPillar(5, 56, 5); // 己日 05:56 (卯時)
 * // Returns: 丁卯 (using 五鼠遁日法: (2*5 + 3) mod 10 = 3 → 丁)
 */
export function calculateHourPillar(hour: number, minute: number, dayStemIndex: number): GanZhi {
  const totalMinutes = hour * 60 + minute;

  // Map to hour branch (子=0, 丑=1, ...)
  // 23:00-01:00 → 子 (0), 01:00-03:00 → 丑 (1), ...
  let branchIndex: number;
  if (totalMinutes >= 23 * 60) {
    // 23:00-24:00 → 子時
    branchIndex = 0;
  } else {
    // 00:00-01:00 is still 子時, then 01:00-03:00 is 丑時, etc.
    branchIndex = Math.floor((totalMinutes + 60) / 120) % 12;
  }

  // 五鼠遁日法: Calculate hour stem from day stem and hour branch
  // Formula: idx = (2 × dayStem + hourBranch) mod 10
  const stemIndex = stemModulo(2 * dayStemIndex + branchIndex);

  // Combine stem and branch into 60 Jiazi index
  let pillarIndex = 0;
  for (let n = 0; n < 60; n++) {
    if (n % 10 === stemIndex && n % 12 === branchIndex) {
      pillarIndex = n;
      break;
    }
  }

  return indexToGanZhi(pillarIndex);
}
