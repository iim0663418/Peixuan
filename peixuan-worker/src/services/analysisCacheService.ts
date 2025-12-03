import { eq, and, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { analysisRecords, type AnalysisRecord, type InsertAnalysisRecord } from '../db/schema';

/**
 * AnalysisCacheService
 *
 * Handles analysis record operations with D1 database using Drizzle ORM.
 * Provides methods for retrieving and saving analysis results with 24-hour expiry.
 */
export class AnalysisCacheService {
  /**
   * Get an analysis record by chart ID and analysis type
   * @param chartId - The chart ID to query
   * @param analysisType - The type of analysis (e.g., 'ai-streaming')
   * @param env - Cloudflare Worker environment containing DB binding
   * @returns The analysis record or null if not found or expired (>24 hours)
   */
  async getAnalysis(
    chartId: string,
    analysisType: string,
    env: { DB: D1Database }
  ): Promise<AnalysisRecord | null> {
    const db = drizzle(env.DB);

    const result = await db
      .select()
      .from(analysisRecords)
      .where(
        and(
          eq(analysisRecords.chartId, chartId),
          eq(analysisRecords.analysisType, analysisType)
        )
      )
      .orderBy(desc(analysisRecords.createdAt))
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
   * Save a new analysis record
   * @param chartId - The chart ID this analysis belongs to
   * @param analysisType - The type of analysis (e.g., 'ai-streaming')
   * @param result - The analysis result data
   * @param env - Cloudflare Worker environment containing DB binding
   */
  async saveAnalysis(
    chartId: string,
    analysisType: string,
    result: any,
    env: { DB: D1Database }
  ): Promise<void> {
    const db = drizzle(env.DB);

    const analysisId = crypto.randomUUID();

    const newAnalysis: InsertAnalysisRecord = {
      id: analysisId,
      userId: null, // Anonymous user
      chartId,
      analysisType,
      result,
      createdAt: new Date().toISOString(),
    };

    await db.insert(analysisRecords).values(newAnalysis);
  }
}
