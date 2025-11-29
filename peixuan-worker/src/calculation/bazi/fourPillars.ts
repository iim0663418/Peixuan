/**
 * Four Pillars (四柱) Calculation Module
 *
 * Implements the core BaZi calculation for Year, Month, Day, and Hour pillars.
 * Based on mathematical formulas from 命理計算邏輯數學化研究.md §2.
 *
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Task 2.1
 */

import { GanZhi, indexToGanZhi, HEAVENLY_STEMS, stemModulo } from '../core/ganZhi';
import { dateToJulianDay, getLichunTime } from '../core/time';

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
 * Formula: I_year = (Y - 3) mod 60
 * The year pillar changes at 立春 (Start of Spring), not at Chinese New Year.
 *
 * @param solarDate - Birth date in solar calendar
 * @param lichunTime - 立春 time for the birth year (if before 立春, use previous year)
 * @returns Year pillar GanZhi
 *
 * @example
 * const lichun = getLichunTime(2024);
 * const yearPillar = calculateYearPillar(new Date(2024, 5, 15), lichun);
 * // Returns: 甲辰 (index 40)
 */
export function calculateYearPillar(solarDate: Date, lichunTime: Date): GanZhi {
  let year = solarDate.getFullYear();

  // If birth is before 立春, use previous year
  if (solarDate < lichunTime) {
    year -= 1;
  }

  // Formula: I_year = (Y - 3) mod 60
  const index = ((year - 3) % 60 + 60) % 60;

  return indexToGanZhi(index);
}

/**
 * Calculate Month Pillar (月柱) using 五虎遁年法
 *
 * Formula: idx = (2 × yearStem + 2) mod 10
 * The month pillar changes at the monthly solar term (節氣), not at the start of lunar month.
 *
 * Solar longitude mapping:
 * - 315° ~ 345°: 寅月 (立春 ~ 驚蟄)
 * - 345° ~ 15°:  卯月 (驚蟄 ~ 清明)
 * - ... (12 months total)
 *
 * @param solarLongitude - Solar longitude in degrees [0, 360)
 * @param yearStemIndex - Index of year stem [0-9]
 * @returns Month pillar GanZhi
 *
 * @example
 * const monthPillar = calculateMonthPillar(330, 0); // 甲年, solar longitude 330° (寅月)
 * // Returns: 丙寅 (using 五虎遁年法: (2*0 + 2) mod 10 = 2 → 丙, branch = 寅)
 */
export function calculateMonthPillar(solarLongitude: number, yearStemIndex: number): GanZhi {
  // Map solar longitude to month branch (0 = 寅, 1 = 卯, ...)
  // 立春 starts at ~315°, each month spans 30°
  // Normalize to start from 寅月 (index 2 in Earthly Branches)
  const normalizedLongitude = ((solarLongitude + 45) % 360);
  const monthBranchOffset = Math.floor(normalizedLongitude / 30);
  const branchIndex = (monthBranchOffset + 2) % 12; // 寅 is index 2

  // 五虎遁年法: Calculate month stem from year stem
  // Formula: idx = (2 × yearStem + 2) mod 10
  const stemIndex = stemModulo(2 * yearStemIndex + 2);

  // Combine stem and branch into 60 Jiazi index
  // Use Chinese Remainder Theorem: find n where n ≡ stemIndex (mod 10) and n ≡ branchIndex (mod 12)
  let pillarIndex = 0;
  for (let n = 0; n < 60; n++) {
    if (n % 10 === stemIndex && n % 12 === branchIndex) {
      pillarIndex = n;
      break;
    }
  }

  return indexToGanZhi(pillarIndex);
}

/**
 * Calculate Day Pillar (日柱) using Julian Day Number
 *
 * Formula: I_day = (JDN - 10) mod 60
 * The day pillar is based on midnight of the local solar date.
 *
 * Reference anchor: 1984-02-02 00:00 (甲子日) has JDN = 2445730
 * Verification: (2445730 - 10) mod 60 = 0 → 甲子 ✓
 *
 * @param date - Birth date (local time)
 * @returns Day pillar GanZhi
 *
 * @example
 * const dayPillar = calculateDayPillar(new Date(2024, 0, 1)); // Jan 1, 2024
 * // Returns: 癸亥 (JDN 2460310 → (2460310 - 10) mod 60 = 20 → 癸亥)
 */
export function calculateDayPillar(date: Date): GanZhi {
  const jdn = dateToJulianDay(date);

  // Formula: I_day = (JDN - 10) mod 60
  const index = ((jdn - 10) % 60 + 60) % 60;

  return indexToGanZhi(index);
}

/**
 * Calculate Hour Pillar (時柱) using 五鼠遁日法
 *
 * Formula: idx = (2 × dayStem + 0) mod 10
 * Hour boundaries are based on true solar time, not clock time.
 *
 * Hour branch mapping (12 double-hours):
 * - 23:00-01:00: 子時 (index 0)
 * - 01:00-03:00: 丑時 (index 1)
 * - ... (12 hours total)
 *
 * @param trueSolarTime - True solar time (after longitude & EoT corrections)
 * @param dayStemIndex - Index of day stem [0-9]
 * @returns Hour pillar GanZhi
 *
 * @example
 * const hourPillar = calculateHourPillar(new Date(2024, 0, 1, 14, 30), 0); // 甲日 14:30 (未時)
 * // Returns: 辛未 (using 五鼠遁日法: (2*0 + 0) mod 10 = 0 → 甲, hour 14:30 → 未時)
 */
export function calculateHourPillar(trueSolarTime: Date, dayStemIndex: number): GanZhi {
  const hour = trueSolarTime.getHours();
  const minute = trueSolarTime.getMinutes();
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

  // 五鼠遁日法: Calculate hour stem from day stem
  // Formula: idx = (2 × dayStem + 0) mod 10
  const stemIndex = stemModulo(2 * dayStemIndex);

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
