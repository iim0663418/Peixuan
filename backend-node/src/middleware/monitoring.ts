import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import logger, { logApiMetrics, logError, logUserActivity } from '../utils/logger';

// 請求日誌中介軟體
export function requestLoggingMiddleware() {
  return morgan('combined', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    }
  });
}

// 效能監控中介軟體
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.route ? req.route.path : req.path;
    
    logApiMetrics({
      path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      userRole: (req as any).user?.role || 'anonymous',
      ip: req.ip
    });
  });
  
  next();
}

// 錯誤處理中介軟體
interface ErrorWithStatus extends Error {
  status?: number;
}

export function errorHandlingMiddleware(err: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void {
  // 記錄錯誤詳細資訊
  logError(err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id || 'anonymous',
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  // 根據環境回應不同的錯誤訊息
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
}

// 用戶活動記錄中介軟體
export function userActivityMiddleware(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    
    if (userId) {
      logUserActivity({
        userId,
        action,
        details: {
          path: req.path,
          method: req.method,
          body: req.body,
          query: req.query
        },
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    next();
  };
}

// 健康檢查端點
export function healthCheckHandler(req: Request, res: Response): void {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
  
  logger.info('Health check requested', { type: 'health_check', ...healthData });
  
  res.json(healthData);
}

// 監控指標端點
export function metricsHandler(req: Request, res: Response): void {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
  
  logger.info('Metrics requested', { type: 'metrics_request', ...metrics });
  
  res.json(metrics);
}
