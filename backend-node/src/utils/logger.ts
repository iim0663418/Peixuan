import winston from 'winston';
import path from 'path';

// 建立日誌目錄路徑
const logDir = path.join(__dirname, '../../logs');

// 定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 建立 Winston logger 實例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'bazi-app-backend' },
  transports: [
    // 錯誤日誌檔案
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 組合日誌檔案
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 在開發環境中也輸出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;

// 用戶活動記錄功能
export interface UserActivity {
  userId: string;
  action: string;
  details: any;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export function logUserActivity(activity: UserActivity): void {
  logger.info('User Activity', {
    type: 'user_activity',
    ...activity
  });
}

// API 效能記錄功能
export interface ApiMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  userRole?: string;
  ip?: string;
}

export function logApiMetrics(metrics: ApiMetrics): void {
  logger.info('API Metrics', {
    type: 'api_metrics',
    ...metrics
  });

  // 記錄慢查詢警告
  if (metrics.duration > 1000) {
    logger.warn(`Slow API call: ${metrics.method} ${metrics.path} took ${metrics.duration}ms`, {
      type: 'performance_warning',
      ...metrics
    });
  }
}

// 錯誤追蹤功能
export function logError(error: Error, context?: any): void {
  logger.error('Application Error', {
    type: 'application_error',
    message: error.message,
    stack: error.stack,
    ...context
  });
}
