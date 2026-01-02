/**
 * Daily Reminder Controller
 *
 * Handles daily reminder requests by:
 * 1. Querying chart data from D1 database
 * 2. Calculating daily stem-branch
 * 3. Detecting interactions
 * 4. Generating template-based reminder
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { chartRecords } from '../db/schema';
import {
  calculateDailyStemBranch,
  detectDailyInteractions,
  generateDailyReminder,
  type DailyReminder
} from '../services/dailyReminderService';

/**
 * Daily Reminder Controller
 */
export class DailyReminderController {
  /**
   * Get daily reminder for a specific chart and date
   *
   * @param db - D1 database instance
   * @param chartId - Chart UUID
   * @param date - Date for the reminder (ISO 8601 string or Date object)
   * @param locale - Locale for the reminder (default: 'zh-TW', supports: 'zh-TW', 'en')
   * @returns Daily reminder with text and tags
   * @throws Error if chart not found or invalid data
   *
   * @example
   * const controller = new DailyReminderController();
   * const reminder = await controller.getDailyReminder(
   *   env.DB,
   *   'abc-123',
   *   '2025-12-06T00:00:00.000Z',
   *   'zh-TW'
   * );
   * // Returns: { text: '...', tags: [...] }
   */
  async getDailyReminder(
    db: D1Database,
    chartId: string,
    date: string | Date,
    locale = 'zh-TW'
  ): Promise<DailyReminder> {
    try {
      // Step 1: Query chart data from D1
      const orm = drizzle(db);
      const [chartRecord] = await orm
        .select()
        .from(chartRecords)
        .where(eq(chartRecords.id, chartId))
        .limit(1);

      if (!chartRecord) {
        console.error(`[getDailyReminder] Chart not found: ${chartId}`);
        throw new Error('Chart not found');
      }

      // Step 2: Parse chart data
      let chartData: any;
      try {
        chartData = typeof chartRecord.chartData === 'string'
          ? JSON.parse(chartRecord.chartData)
          : chartRecord.chartData;
      } catch (parseError) {
        console.error('[getDailyReminder] Failed to parse chart data:', parseError);
        throw new Error('Invalid chart data format');
      }

      // Step 3: Convert date to Date object
      const targetDate = typeof date === 'string' ? new Date(date) : date;

      if (isNaN(targetDate.getTime())) {
        console.error('[getDailyReminder] Invalid date:', date);
        throw new Error('Invalid date format');
      }

      // Step 4: Calculate daily stem-branch
      const dailyStemBranch = calculateDailyStemBranch(targetDate);

      // Step 5: Detect daily interactions
      const interactions = detectDailyInteractions(chartData, dailyStemBranch);

      // Step 6: Generate reminder
      const reminder = generateDailyReminder(interactions, targetDate, locale);

      console.log(`[getDailyReminder] Success - chartId: ${chartId}, date: ${targetDate.toISOString()}, overall: ${interactions.overall}, locale: ${locale}`);

      return reminder;
    } catch (error) {
      // Fallback: Return generic reminder on error
      if (error instanceof Error) {
        if (error.message === 'Chart not found' || error.message === 'Invalid date format') {
          throw error; // Re-throw known errors
        }
        console.error('[getDailyReminder] Error:', error.message);
      }

      // For other errors, return fallback reminder
      console.warn('[getDailyReminder] Returning fallback reminder due to error');
      return {
        text: locale === 'en'
          ? 'Today is peaceful and smooth, keep a calm mind ✨'
          : '今日平安順遂,保持平常心 ✨',
        tags: [
          { label: locale === 'en' ? 'Peaceful' : '平安', type: 'info' }
        ]
      };
    }
  }
}
