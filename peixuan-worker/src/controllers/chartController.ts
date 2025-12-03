import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { chartRecords, analysisRecords } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { CacheService, CacheKeys, CacheTTL } from '../services/cacheService';

export class ChartController {
  private cache: CacheService;

  constructor(kv?: KVNamespace) {
    this.cache = new CacheService(kv);
  }

  async getChartHistory(db: D1Database, userId: string, page = 1, limit = 10, type?: string) {
    const cacheKey = CacheKeys.chartList(userId, page, limit, type);
    
    // 嘗試從快取取得
    const cached = await this.cache.get(cacheKey);
    if (cached) {return cached;}

    // 查詢資料庫
    const orm = drizzle(db);
    const offset = (page - 1) * limit;
    
    let query = orm.select().from(chartRecords).where(eq(chartRecords.userId, userId));
    if (type) {query = query.where(eq(chartRecords.type, type as any));}
    
    const records = await query.orderBy(desc(chartRecords.createdAt)).limit(limit).offset(offset);
    const result = { data: records, page, limit };

    // 存入快取
    await this.cache.set(cacheKey, result, CacheTTL.chartList);
    
    return result;
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

    // 清除相關快取
    await this.cache.deletePattern(`charts:${userId}`);
    
    return record;
  }

  async getChart(db: D1Database, id: string) {
    const cacheKey = CacheKeys.chart(id);
    
    // 嘗試從快取取得
    const cached = await this.cache.get(cacheKey);
    if (cached) {return cached;}

    // 查詢資料庫（只用 chartId，不檢查 userId）
    const orm = drizzle(db);
    const [record] = await orm.select().from(chartRecords)
      .where(eq(chartRecords.id, id));

    if (record) {
      // 存入快取
      await this.cache.set(cacheKey, record, CacheTTL.chart);
    }

    return record;
  }

  async deleteChart(db: D1Database, id: string, userId: string) {
    const orm = drizzle(db);
    const result = await orm.delete(chartRecords)
      .where(and(eq(chartRecords.id, id), eq(chartRecords.userId, userId)));

    // 清除快取
    await this.cache.delete(CacheKeys.chart(id));
    await this.cache.deletePattern(`charts:${userId}`);

    return result.success;
  }

  async getAnalysisHistory(db: D1Database, userId: string, page = 1, limit = 10) {
    const cacheKey = CacheKeys.analysisList(userId, page, limit);
    
    // 嘗試從快取取得
    const cached = await this.cache.get(cacheKey);
    if (cached) {return cached;}

    // 查詢資料庫
    const orm = drizzle(db);
    const offset = (page - 1) * limit;
    
    const records = await orm.select().from(analysisRecords)
      .where(eq(analysisRecords.userId, userId))
      .orderBy(desc(analysisRecords.createdAt))
      .limit(limit).offset(offset);
    
    const result = { data: records, page, limit };

    // 存入快取
    await this.cache.set(cacheKey, result, CacheTTL.analysisList);

    return result;
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

    // 清除相關快取
    await this.cache.deletePattern(`analyses:${userId}`);
    
    return record;
  }
}
