import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EnhancedStorageService, ENHANCED_STORAGE_KEYS, CURRENT_STORAGE_VERSION } from '../enhancedStorageService';
import * as storageService from '../storageService';
// 模擬 sessionStorage
const mockSessionStorage = (() => {
    let store = {};
    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value;
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key(index) {
            return Object.keys(store)[index] || null;
        }
    };
})();
describe('EnhancedStorageService', () => {
    // 模擬全局 sessionStorage
    beforeEach(() => {
        // 清除真實的 sessionStorage
        sessionStorage.clear();
        // 保存原始方法
        const originalSessionStorage = window.sessionStorage;
        // 替換為模擬對象
        Object.defineProperty(window, 'sessionStorage', {
            writable: true,
            value: mockSessionStorage
        });
        // 模擬 console.error 避免測試輸出
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
        // 清除模擬存儲
        mockSessionStorage.clear();
        // 模擬 Blob API
        global.Blob = vi.fn().mockImplementation((content, options) => {
            return {
                size: JSON.stringify(content).length,
                type: options?.type || 'application/json'
            };
        });
        // 模擬基本存儲服務方法
        vi.spyOn(storageService, 'saveToStorage').mockImplementation((key, value) => {
            mockSessionStorage.setItem(key, JSON.stringify(value));
        });
        vi.spyOn(storageService, 'getFromStorage').mockImplementation((key) => {
            const value = mockSessionStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('應該正確初始化並設置存儲版本', () => {
        const service = new EnhancedStorageService();
        const version = storageService.getFromStorage(ENHANCED_STORAGE_KEYS.STORAGE_VERSION);
        expect(version).toBe(CURRENT_STORAGE_VERSION);
    });
    it('應該能夠檢測 sessionStorage 是否可用', () => {
        const service = new EnhancedStorageService();
        expect(service.isStorageAvailable()).toBe(true);
        // 模擬 sessionStorage 拋出錯誤
        vi.spyOn(mockSessionStorage, 'setItem').mockImplementationOnce(() => {
            throw new Error('Storage full');
        });
        expect(service.isStorageAvailable()).toBe(false);
    });
    it('應該能夠保存和獲取圖表資料', () => {
        const service = new EnhancedStorageService();
        const testData = { test: 'data', values: [1, 2, 3] };
        // 保存資料
        const saved = service.saveChartData('bazi', testData);
        expect(saved).toBe(true);
        // 獲取資料
        const retrieved = service.getChartData('bazi');
        expect(retrieved).toEqual(testData);
    });
    it('應該在保存壓縮選項時壓縮資料', () => {
        const service = new EnhancedStorageService();
        const testData = { test: 'data', values: [1, 2, 3] };
        // 保存資料並啟用壓縮
        service.saveChartData('bazi', testData, { compress: true });
        // 直接從 mockSessionStorage 獲取原始資料
        const raw = mockSessionStorage.getItem(ENHANCED_STORAGE_KEYS.BAZI_CHART);
        const storedData = JSON.parse(raw);
        // 檢查資料是否被標記為壓縮
        expect(storedData.metadata.compressed).toBe(true);
        // 仍然應該能夠正確檢索和解壓縮資料
        const retrieved = service.getChartData('bazi');
        expect(retrieved).toEqual(testData);
    });
    it('應該能夠清除圖表資料', () => {
        const service = new EnhancedStorageService();
        // 保存不同類型的資料
        service.saveChartData('bazi', { test: 'bazi data' });
        service.saveChartData('purpleStar', { test: 'purple star data' });
        // 清除特定類型
        service.clearChartData('bazi');
        // 驗證只有指定類型被清除
        expect(service.getChartData('bazi')).toBeNull();
        expect(service.getChartData('purpleStar')).not.toBeNull();
        // 清除所有資料
        service.clearChartData();
        // 驗證所有資料都被清除
        expect(service.getChartData('purpleStar')).toBeNull();
    });
    it('應該能夠保存和獲取出生資訊', () => {
        const service = new EnhancedStorageService();
        const birthInfo = {
            name: '測試名稱',
            birthDate: '2000-01-01',
            birthTime: '12:00',
            gender: 'male',
            location: '台北'
        };
        // 保存出生資訊
        const saved = service.saveBirthInfo('bazi', birthInfo);
        expect(saved).toBe(true);
        // 獲取出生資訊
        const retrieved = service.getBirthInfo('bazi');
        // 檢查除了自動添加的字段外，原始資料應相同
        expect(retrieved.name).toBe(birthInfo.name);
        expect(retrieved.birthDate).toBe(birthInfo.birthDate);
        expect(retrieved.birthTime).toBe(birthInfo.birthTime);
        expect(retrieved.gender).toBe(birthInfo.gender);
        expect(retrieved.location).toBe(birthInfo.location);
        // 驗證添加了時間戳和版本資訊
        expect(retrieved._timestamp).toBeDefined();
        expect(retrieved._version).toBe(CURRENT_STORAGE_VERSION);
    });
    it('應該能夠保存和獲取用戶偏好設定', () => {
        const service = new EnhancedStorageService();
        const preferences = {
            timeZone: 'Asia/Taipei',
            language: 'zh_TW',
            theme: 'dark'
        };
        // 保存用戶偏好
        const saved = service.saveUserPreferences(preferences);
        expect(saved).toBe(true);
        // 獲取用戶偏好
        const retrieved = service.getUserPreferences();
        // 檢查資料
        expect(retrieved?.timeZone).toBe(preferences.timeZone);
        expect(retrieved?.language).toBe(preferences.language);
        expect(retrieved?.theme).toBe(preferences.theme);
        expect(retrieved?.lastUpdated).toBeDefined();
        // 驗證時區資訊也被單獨保存
        const timeZoneInfo = storageService.getFromStorage(ENHANCED_STORAGE_KEYS.TIMEZONE_INFO);
        expect(timeZoneInfo?.timeZone).toBe(preferences.timeZone);
        expect(timeZoneInfo?.timestamp).toBeDefined();
    });
    it('應該能夠驗證存儲資料的完整性', () => {
        const service = new EnhancedStorageService();
        // 設置完整配對的資料
        service.saveChartData('bazi', { test: 'bazi data' });
        service.saveBirthInfo('bazi', { name: '測試' });
        // 驗證結果應為 true
        expect(service.validateStorageData()).toBe(true);
        // 檢查是否更新了最後驗證時間
        const lastValidated = storageService.getFromStorage(ENHANCED_STORAGE_KEYS.STORAGE_LAST_VALIDATED);
        expect(lastValidated).toBeDefined();
        // 設置不完整的資料
        service.clearChartData();
        service.saveChartData('purpleStar', { test: 'purple star data' });
        // 故意不保存對應的出生資訊
        // 驗證結果應為 false
        expect(service.validateStorageData()).toBe(false);
    });
    it('應該能夠獲取存儲使用統計', () => {
        const service = new EnhancedStorageService();
        // 添加一些資料以增加存儲使用量
        service.saveChartData('bazi', { test: 'bazi data' });
        service.saveChartData('purpleStar', { test: 'purple star data' });
        service.saveBirthInfo('bazi', { name: '測試' });
        const stats = service.getStorageUsage();
        // 驗證統計資訊
        expect(stats).toBeDefined();
        expect(stats?.totalSize).toBeGreaterThan(0);
        expect(stats?.itemCount).toBeGreaterThan(0);
        expect(stats?.usagePercentage).toBeGreaterThan(0);
        expect(stats?.items.length).toBeGreaterThan(0);
        expect(stats?.lastUpdated).toBeDefined();
    });
    it('應該能夠進行資料遷移', () => {
        const service = new EnhancedStorageService();
        // 模擬舊版本資料
        const oldVersion = '0.9.0';
        storageService.saveToStorage(ENHANCED_STORAGE_KEYS.STORAGE_VERSION, oldVersion);
        // 設置舊格式的資料
        const oldBaziData = { old: 'bazi data' };
        const oldBirthInfo = { old: 'birth info' };
        storageService.saveToStorage(ENHANCED_STORAGE_KEYS.BAZI_CHART, oldBaziData);
        storageService.saveToStorage(ENHANCED_STORAGE_KEYS.BAZI_BIRTH_INFO, oldBirthInfo);
        // 執行遷移
        const migrated = service.migrateData(oldVersion, CURRENT_STORAGE_VERSION);
        expect(migrated).toBe(true);
        // 驗證版本已更新
        const newVersion = storageService.getFromStorage(ENHANCED_STORAGE_KEYS.STORAGE_VERSION);
        expect(newVersion).toBe(CURRENT_STORAGE_VERSION);
        // 驗證資料已遷移到新格式
        const baziData = service.getChartData('bazi');
        expect(baziData).toEqual(oldBaziData);
        const birthInfo = service.getBirthInfo('bazi');
        expect(birthInfo._version).toBe(CURRENT_STORAGE_VERSION);
    });
});
//# sourceMappingURL=enhancedStorageService.spec.js.map