import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { chartRecords, analysisRecords } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

export class ChartController {
  async getChartHistory(db: D1Database, userId: string, page = 1, limit = 10, type?: string) {
    const orm = drizzle(db);
    const offset = (page - 1) * limit;
    
    let query = orm.select().from(chartRecords).where(eq(chartRecords.userId, userId));
    if (type) query = query.where(eq(chartRecords.type, type as any));
    
    const records = await query.orderBy(desc(chartRecords.createdAt)).limit(limit).offset(offset);
    return { data: records, page, limit };
  }

  async saveChart(db: D1Database, userId: string, data: any) {
    const orm = drizzle(db);
    const id = uuidv4();
    
    const [record] = await orm.insert(chartRecords).values({
      id,
      userId,
      type: data.type,
      chartData: data.data,
      metadata: { birthDate: data.birthDate, birthTime: data.birthTime, location: data.location, name: data.name }
    }).returning();
    
    return record;
  }

  async getChart(db: D1Database, id: string, userId: string) {
    const orm = drizzle(db);
    const [record] = await orm.select().from(chartRecords)
      .where(and(eq(chartRecords.id, id), eq(chartRecords.userId, userId)));
    return record;
  }

  async deleteChart(db: D1Database, id: string, userId: string) {
    const orm = drizzle(db);
    const result = await orm.delete(chartRecords)
      .where(and(eq(chartRecords.id, id), eq(chartRecords.userId, userId)));
    return result.success;
  }

  async getAnalysisHistory(db: D1Database, userId: string, page = 1, limit = 10) {
    const orm = drizzle(db);
    const offset = (page - 1) * limit;
    
    const records = await orm.select().from(analysisRecords)
      .where(eq(analysisRecords.userId, userId))
      .orderBy(desc(analysisRecords.createdAt))
      .limit(limit).offset(offset);
    
    return { data: records, page, limit };
  }

  async saveAnalysis(db: D1Database, userId: string, data: any) {
    const orm = drizzle(db);
    const id = uuidv4();
    
    const [record] = await orm.insert(analysisRecords).values({
      id,
      userId,
      chartId: data.chartId,
      analysisType: data.type,
      result: data.result
    }).returning();
    
    return record;
  }
}
