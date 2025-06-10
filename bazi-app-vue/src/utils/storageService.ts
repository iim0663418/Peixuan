// storageService.ts

// import type { FormState } from '../components/UserInputForm.vue'; // 移除此導入
import type { BaziResult, TenGodsPillars, ElementsDistribution, StartLuckInfo } from './baziCalc';

// 重新定義或導入 FormState，因為它在組件內部，可能無法直接導入
// 為了簡化，這裡假設 UserInputForm 的 formState 結構
interface StoredFormState {
  calendarType: 'solar' | 'lunar';
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  minute: number | null;
  gender: 'male' | 'female';
  timezone: string;
  isLeapMonth: boolean;
}

export interface QueryRecord {
  id: string; // UUID
  userId: string | null;
  timestamp: number;
  inputData: StoredFormState; // 使用上面定義的 StoredFormState
  baziResult: BaziResult | null;
  tenGods?: TenGodsPillars | null;
  elementsDistribution?: ElementsDistribution | null;
  startLuckInfo?: StartLuckInfo | null;
  // 未來可以添加標籤或筆記
  // tags?: string[];
  // notes?: string;
}

const QUERY_HISTORY_KEY = 'baziQueryHistory';

export class LocalStorageService {
  /**
   * 保存一條查詢紀錄
   * @param record 要保存的查詢紀錄
   */
  public static saveQueryRecord(record: Omit<QueryRecord, 'id' | 'timestamp'>): QueryRecord | null {
    try {
      const newRecord: QueryRecord = {
        ...record,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const records = this.getQueryRecords();
      records.unshift(newRecord); // 將新紀錄添加到最前面
      localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(records));
      console.log('查詢紀錄已保存:', newRecord);
      return newRecord;
    } catch (error) {
      console.error('保存查詢紀錄失敗:', error);
      return null;
    }
  }

  /**
   * 獲取所有查詢紀錄
   * @returns 查詢紀錄陣列，如果沒有則返回空陣列
   */
  public static getQueryRecords(): QueryRecord[] {
    try {
      const savedData = localStorage.getItem(QUERY_HISTORY_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error('獲取查詢紀錄失敗:', error);
      return [];
    }
  }

  /**
   * 根據 ID 刪除一條查詢紀錄
   * @param recordId 要刪除的紀錄 ID
   */
  public static deleteQueryRecord(recordId: string): boolean {
    try {
      let records = this.getQueryRecords();
      records = records.filter(record => record.id !== recordId);
      localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(records));
      console.log(`查詢紀錄 ${recordId} 已刪除。`);
      return true;
    } catch (error) {
      console.error(`刪除查詢紀錄 ${recordId} 失敗:`, error);
      return false;
    }
  }
  
  /**
   * 清除所有查詢紀錄
   */
  public static clearAllQueryRecords(): boolean {
    try {
      localStorage.removeItem(QUERY_HISTORY_KEY);
      console.log('所有查詢紀錄已清除。');
      return true;
    } catch (error) {
      console.error('清除所有查詢紀錄失敗:', error);
      return false;
    }
  }
}
