import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { advancedAnalysisRecords, type AdvancedAnalysisRecord, type InsertAdvancedAnalysisRecord } from '../db/schema';

/**
 * AdvancedAnalysisCacheService
 *
 * Handles advanced analysis record operations with D1 database using Drizzle ORM.
 * Provides methods for retrieving and saving advanced analysis results with 24-hour expiry.
 */
export class AdvancedAnalysisCacheService {
  /**
   * Get an advanced analysis record by chart ID
   * @param chartId - The chart ID to query
   * @param env - Cloudflare Worker environment containing DB binding
   * @returns The advanced analysis record or null if not found or expired (>24 hours)
   */
  async getAnalysis(
    chartId: string,
    env: { DB: D1Database }
  ): Promise<AdvancedAnalysisRecord | null> {
    const db = drizzle(env.DB);

    const result = await db
      .select()
      .from(advancedAnalysisRecords)
      .where(eq(advancedAnalysisRecords.chartId, chartId))
      .orderBy(desc(advancedAnalysisRecords.createdAt))
      .limit(1);

    // Check if record exists and is not expired (24 hours)
    if (result[0]) {
      const createdAt = new Date(result[0].createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        return result[0];
      }
    }

    return null;
  }

  /**
   * Save a new advanced analysis record
   * @param chartId - The chart ID this analysis belongs to
   * @param result - The advanced analysis result data
   * @param env - Cloudflare Worker environment containing DB binding
   */
  async saveAnalysis(
    chartId: string,
    result: any,
    env: { DB: D1Database }
  ): Promise<void> {
    const db = drizzle(env.DB);

    const analysisId = crypto.randomUUID();

    const newAnalysis: InsertAdvancedAnalysisRecord = {
      id: analysisId,
      chartId,
      result,
      createdAt: new Date().toISOString(),
    };

    await db.insert(advancedAnalysisRecords).values(newAnalysis);
  }
}
