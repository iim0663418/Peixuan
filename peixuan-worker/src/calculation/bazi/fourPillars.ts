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

  // Formula: I_year = (Y - 4) mod 60
  // Reference: 1984 = 甲子 (index 0), so (1984 - 4) mod 60 = 0
  const index = ((year - 4) % 60 + 60) % 60;

  return indexToGanZhi(index);
}

/**
 * Calculate Month Pillar (月柱) using 五虎遁年法
 *
 * Formula: idx = (2 × yearStem + 2) mod 10
 * The month pillar changes at the monthly solar term (節氣), not at the start of lunar month.
 *
 * @param monthBranchIndex - Month branch index (0-11, where 0=子, 1=丑, 2=寅, ...)
 * @param yearStemIndex - Index of year stem [0-9]
 * @returns Month pillar GanZhi
 *
 * @example
 * const monthPillar = calculateMonthPillar(2, 0); // 甲年寅月
 * // Returns: 丙寅 (using 五虎遁年法: (2*0 + 2) mod 10 = 2 → 丙)
 */
export function calculateMonthPillar(monthBranchIndex: number, yearStemIndex: number): GanZhi {
  // 五虎遁年法: Calculate month stem from year stem
  // Formula: idx = (2 × yearStem + 2) mod 10
  const stemIndex = stemModulo(2 * yearStemIndex + 2);

  // Combine stem and branch into 60 Jiazi index
  // Use Chinese Remainder Theorem: find n where n ≡ stemIndex (mod 10) and n ≡ branchIndex (mod 12)
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
 * @param date - Birth date and time (local time)
 * @returns Day pillar GanZhi
 *
 * @example
 * const dayPillar = calculateDayPillar(new Date(1992, 8, 10, 5, 56)); // Sep 10, 1992 05:56
 * // Returns: 己丑 (JDN 2448876 → (2448876 - 2448851) mod 60 = 25 → 己丑)
 */
export function calculateDayPillar(date: Date): GanZhi {
  // Adjust for 子時 boundary: if time >= 23:00, count as next day
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  
  if (date.getHours() >= 23) {
    day += 1;
    // Handle month/year overflow
    const tempDate = new Date(year, month, day);
    year = tempDate.getFullYear();
    month = tempDate.getMonth();
    day = tempDate.getDate();
  }
  
  // Calculate JDN for the date (using year, month, day directly)
  let jdnYear = year;
  let jdnMonth = month + 1; // Convert to 1-based
  
  if (jdnMonth <= 2) {
    jdnYear -= 1;
    jdnMonth += 12;
  }
  
  const a = Math.floor(jdnYear / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (jdnYear + 4716)) +
             Math.floor(30.6001 * (jdnMonth + 1)) +
             day + b - 1524.5;
  // JDN is defined from noon, so add 0.5 to get the date's JDN
  const jdn = Math.floor(jd + 0.5);

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
 * @param trueSolarTime - True solar time (after longitude & EoT corrections)
 * @param dayStemIndex - Index of day stem [0-9]
 * @returns Hour pillar GanZhi
 *
 * @example
 * const hourPillar = calculateHourPillar(new Date(1992, 8, 10, 5, 56), 5); // 己日 05:56 (卯時)
 * // Returns: 丁卯 (using 五鼠遁日法: (2*5 + 3) mod 10 = 3 → 丁)
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
