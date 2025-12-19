/**
 * Daily Question Limit Service
 * Enforces the "one question per day" rule for each chart
 */

import { eq, and, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { analysisRecords } from '../db/schema';
import type { Env } from '../index';

export class DailyQuestionLimitService {
  private db: ReturnType<typeof drizzle>;

  constructor(env: Env) {
    this.db = drizzle(env.DB);
  }

  /**
   * Get current date in Taiwan timezone (UTC+8)
   * @returns Date string in YYYY-MM-DD format
   */
  private getTaiwanDate(): string {
    const now = new Date();
    // Convert to Taiwan timezone (UTC+8)
    const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    return taiwanTime.toISOString().split('T')[0];
  }

  /**
   * Check if a chart has already asked a question today
   * @param chartId - Chart ID to check
   * @returns true if limit exceeded, false if can ask
   */
  async checkDailyLimit(chartId: string): Promise<boolean> {
    try {
      const today = this.getTaiwanDate();
      
      const existingQuestions = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(analysisRecords)
        .where(
          and(
            eq(analysisRecords.chartId, chartId),
            eq(analysisRecords.analysisType, 'daily-question'),
            sql`DATE(${analysisRecords.createdAt}, '+8 hours') = ${today}`
          )
        );

      const count = existingQuestions[0]?.count || 0;
      return count > 0; // true if already asked today
    } catch (error) {
      console.error('[DailyQuestionLimit] Error checking limit:', error);
      return false; // Allow on error to avoid blocking users
    }
  }

  /**
   * Record a daily question for a chart
   * @param chartId - Chart ID
   * @param question - User's question
   * @param result - AI response result
   */
  async recordDailyQuestion(chartId: string, question: string, result: any): Promise<void> {
    try {
      await this.db.insert(analysisRecords).values({
        id: crypto.randomUUID(),
        userId: null, // Anonymous users
        chartId,
        analysisType: 'daily-question',
        result: {
          question,
          answer: result,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[DailyQuestionLimit] Error recording question:', error);
      // Don't throw - recording failure shouldn't block the response
    }
  }

  /**
   * Get remaining time until next question (for error messages)
   * @returns Hours until midnight Taiwan time
   */
  getTimeUntilNextQuestion(): number {
    const now = new Date();
    // Convert to Taiwan timezone (UTC+8)
    const taiwanNow = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    
    // Get tomorrow midnight in Taiwan time
    const taiwanTomorrow = new Date(taiwanNow);
    taiwanTomorrow.setUTCDate(taiwanTomorrow.getUTCDate() + 1);
    taiwanTomorrow.setUTCHours(0, 0, 0, 0);
    
    // Calculate hours difference
    return Math.ceil((taiwanTomorrow.getTime() - taiwanNow.getTime()) / (1000 * 60 * 60));
  }
}
