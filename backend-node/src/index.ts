import 'reflect-metadata';
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { initializeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './config/redis';
import { swaggerSpec, swaggerUiOptions } from './config/swagger';

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
import astrologyIntegrationRoutes from './routes/astrologyIntegrationRoutes';
import baziRoutes from './routes/baziRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import historyRoutes from './routes/historyRoutes';

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
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://peixuan.app', 'https://www.peixuan.app'] 
    : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 限制請求頻率
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 每個 IP 在 15 分鐘內最多 100 個請求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: '請求過多，請稍後再試',
    retryAfter: '15分鐘'
  }
});

// 對計算密集型 API 限制更嚴格
const calculationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分鐘
  max: 20, // 每個 IP 在 5 分鐘內最多 20 個請求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: '計算請求過多，請稍後再試',
    retryAfter: '5分鐘'
  }
});

// 監控與日誌中介軟體
app.use(requestLoggingMiddleware());
app.use(performanceMonitoringMiddleware);

// 健康檢查端點
app.get('/health', healthCheckHandler);
app.get('/metrics', metricsHandler);

// API 文檔端點 - 僅在開發環境啟用
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

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

// API 路由 - 帶頻率限制
app.use('/api/v1/purple-star', calculationLimiter, purpleStarRoutes);
app.use('/api/v1/astrology', calculationLimiter, astrologyIntegrationRoutes);
app.use('/api/v1/bazi', calculationLimiter, baziRoutes);
app.use('/api/v1/auth', apiLimiter, authRoutes);
app.use('/api/v1/users', apiLimiter, userRoutes);
app.use('/api/v1/history', apiLimiter, historyRoutes);

// 對所有其他 API 路徑應用一般頻率限制
app.use('/api/', apiLimiter);

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
const startServer = async () => {
  try {
    // 初始化資料庫
    await initializeDatabase();
    
    // 初始化 Redis 快取
    const redisConnected = await initializeRedis();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`🗄️ Database: PostgreSQL connected`);
      console.log(`🚀 Cache: ${redisConnected ? 'Redis' : 'Memory'} enabled`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📝 API Docs: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// 優雅關閉處理
process.on('SIGINT', async () => {
  logger.info('Server shutting down gracefully...');
  console.log('\n🛑 Server shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Server received SIGTERM, shutting down gracefully...');
  console.log('\n🛑 Server received SIGTERM, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});
