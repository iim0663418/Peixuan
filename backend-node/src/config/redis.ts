import Redis from 'ioredis';
import { logger } from '../utils/logger';

/**
 * Redis 連接配置
 * 安全措施：使用環境變數，避免硬編碼敏感資訊
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Redis 客戶端實例
export const redisClient = new Redis(redisConfig);

/**
 * 初始化 Redis 連接
 * 安全措施：優雅降級，連接失敗不影響主要功能
 */
export const initializeRedis = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    logger.info('✅ Redis 連接成功', {
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db
    });
    return true;
  } catch (error) {
    logger.warn('⚠️ Redis 連接失敗，將使用記憶體快取', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: 'memory-cache'
    });
    return false;
  }
};

/**
 * Redis 連接狀態檢查
 */
export const isRedisConnected = (): boolean => {
  return redisClient.status === 'ready';
};

/**
 * 優雅關閉 Redis 連接
 */
export const closeRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis 連接已關閉');
  } catch (error) {
    logger.error('關閉 Redis 連接時發生錯誤:', error);
  }
};