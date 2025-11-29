// 簡單的記憶體快取（Worker 重啟後清空）
const memoryCache = new Map<string, { value: any; expires: number }>();

export class CacheService {
  constructor(private kv?: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    // 優先使用 KV
    if (this.kv) {
      const value = await this.kv.get(key, 'json');
      return value as T | null;
    }

    // Fallback 到記憶體快取
    const cached = memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value as T;
    }
    
    memoryCache.delete(key);
    return null;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    // 優先使用 KV
    if (this.kv) {
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
      return;
    }

    // Fallback 到記憶體快取
    memoryCache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000
    });
  }

  async delete(key: string): Promise<void> {
    if (this.kv) {
      await this.kv.delete(key);
    }
    memoryCache.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    // KV 不支援模式刪除，需要手動實作
    if (this.kv) {
      // 簡化實作：只刪除精確匹配的 key
      await this.kv.delete(pattern);
    }
    
    // 記憶體快取支援模式刪除
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
  }
}

// 快取 key 生成器
export const CacheKeys = {
  chartList: (userId: string, page: number, limit: number, type?: string) =>
    `charts:${userId}:${page}:${limit}:${type || 'all'}`,
  
  chart: (id: string) => `chart:${id}`,
  
  analysisList: (userId: string, page: number, limit: number) =>
    `analyses:${userId}:${page}:${limit}`,
};

// TTL 策略（秒）
export const CacheTTL = {
  chartList: 300,      // 5 分鐘
  chart: 600,          // 10 分鐘
  analysisList: 300,   // 5 分鐘
};
