/**
 * Lichun Date Range Calculator
 *
 * Retrieves all Lichun (立春) dates within a specified date range.
 * Used for annual fortune analysis to determine year boundaries.
 *
 * Reference: Phase 1 - Backend Core Implementation, Task 1.1
 */

import { getLichunTime } from '../../calculation/core/time/solarTerms';

/**
 * Get all Lichun dates between startDate and endDate (inclusive)
 *
 * Iterates through years from startYear to endYear+1 to capture all Lichun
 * dates that may fall within the range (including edge cases where Lichun
 * of next year falls before endDate).
 *
 * @param startDate - Start of the date range
 * @param endDate - End of the date range
 * @returns Array of Lichun dates within the range, sorted chronologically
 *
 * @example
 * // Query date: 2025-12-06, end date: 2026-12-06
 * const lichuns = getLichunDatesBetween(
 *   new Date('2025-12-06'),
 *   new Date('2026-12-06')
 * );
 * // Returns: [Date(2026-02-03...)]
 *
 * @example
 * // Query spanning two Lichuns
 * const lichuns = getLichunDatesBetween(
 *   new Date('2025-01-15'),
 *   new Date('2026-01-15')
 * );
 * // Returns: [Date(2025-02-03...), Date(2026-02-03...)]
 */
export function getLichunDatesBetween(startDate: Date, endDate: Date): Date[] {
  // Validate input
  if (!startDate || !endDate) {
    return [];
  }

  if (startDate > endDate) {
    return [];
  }

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const lichunDates: Date[] = [];

  // Iterate through years from startYear to endYear + 1
  // We check endYear + 1 to capture Lichun of next year that may fall within range
  for (let year = startYear; year <= endYear + 1; year++) {
    const lichunTime = getLichunTime(year);

    // Filter dates within range (inclusive)
    if (lichunTime >= startDate && lichunTime <= endDate) {
      lichunDates.push(lichunTime);
    }
  }

  // Return sorted array (should already be sorted, but ensure it)
  return lichunDates.sort((a, b) => a.getTime() - b.getTime());
}
