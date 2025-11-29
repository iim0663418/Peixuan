/**
 * Julian Day Number (JDN) Conversion Module
 *
 * Provides bidirectional conversion between Gregorian calendar dates and Julian Day Numbers.
 * JDN is a continuous count of days since noon on January 1, 4713 BCE (Julian calendar).
 *
 * Used for day pillar calculation in BaZi: I_day = (JDN - 10) mod 60
 * Reference: 命理計算邏輯數學化研究.md §2.2.3
 */

/**
 * Convert a Date object to Julian Day Number
 *
 * Uses the standard astronomical algorithm for Gregorian calendar dates.
 * Valid for dates after October 15, 1582 (Gregorian calendar adoption).
 *
 * Algorithm from Meeus, "Astronomical Algorithms" (1998)
 *
 * @param date - The date to convert
 * @returns Julian Day Number (integer)
 *
 * @example
 * const jd = dateToJulianDay(new Date(2024, 0, 1)); // January 1, 2024
 * // Returns: 2460310
 */
export function dateToJulianDay(date: Date): number {
  let year = date.getFullYear();
  let month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();

  // Adjust for January and February being counted as months 13 and 14 of previous year
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd = Math.floor(365.25 * (year + 4716)) +
             Math.floor(30.6001 * (month + 1)) +
             day + b - 1524.5;

  return Math.floor(jd);
}

/**
 * Convert a Julian Day Number to a Date object
 *
 * Inverse operation of dateToJulianDay.
 * Returns the date at noon (12:00 UTC) for the given JDN.
 *
 * @param jd - Julian Day Number
 * @returns Date object representing the calendar date
 *
 * @example
 * const date = julianDayToDate(2460310);
 * // Returns: Date representing January 1, 2024
 */
export function julianDayToDate(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const f = (jd + 0.5) - z;

  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  return new Date(year, month - 1, Math.floor(day), 12, 0, 0, 0);
}
