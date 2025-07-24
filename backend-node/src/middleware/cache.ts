import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';

/**
 * 快取中介軟體
 * 安全措施：輸入驗證、快取鍵消毒、最小權限原則
 */

interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

/**
 * 預設快取鍵生成器
 * 安全措施：移除敏感資訊，防止快取污染
 */
const defaultKeyGenerator = (req: Request): string => {
  const method = req.method;
  const path = req.path;
  const query = JSON.stringify(req.query);
  
  // 移除敏感參數
  const sanitizedQuery = query.replace(/"(password|token|secret|key)":[^,}]*/gi, '');
  
  return `api:${method}:${path}:${Buffer.from(sanitizedQuery).toString('base64')}`;
};

/**
 * 快取中介軟體工廠函數
 * @param options 快取選項
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 預設 5 分鐘
    keyGenerator = defaultKeyGenerator,
    condition = () => true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // 安全檢查：僅對 GET 請求啟用快取
    if (req.method !== 'GET') {
      return next();
    }

    // 條件檢查
    if (!condition(req)) {
      return next();
    }

    try {
      // 生成快取鍵
      const cacheKey = keyGenerator(req);
      
      // 嘗試從快取獲取資料
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug('快取命中', { 
          path: req.path, 
          method: req.method,
          cacheKey: cacheKey.substring(0, 50) + '...' 
        });
        
        // 設置快取標頭
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey.substring(0, 20) + '...');
        
        return res.json(cachedData);
      }

      // 快取未命中，攔截響應
      const originalJson = res.json;
      res.json = function(data: any) {
        // 僅快取成功響應
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, ttl).catch(error => {
            logger.error('快取設定失敗', { cacheKey, error });
          });
          
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('X-Cache-TTL', ttl.toString());
        }
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('快取中介軟體錯誤', { error, path: req.path });
      // 快取錯誤不應影響正常請求
      next();
    }
  };
};

/**
 * 計算密集型 API 快取中介軟體
 * 較長的 TTL，適用於命理計算等耗時操作
 */
export const calculationCacheMiddleware = cacheMiddleware({
  ttl: 3600, // 1 小時
  keyGenerator: (req: Request) => {
    const body = req.body || {};
    const sanitizedBody = { ...body };
    
    // 移除敏感資訊
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    
    return `calc:${req.path}:${Buffer.from(JSON.stringify(sanitizedBody)).toString('base64')}`;
  },
  condition: (req: Request) => {
    // 僅對特定路徑啟用
    return req.path.includes('/calculate') || req.path.includes('/analysis');
  }
});

/**
 * 用戶資料快取中介軟體
 * 較短的 TTL，確保資料即時性
 */
export const userDataCacheMiddleware = cacheMiddleware({
  ttl: 900, // 15 分鐘
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || 'anonymous';
    return `user:${userId}:${req.path}:${JSON.stringify(req.query)}`;
  },
  condition: (req: Request) => {
    // 僅對用戶相關路徑啟用
    return req.path.includes('/users') || req.path.includes('/history');
  }
});

/**
 * 快取失效中介軟體
 * 在資料更新時清除相關快取
 */
export const cacheInvalidationMiddleware = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // 僅在成功更新時清除快取
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(async (pattern) => {
          try {
            // 這裡可以實現模式匹配的快取清除
            // 暫時使用簡單的鍵清除
            await cacheService.del(pattern);
            logger.debug('快取已失效', { pattern });
          } catch (error) {
            logger.error('快取失效失敗', { pattern, error });
          }
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};