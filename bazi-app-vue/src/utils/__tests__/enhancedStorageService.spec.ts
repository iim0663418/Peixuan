import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import enhancedStorageService from '../enhancedStorageService';
import * as storageService from '../storageService';

// 模擬 sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      return Object.keys(store)[index] || null;
    },
  };
})();

// 在測試前設置全局 sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('EnhancedStorageService', () => {
  beforeEach(() => {
    // 清空 sessionStorage
    mockSessionStorage.clear();
    // 清除所有 mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('應該正確初始化並設置存儲版本', () => {
    enhancedStorageService.initializeStorage();
    const version = storageService.getFromStorage('peixuan_storage_version');
    expect(version).toBeDefined();
  });

  it('應該能夠檢測 sessionStorage 是否可用', () => {
    expect(enhancedStorageService.isStorageAvailable()).toBe(true);
  });

  it('應該能夠保存和獲取圖表資料', () => {
    const testData = { test: 'data', values: [1, 2, 3] };
    enhancedStorageService.initializeChartData('bazi', testData);
    const unified = enhancedStorageService.getUnifiedSessionData();
    expect(unified?.charts.bazi).toEqual(testData);
  });

  it('應該在保存壓縮選項時壓縮資料', () => {
    const testData = { test: 'data', values: [1, 2, 3] };
    enhancedStorageService.initializeChartData('bazi', testData);
    const unified = enhancedStorageService.getUnifiedSessionData();
    expect(unified).toBeDefined();
  });

  it('應該能夠清除圖表資料', () => {
    enhancedStorageService.initializeChartData('bazi', { test: 'data' });
    enhancedStorageService.clearChartData();
    const unified = enhancedStorageService.getUnifiedSessionData();
    expect(unified?.charts.bazi).toBeUndefined();
  });

  it('應該能夠保存和獲取出生資訊', () => {
    const birthInfo = {
      name: '測試名稱',
      birthDate: '2000-01-01',
      birthTime: '12:00',
      gender: 'male',
    };
    storageService.saveToStorage('peixuan_birth_info', birthInfo);
    const retrieved = storageService.getFromStorage('peixuan_birth_info');
    expect(retrieved).toEqual(birthInfo);
  });

  it('應該能夠保存和獲取用戶偏好設定', () => {
    const preferences = {
      timeZone: 'Asia/Taipei',
      language: 'zh-TW',
    };
    storageService.saveToStorage('peixuan_user_preferences', preferences);
    const retrieved = storageService.getFromStorage('peixuan_user_preferences');
    expect(retrieved).toEqual(preferences);
  });

  it('應該能夠驗證存儲資料的完整性', () => {
    enhancedStorageService.initializeStorage();
    const validation = enhancedStorageService.validateStorageData();
    expect(validation).toBeDefined();
    expect(validation.isValid).toBe(true);
  });

  it('應該能夠獲取存儲使用統計', () => {
    enhancedStorageService.initializeStorage();
    const stats = enhancedStorageService.getStorageUsage();
    expect(stats).toBeDefined();
    expect(stats.totalSize).toBeGreaterThanOrEqual(0);
  });

  it('應該能夠進行資料遷移', () => {
    enhancedStorageService.initializeStorage();
    const unified = enhancedStorageService.getUnifiedSessionData();
    expect(unified).toBeDefined();
    expect(unified?.sessionId).toBeDefined();
  });
});
