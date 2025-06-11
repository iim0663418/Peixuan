import { jest } from '@jest/globals';

// 設定測試環境變數
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'silent';

// 全域 mock 設定
jest.setTimeout(10000);

// Mock console methods in test environment
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 清理函數
afterEach(() => {
  jest.clearAllMocks();
});
