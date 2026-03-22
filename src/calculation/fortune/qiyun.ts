/**
 * QiYun (起運) Calculation Module
 *
 * Implements fortune cycle starting date calculation based on:
 * - Gender and year stem polarity (陰陽順逆)
 * - Distance to nearest Jie (節) solar term
 * - 3-day-to-1-year metabolic conversion formula
 *
 * Reference: doc/八字命理後端模組研究.md §3.2
 */

import { getSolarTermTime, SOLAR_TERMS } from '../core/time/solarTerms';

/**
 * Heavenly Stems categorized by polarity
 */
const YANG_STEMS = ['甲', '丙', '戊', '庚', '壬'] as const;
const YIN_STEMS = ['乙', '丁', '己', '辛', '癸'] as const;

/**
 * Jie (節) solar terms only - used for fortune cycle calculation
 * These are odd-indexed terms: 立春(0), 驚蟄(2), 清明(4), etc.
 */
const JIE_TERMS = SOLAR_TERMS.filter((_, index) => index % 2 === 0);

export type FortuneDirection = 'forward' | 'backward';
export type Gender = 'male' | 'female';

/**
 * Determine fortune direction based on year stem polarity and gender
 *
 * Logic table (§3.2.1):
 * - 男陽順 (Male + Yang Stem): forward
 * - 男陰逆 (Male + Yin Stem): backward
 * - 女陽逆 (Female + Yang Stem): backward
 * - 女陰順 (Female + Yin Stem): forward
 *
 * @param yearStem - Year pillar heavenly stem (天干)
 * @param gender - 'male' or 'female'
 * @returns 'forward' or 'backward'
 *
 * @example
 * determineFortuneDirection('甲', 'male') // 'forward' (陽男順行)
 * determineFortuneDirection('乙', 'female') // 'forward' (陰女順行)
 */
export function determineFortuneDirection(
  yearStem: string,
  gender: Gender
): FortuneDirection {
  const isYangStem = YANG_STEMS.includes(yearStem as any);

  // XOR logic: (male AND yang) OR (female AND yin) => forward
  if ((gender === 'male' && isYangStem) || (gender === 'female' && !isYangStem)) {
    return 'forward';
  }

  return 'backward';
}

/**
 * Find the nearest Jie (節) solar term based on direction
 *
 * @param birthDate - Birth date (true solar time)
 * @param direction - 'forward' (next Jie) or 'backward' (previous Jie)
 * @returns Date object of the target Jie solar term
 */
function findNearestJie(birthDate: Date, direction: FortuneDirection): Date {
  const birthYear = birthDate.getFullYear();

  // Get all Jie terms for current and adjacent years
  const years = direction === 'forward'
    ? [birthYear, birthYear + 1]
    : [birthYear - 1, birthYear];

  const allJieDates: Date[] = [];

  for (const year of years) {
    for (const jieTerm of JIE_TERMS) {
      try {
        const jieDate = getSolarTermTime(year, jieTerm);
        allJieDates.push(jieDate);
      } catch {
        // Ignore errors for edge cases
        continue;
      }
    }
  }

  // Sort chronologically
  allJieDates.sort((a, b) => a.getTime() - b.getTime());

  // Find the appropriate Jie
  if (direction === 'forward') {
    // Find first Jie after birth
    const nextJie = allJieDates.find(jie => jie > birthDate);
    if (!nextJie) {
      throw new Error('Cannot find next Jie solar term');
    }
    return nextJie;
  } 
    // Find last Jie before birth
    const prevJie = allJieDates.reverse().find(jie => jie < birthDate);
    if (!prevJie) {
      throw new Error('Cannot find previous Jie solar term');
    }
    return prevJie;
  
}

/**
 * Convert time difference to metabolic days representation
 *
 * Helper function for display purposes.
 * Formula: 3 metabolic days = 1 year (120 real days each)
 *
 * @param diffMinutes - Time difference in minutes
 * @returns Object with years, months, days breakdown
 *
 * @example
 * convertMetabolicDays(4320) // 3 days = { years: 1, months: 0, days: 0 }
 */
export function convertMetabolicDays(diffMinutes: number): {
  years: number;
  months: number;
  days: number;
} {
  const metabolicDays = diffMinutes / 1440; // 1440 minutes per day
  const totalRealDays = metabolicDays * 120; // Each metabolic day = 120 real days

  const years = Math.floor(totalRealDays / 365);
  const remainingDays = totalRealDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = Math.floor(remainingDays % 30);

  return { years, months, days };
}

/**
 * Calculate QiYun (起運) date - when fortune cycles begin
 *
 * Formula (§3.2.2):
 * 1. Find target Jie based on direction
 * 2. Calculate time difference in minutes
 * 3. Metabolic_Days = Diff_Minutes / 1440
 * 4. Total_Real_Days = Metabolic_Days × 120
 * 5. QiYun_Date = Birth_Date + Total_Real_Days
 *
 * @param birthDate - Birth date in true solar time
 * @param yearStem - Year pillar heavenly stem
 * @param gender - 'male' or 'female'
 * @param trueSolarTime - Birth time already corrected to true solar time
 * @returns Date when fortune cycles begin
 *
 * @example
 * const qiyunDate = calculateQiYunDate(
 *   new Date('1990-03-15T10:30:00'),
 *   '庚',
 *   'male',
 *   new Date('1990-03-15T10:30:00')
 * );
 */
export function calculateQiYunDate(
  birthDate: Date,
  yearStem: string,
  gender: Gender,
  trueSolarTime: Date
): Date {
  // Step 1: Determine direction
  const direction = determineFortuneDirection(yearStem, gender);

  // Step 2: Find nearest Jie
  const targetJie = findNearestJie(trueSolarTime, direction);

  // Step 3: Calculate time difference in minutes
  const diffMilliseconds = Math.abs(targetJie.getTime() - trueSolarTime.getTime());
  const diffMinutes = diffMilliseconds / (1000 * 60);

  // Step 4: Apply metabolic conversion formula
  const metabolicDays = diffMinutes / 1440; // 1 day = 1440 minutes
  const totalRealDays = metabolicDays * 120; // 1 metabolic day = 120 real days

  // Step 5: Calculate QiYun date
  const qiyunDate = new Date(birthDate);
  qiyunDate.setDate(qiyunDate.getDate() + totalRealDays);

  return qiyunDate;
}
