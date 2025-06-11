import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// 導入監控與日誌中介軟體
import { 
  requestLoggingMiddleware,
  performanceMonitoringMiddleware,
  errorHandlingMiddleware,
  healthCheckHandler,
  metricsHandler
} from './middleware/monitoring';

// 導入路由
import purpleStarRoutes from './routes/purpleStarRoutes';
import authRoutes from './routes/authRoutes';
import astrologyIntegrationRoutes from './routes/astrologyIntegrationRoutes';

// 導入日誌系統
import logger from './utils/logger';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// 確保日誌目錄存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 基本中介軟體設置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 監控與日誌中介軟體
app.use(requestLoggingMiddleware());
app.use(performanceMonitoringMiddleware);

// 健康檢查端點
app.get('/health', healthCheckHandler);
app.get('/metrics', metricsHandler);

// 基本路由
app.get('/', (req: Request, res: Response) => {
  logger.info('Root endpoint accessed', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  res.json({ 
    message: 'Bazi App Backend Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/purple-star', purpleStarRoutes);
app.use('/api/v1/astrology', astrologyIntegrationRoutes);

// 404 處理
app.use('*', (req: Request, res: Response) => {
  logger.warn('404 - Route not found', { 
    path: req.path, 
    method: req.method,
    ip: req.ip 
  });
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method 
  });
});

// 錯誤處理中介軟體（必須在最後）
app.use(errorHandlingMiddleware);

// 啟動伺服器
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});

// 優雅關閉處理
process.on('SIGINT', () => {
  logger.info('Server shutting down gracefully...');
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Server received SIGTERM, shutting down gracefully...');
  console.log('\n🛑 Server received SIGTERM, shutting down gracefully...');
  process.exit(0);
});
