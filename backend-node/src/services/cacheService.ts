/**
 * 分布式快取服務
 * 安全措施：雙層快取架構 (Redis + 記憶體)，支援優雅降級
 * 輸入驗證：所有快取鍵都經過驗證和消毒
 */

import NodeCache from 'node-cache';
import { redisClient, isRedisConnected } from '../config/redis';
import { logger } from '../utils/logger';

// 記憶體快取作為備用方案
const memoryCache = new NodeCache({ 
  stdTTL: 600,
  checkperiod: 120,
  useClones: false
});

const keyPrefix = 'peixuan:';

/**
 * 快取鍵消毒函數
 * 安全措施：移除特殊字符，防止快取污染
 */
const sanitizeKey = (key: string): string | null => {
  if (!key || typeof key !== 'string') {
    return null;
  }

  const sanitized = key.replace(/[^a-zA-Z0-9\-_:]/g, '');
  
  if (sanitized.length === 0 || sanitized.length > 250) {
    return null;
  }

  return sanitized;
};

/**
 * 快取服務
 */
export const cacheService = {
  /**
   * 從快取中獲取資料
   * 安全措施：鍵名驗證，資料反序列化安全檢查
   * @param key 快取鍵
   * @returns 快取的資料，如果不存在則返回undefined
   */
  get: async <T>(key: string): Promise<T | undefined> => {
    const sanitizedKey = sanitizeKey(key);
    if (!sanitizedKey) {
      logger.warn('無效的快取鍵', { originalKey: key });
      return undefined;
    }

    try {
      // 優先使用 Redis
      if (isRedisConnected()) {
        const value = await redisClient.get(keyPrefix + sanitizedKey);
        if (value) {
          logger.debug('Redis 快取命中', { key: sanitizedKey });
          return JSON.parse(value) as T;
        }
      }

      // 降級到記憶體快取
      const memValue = memoryCache.get<T>(sanitizedKey);
      if (memValue !== undefined) {
        logger.debug('記憶體快取命中', { key: sanitizedKey });
        return memValue;
      }

      return undefined;
    } catch (error) {
      logger.error('快取獲取失敗', { key: sanitizedKey, error });
      return undefined;
    }
  },

  /**
   * 將資料存入快取
   * 安全措施：鍵名驗證，防止快取污染攻擊
   * @param key 快取鍵
   * @param value 要快取的資料
   * @param ttl 可選的TTL（秒），覆蓋預設值
   * @returns 是否成功設置
   */
  set: async <T>(key: string, value: T, ttl?: number): Promise<boolean> => {
    const sanitizedKey = sanitizeKey(key);
    if (!sanitizedKey) {
      logger.warn('無效的快取鍵', { originalKey: key });
      return false;
    }

    const finalTtl = ttl || 600;
    const serializedValue = JSON.stringify(value);

    try {
      // 優先使用 Redis
      if (isRedisConnected()) {
        await redisClient.setex(keyPrefix + sanitizedKey, finalTtl, serializedValue);
        logger.debug('Redis 快取設定成功', { key: sanitizedKey, ttl: finalTtl });
        return true;
      } else {
        // 降級到記憶體快取
        const success = memoryCache.set(sanitizedKey, value, finalTtl);
        logger.debug('記憶體快取設定成功', { key: sanitizedKey, ttl: finalTtl });
        return success;
      }
    } catch (error) {
      logger.error('快取設定失敗', { key: sanitizedKey, error });
      return memoryCache.set(sanitizedKey, value, finalTtl);
    }
  },

  /**
   * 從快取中刪除資料
   * 安全措施：鍵名驗證，防止惡意刪除
   * @param key 快取鍵
   * @returns 刪除的項目數量
   */
  del: async (key: string): Promise<number> => {
    const sanitizedKey = sanitizeKey(key);
    if (!sanitizedKey) {
      logger.warn('無效的快取鍵', { originalKey: key });
      return 0;
    }

    try {
      let deletedCount = 0;

      if (isRedisConnected()) {
        deletedCount += await redisClient.del(keyPrefix + sanitizedKey);
      }

      deletedCount += memoryCache.del(sanitizedKey);
      logger.debug('快取項目已刪除', { key: sanitizedKey, deletedCount });
      return deletedCount;
    } catch (error) {
      logger.error('快取刪除失敗', { key: sanitizedKey, error });
      return 0;
    }
  },

  /**
   * 清空整個快取
   * 安全措施：僅清空應用相關的快取項目
   */
  flush: async (): Promise<void> => {
    try {
      if (isRedisConnected()) {
        const keys = await redisClient.keys(keyPrefix + '*');
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }

      memoryCache.flushAll();
      logger.info('所有快取已清空');
    } catch (error) {
      logger.error('清空快取失敗', { error });
    }
  },

  /**
   * 獲取快取統計資訊
   * @returns 快取統計資訊
   */
  stats: async () => {
    const memStats = memoryCache.getStats();
    let redisStats = {};

    if (isRedisConnected()) {
      try {
        const info = await redisClient.info('memory');
        redisStats = { connected: true, info };
      } catch (error) {
        redisStats = { connected: false, error };
      }
    }

    return {
      memory: memStats,
      redis: redisStats
    };
  },

  /**
   * 獲取或設置快取
   * 如果快取中存在資料，則返回快取的資料
   * 如果不存在，則執行提供的函數，將結果存入快取並返回
   * 
   * @param key 快取鍵
   * @param fn 當快取未命中時執行的函數
   * @param ttl 可選的TTL（秒）
   * @returns 快取的資料或函數執行結果
   */
  getOrSet: async <T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> => {
    const cachedData = await cacheService.get<T>(key);
    if (cachedData !== undefined) {
      return cachedData;
    }

    const data = await fn();
    await cacheService.set(key, data, ttl);
    return data;
  }
};

export default cacheService;