import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { chartRecords, type ChartRecord, type InsertChartRecord } from '../db/schema';

/**
 * ChartCacheService
 *
 * Handles chart record operations with D1 database using Drizzle ORM.
 * Provides methods for retrieving, saving, and querying chart records.
 */
export class ChartCacheService {
  /**
   * Get a chart record by ID
   * @param chartId - The chart ID to retrieve
   * @param env - Cloudflare Worker environment containing DB binding
   * @returns The chart record or null if not found
   */
  async getChart(chartId: string, env: { DB: D1Database }): Promise<ChartRecord | null> {
    const db = drizzle(env.DB);

    const result = await db
      .select()
      .from(chartRecords)
      .where(eq(chartRecords.id, chartId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Save a new chart record
   * @param chartId - The chart ID (UUID)
   * @param calculation - The calculation result data
   * @param metadata - Chart metadata (birthDate, birthTime, location, etc.)
   * @param env - Cloudflare Worker environment containing DB binding
   */
  async saveChart(
    chartId: string,
    calculation: any,
    metadata: {
      name?: string;
      birthDate: string;
      birthTime: string;
      location: string;
    },
    env: { DB: D1Database }
  ): Promise<void> {
    const db = drizzle(env.DB);

    const newChart: InsertChartRecord = {
      id: chartId,
      userId: null, // Anonymous user
      type: 'integrated',
      chartData: calculation,
      metadata,
      createdAt: new Date().toISOString(),
    };

    await db.insert(chartRecords).values(newChart);
  }

  /**
   * Get recent chart records
   * @param limit - Maximum number of records to retrieve
   * @param env - Cloudflare Worker environment containing DB binding
   * @returns Array of chart records ordered by creation date (newest first)
   */
  async getRecentCharts(limit: number, env: { DB: D1Database }): Promise<ChartRecord[]> {
    const db = drizzle(env.DB);

    const results = await db
      .select()
      .from(chartRecords)
      .orderBy(desc(chartRecords.createdAt))
      .limit(limit);

    return results;
  }
}
