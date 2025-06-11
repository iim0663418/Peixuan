/**
 * 增強型存儲服務 - 提供進階的數據存儲與獲取功能
 * 擴展基本 storageService 並增加更多功能，如版本控制、壓縮和錯誤處理
 */

import { STORAGE_KEYS, saveToStorage, getFromStorage } from './storageService';

// 存儲鍵名常數擴展
export const ENHANCED_STORAGE_KEYS = {
  ...STORAGE_KEYS,
  STORAGE_VERSION: 'peixuan_storage_version',
  STORAGE_LAST_VALIDATED: 'peixuan_storage_last_validated',
  STORAGE_USAGE_STATS: 'peixuan_storage_usage_stats'
};

// 目前的存儲版本
export const CURRENT_STORAGE_VERSION = '1.0.0';

/**
 * 存儲選項接口
 */
export interface StorageOptions {
  compress?: boolean;
  encrypt?: boolean;
  version?: string;
  expireInMinutes?: number;
}

/**
 * 圖表數據接口
 */
export interface ChartData {
  id?: string;
  timestamp: number;
  data: any;
  metadata?: {
    version?: string;
    compressed?: boolean;
    size?: number;
    lastAccessed?: number;
  };
}

/**
 * 用戶偏好設定接口
 */
export interface UserPreferences {
  timeZone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  lastUpdated?: number;
}

/**
 * 存儲統計接口
 */
export interface StorageStats {
  totalSize: number;
  itemCount: number;
  lastUpdated: number;
  usagePercentage: number;
  items: {
    key: string;
    size: number;
    lastAccessed?: number;
  }[];
}

/**
 * 增強型存儲服務類
 */
export class EnhancedStorageService {
  private defaultOptions: StorageOptions = {
    compress: false,
    encrypt: false,
    version: CURRENT_STORAGE_VERSION,
    expireInMinutes: 60 * 24 // 默認24小時
  };

  constructor(private readonly options: StorageOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
    this.initializeStorage();
  }

  /**
   * 初始化存儲
   */
  private initializeStorage(): void {
    try {
      // 檢查存儲版本，必要時進行遷移
      const storedVersion = this.getStorageVersion();
      if (storedVersion && storedVersion !== CURRENT_STORAGE_VERSION) {
        this.migrateData(storedVersion, CURRENT_STORAGE_VERSION);
      }

      // 更新存儲版本
      this.setStorageVersion(CURRENT_STORAGE_VERSION);

      // 更新存儲統計
      this.updateStorageStats();
    } catch (error) {
      console.error('初始化存儲時發生錯誤:', error);
    }
  }

  /**
   * 獲取存儲版本
   */
  private getStorageVersion(): string | null {
    return getFromStorage<string>(ENHANCED_STORAGE_KEYS.STORAGE_VERSION);
  }

  /**
   * 設置存儲版本
   */
  private setStorageVersion(version: string): void {
    saveToStorage(ENHANCED_STORAGE_KEYS.STORAGE_VERSION, version);
  }

  /**
   * 更新存儲統計
   */
  private updateStorageStats(): void {
    try {
      const stats: StorageStats = {
        totalSize: 0,
        itemCount: 0,
        lastUpdated: Date.now(),
        usagePercentage: 0,
        items: []
      };

      // 遍歷所有 sessionStorage 項目
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          if (value) {
            const size = new Blob([value]).size;
            stats.totalSize += size;
            stats.itemCount++;
            stats.items.push({
              key,
              size,
              lastAccessed: Date.now()
            });
          }
        }
      }

      // 計算使用百分比 (假設 sessionStorage 限制為 5MB)
      const storageLimit = 5 * 1024 * 1024; // 5MB in bytes
      stats.usagePercentage = (stats.totalSize / storageLimit) * 100;

      // 保存統計信息
      saveToStorage(ENHANCED_STORAGE_KEYS.STORAGE_USAGE_STATS, stats);
    } catch (error) {
      console.error('更新存儲統計時發生錯誤:', error);
    }
  }

  /**
   * 檢查 sessionStorage 是否可用
   */
  public isStorageAvailable(): boolean {
    try {
      const testKey = 'peixuan_storage_test';
      sessionStorage.setItem(testKey, 'test');
      const result = sessionStorage.getItem(testKey) === 'test';
      sessionStorage.removeItem(testKey);
      return result;
    } catch (error) {
      return false;
    }
  }

  /**
   * 獲取存儲使用統計
   */
  public getStorageUsage(): StorageStats | null {
    return getFromStorage<StorageStats>(ENHANCED_STORAGE_KEYS.STORAGE_USAGE_STATS);
  }

  /**
   * 壓縮數據
   * 簡單實現，實際使用時可以使用更高效的壓縮庫
   */
  private compressData(data: any): any {
    if (!data) return data;
    
    try {
      const stringData = JSON.stringify(data);
      // 這裡可以使用實際的壓縮庫，如 pako 或 lz-string
      // 現在只是模擬壓縮效果
      return {
        _compressed: true,
        data: stringData
      };
    } catch (error) {
      console.error('壓縮數據時發生錯誤:', error);
      return data;
    }
  }

  /**
   * 解壓縮數據
   */
  private decompressData(data: any): any {
    if (!data || !data._compressed) return data;
    
    try {
      // 這裡應該使用與壓縮相同的庫進行解壓縮
      // 現在只是模擬解壓縮效果
      return JSON.parse(data.data);
    } catch (error) {
      console.error('解壓縮數據時發生錯誤:', error);
      return data;
    }
  }

  /**
   * 保存圖表數據
   */
  public saveChartData(chartType: 'bazi' | 'purpleStar' | 'integrated', data: any, options?: StorageOptions): boolean {
    try {
      const mergedOptions = { ...this.options, ...options };
      
      // 決定存儲鍵
      let storageKey;
      switch (chartType) {
        case 'bazi':
          storageKey = ENHANCED_STORAGE_KEYS.BAZI_CHART;
          break;
        case 'purpleStar':
          storageKey = ENHANCED_STORAGE_KEYS.PURPLE_STAR_CHART;
          break;
        case 'integrated':
          storageKey = ENHANCED_STORAGE_KEYS.INTEGRATED_ANALYSIS;
          break;
        default:
          throw new Error(`未知的圖表類型: ${chartType}`);
      }

      // 準備存儲數據
      const chartData: ChartData = {
        timestamp: Date.now(),
        data: mergedOptions.compress ? this.compressData(data) : data,
        metadata: {
          version: mergedOptions.version || CURRENT_STORAGE_VERSION,
          compressed: mergedOptions.compress,
          size: new Blob([JSON.stringify(data)]).size,
          lastAccessed: Date.now()
        }
      };

      // 存儲數據
      saveToStorage(storageKey, chartData);

      // 更新存儲統計
      this.updateStorageStats();

      return true;
    } catch (error) {
      console.error(`保存${chartType}圖表數據時發生錯誤:`, error);
      return false;
    }
  }

  /**
   * 獲取圖表數據
   */
  public getChartData(chartType: 'bazi' | 'purpleStar' | 'integrated'): any | null {
    try {
      // 決定存儲鍵
      let storageKey;
      switch (chartType) {
        case 'bazi':
          storageKey = ENHANCED_STORAGE_KEYS.BAZI_CHART;
          break;
        case 'purpleStar':
          storageKey = ENHANCED_STORAGE_KEYS.PURPLE_STAR_CHART;
          break;
        case 'integrated':
          storageKey = ENHANCED_STORAGE_KEYS.INTEGRATED_ANALYSIS;
          break;
        default:
          throw new Error(`未知的圖表類型: ${chartType}`);
      }

      // 獲取存儲的數據
      const chartData = getFromStorage<ChartData>(storageKey);
      if (!chartData) return null;

      // 更新最後訪問時間
      if (chartData.metadata) {
        chartData.metadata.lastAccessed = Date.now();
        saveToStorage(storageKey, chartData);
      }

      // 如果數據被壓縮，則解壓縮
      const data = chartData.metadata?.compressed 
        ? this.decompressData(chartData.data) 
        : chartData.data;

      return data;
    } catch (error) {
      console.error(`獲取${chartType}圖表數據時發生錯誤:`, error);
      return null;
    }
  }

  /**
   * 清除圖表數據
   */
  public clearChartData(chartType?: 'bazi' | 'purpleStar' | 'integrated'): void {
    try {
      if (chartType) {
        // 清除特定類型的圖表數據
        switch (chartType) {
          case 'bazi':
            sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.BAZI_CHART);
            sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.BAZI_BIRTH_INFO);
            break;
          case 'purpleStar':
            sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.PURPLE_STAR_CHART);
            sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO);
            break;
          case 'integrated':
            sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.INTEGRATED_ANALYSIS);
            sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.INTEGRATED_BIRTH_INFO);
            break;
        }
      } else {
        // 清除所有圖表數據
        sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.BAZI_CHART);
        sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.BAZI_BIRTH_INFO);
        sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.PURPLE_STAR_CHART);
        sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO);
        sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.INTEGRATED_ANALYSIS);
        sessionStorage.removeItem(ENHANCED_STORAGE_KEYS.INTEGRATED_BIRTH_INFO);
      }

      // 更新存儲統計
      this.updateStorageStats();
    } catch (error) {
      console.error('清除圖表數據時發生錯誤:', error);
    }
  }

  /**
   * 保存出生資訊
   */
  public saveBirthInfo(chartType: 'bazi' | 'purpleStar' | 'integrated', birthInfo: any): boolean {
    try {
      // 決定存儲鍵
      let storageKey;
      switch (chartType) {
        case 'bazi':
          storageKey = ENHANCED_STORAGE_KEYS.BAZI_BIRTH_INFO;
          break;
        case 'purpleStar':
          storageKey = ENHANCED_STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO;
          break;
        case 'integrated':
          storageKey = ENHANCED_STORAGE_KEYS.INTEGRATED_BIRTH_INFO;
          break;
        default:
          throw new Error(`未知的圖表類型: ${chartType}`);
      }

      // 增加時間戳和版本信息
      const enhancedBirthInfo = {
        ...birthInfo,
        _timestamp: Date.now(),
        _version: CURRENT_STORAGE_VERSION
      };

      // 存儲數據
      saveToStorage(storageKey, enhancedBirthInfo);

      // 更新存儲統計
      this.updateStorageStats();

      return true;
    } catch (error) {
      console.error(`保存${chartType}出生資訊時發生錯誤:`, error);
      return false;
    }
  }

  /**
   * 獲取出生資訊
   */
  public getBirthInfo(chartType: 'bazi' | 'purpleStar' | 'integrated'): any | null {
    try {
      // 決定存儲鍵
      let storageKey;
      switch (chartType) {
        case 'bazi':
          storageKey = ENHANCED_STORAGE_KEYS.BAZI_BIRTH_INFO;
          break;
        case 'purpleStar':
          storageKey = ENHANCED_STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO;
          break;
        case 'integrated':
          storageKey = ENHANCED_STORAGE_KEYS.INTEGRATED_BIRTH_INFO;
          break;
        default:
          throw new Error(`未知的圖表類型: ${chartType}`);
      }

      return getFromStorage(storageKey);
    } catch (error) {
      console.error(`獲取${chartType}出生資訊時發生錯誤:`, error);
      return null;
    }
  }

  /**
   * 保存用戶偏好設定
   */
  public saveUserPreferences(prefs: UserPreferences): boolean {
    try {
      // 增加更新時間戳
      const enhancedPrefs: UserPreferences = {
        ...prefs,
        lastUpdated: Date.now()
      };

      // 保存時區信息
      if (prefs.timeZone) {
        saveToStorage(ENHANCED_STORAGE_KEYS.TIMEZONE_INFO, {
          timeZone: prefs.timeZone,
          timestamp: Date.now()
        });
      }

      // 保存所有偏好設定
      saveToStorage('peixuan_user_preferences', enhancedPrefs);

      // 更新存儲統計
      this.updateStorageStats();

      return true;
    } catch (error) {
      console.error('保存用戶偏好設定時發生錯誤:', error);
      return false;
    }
  }

  /**
   * 獲取用戶偏好設定
   */
  public getUserPreferences(): UserPreferences | null {
    return getFromStorage<UserPreferences>('peixuan_user_preferences');
  }

  /**
   * 驗證存儲中的數據
   */
  public validateStorageData(): boolean {
    try {
      let isValid = true;
      
      // 驗證各種圖表數據的完整性
      const chartTypes = ['bazi', 'purpleStar', 'integrated'] as const;
      
      for (const type of chartTypes) {
        const chartData = this.getChartData(type);
        const birthInfo = this.getBirthInfo(type);
        
        // 檢查圖表數據和出生資訊是否配對
        if ((chartData && !birthInfo) || (!chartData && birthInfo)) {
          console.warn(`${type}圖表數據和出生資訊不匹配`);
          isValid = false;
        }
      }
      
      // 記錄最後驗證時間
      saveToStorage(ENHANCED_STORAGE_KEYS.STORAGE_LAST_VALIDATED, Date.now());
      
      return isValid;
    } catch (error) {
      console.error('驗證存儲數據時發生錯誤:', error);
      return false;
    }
  }

  /**
   * 數據遷移
   */
  public migrateData(fromVersion: string, toVersion: string): boolean {
    try {
      console.log(`正在遷移存儲數據，從版本 ${fromVersion} 到 ${toVersion}`);
      
      // 在實際應用中，這裡應該包含各種版本間的遷移邏輯
      // 例如，如果從版本1.0.0遷移到2.0.0，可能需要調整數據結構
      
      // 這裡只是一個簡單的示例
      if (fromVersion < toVersion) {
        // 遷移圖表數據
        const chartTypes = ['bazi', 'purpleStar', 'integrated'] as const;
        
        for (const type of chartTypes) {
          // 獲取舊格式數據
          let dataKey, birthInfoKey;
          
          switch (type) {
            case 'bazi':
              dataKey = ENHANCED_STORAGE_KEYS.BAZI_CHART;
              birthInfoKey = ENHANCED_STORAGE_KEYS.BAZI_BIRTH_INFO;
              break;
            case 'purpleStar':
              dataKey = ENHANCED_STORAGE_KEYS.PURPLE_STAR_CHART;
              birthInfoKey = ENHANCED_STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO;
              break;
            case 'integrated':
              dataKey = ENHANCED_STORAGE_KEYS.INTEGRATED_ANALYSIS;
              birthInfoKey = ENHANCED_STORAGE_KEYS.INTEGRATED_BIRTH_INFO;
              break;
          }
          
          // 獲取舊數據
          const oldData = getFromStorage(dataKey);
          const oldBirthInfo = getFromStorage(birthInfoKey);
          
          if (oldData) {
            // 轉換為新格式
            const newChartData: ChartData = {
              timestamp: Date.now(),
              data: oldData,
              metadata: {
                version: toVersion,
                compressed: false,
                size: new Blob([JSON.stringify(oldData)]).size,
                lastAccessed: Date.now()
              }
            };
            
            // 保存新格式數據
            saveToStorage(dataKey, newChartData);
          }
          
          if (oldBirthInfo) {
            // 為舊的出生資訊添加版本信息
            const newBirthInfo = {
              ...oldBirthInfo,
              _timestamp: Date.now(),
              _version: toVersion
            };
            
            // 保存新格式數據
            saveToStorage(birthInfoKey, newBirthInfo);
          }
        }
      }
      
      // 設置新版本
      this.setStorageVersion(toVersion);
      
      return true;
    } catch (error) {
      console.error('遷移數據時發生錯誤:', error);
      return false;
    }
  }
}

// 創建默認實例
export const enhancedStorageService = new EnhancedStorageService();

export default enhancedStorageService;
