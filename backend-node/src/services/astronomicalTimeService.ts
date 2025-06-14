// backend-node/src/services/astronomicalTimeService.ts
// 高精度天文時間轉換模組

import { LunarInfo } from '../types/purpleStarTypes';

// 地球軌道參數常量
const EARTH_ORBITAL_ECCENTRICITY = 0.0167; // 地球軌道偏心率
const OBLIQUITY_OF_ECLIPTIC = 23.44 * Math.PI / 180; // 黃道傾角（弧度）

/**
 * 高精度天文時間轉換服務
 * 處理公曆/農曆轉換、時區轉換、真太陽時調整和經度校正
 */
export class AstronomicalTimeService {
  /**
   * 根據經度計算真太陽時的時差（分鐘）
   * @param longitude 經度（度，東經為正，西經為負）
   * @param date 日期物件
   * @returns 時差（分鐘）
   */
  public calculateTrueSolarTimeOffset(longitude: number, date: Date): number {
    // 1. 經度時差（每15度對應1小時）
    const longitudeOffset = (longitude / 15) * 60; // 轉換為分鐘
    
    // 2. 計算均時差（EOT: Equation of Time）
    const eot = this.calculateEquationOfTime(date);
    
    // 總時差（分鐘）
    return longitudeOffset + eot;
  }
  
  /**
   * 計算均時差（Equation of Time）
   * 考慮地球軌道偏心率和黃道傾角的影響
   * @param date 日期物件
   * @returns 均時差（分鐘）
   */
  private calculateEquationOfTime(date: Date): number {
    // 一年中的天數（0-365）
    const dayOfYear = this.getDayOfYear(date);
    
    // 將天數轉換為弧度（2π對應一年）
    const angle = 2 * Math.PI * dayOfYear / 365;
    
    // 均時差計算（Equation of Time）
    // 考慮軌道偏心率影響和黃道傾角影響
    const eot = 
      -7.659 * Math.sin(angle) +
      -9.863 * Math.sin(2 * angle + 3.5932) +
       0.415 * Math.sin(3 * angle + 0.9151) +
       0.167 * Math.sin(4 * angle + 1.8291);
    
    return eot; // 返回均時差（分鐘）
  }
  
  /**
   * 計算一年中的天數（0-365）
   * @param date 日期物件
   * @returns 天數
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
  
  /**
   * 根據公曆日期和經度調整時間
   * @param solarDate 公曆日期
   * @param longitude 經度
   * @param timezone 時區字符串（如 'Asia/Taipei'）
   * @returns 調整後的日期物件
   */
  public adjustTimeByLongitude(solarDate: Date, longitude: number, timezone?: string): Date {
    // 創建日期的副本
    const adjustedDate = new Date(solarDate.getTime());
    
    // 計算真太陽時偏移（分鐘）
    const offset = this.calculateTrueSolarTimeOffset(longitude, solarDate);
    
    // 調整時間
    adjustedDate.setMinutes(adjustedDate.getMinutes() + offset);
    
    return adjustedDate;
  }
  
  /**
   * 將時間轉換為時辰
   * @param hour 小時（0-23）
   * @param minute 分鐘（0-59）
   * @returns 時辰字符串（子、丑、寅等）
   */
  public hourToChineseHour(hour: number, minute: number = 0): string {
    // 調整午夜問題：凌晨0點應該屬於子時（23:00-1:00）
    if (hour === 0 && minute < 60) {
      hour = 24;
    }
    
    // 計算對應時辰索引
    const zhiIndex = Math.floor((hour + 1) / 2) % 12;
    
    // 時辰名稱
    const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    return ZHI_NAMES[zhiIndex];
  }
  
  /**
   * 將IANA時區標識符轉換為UTC偏移分鐘
   * @param timezone 時區標識符（如 'Asia/Taipei'）
   * @param date 日期（用於處理夏令時）
   * @returns UTC偏移分鐘
   */
  public getTimezoneOffset(timezone: string, date: Date): number {
    try {
      // 使用Intl.DateTimeFormat獲取時區偏移
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        timeStyle: 'long'
      });
      
      // 格式化日期，提取時區資訊
      const formattedDate = formatter.format(date);
      
      // 解析時區偏移（格式如 GMT+8）
      const timeZonePart = formattedDate.split(' ').pop() || '';
      const match = timeZonePart.match(/GMT([+-])(\d+)(?::(\d+))?/);
      
      if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const hours = parseInt(match[2] || '0', 10);
        const minutes = parseInt(match[3] || '0', 10);
        
        return sign * (hours * 60 + minutes);
      }
      
      // 如果無法解析時區格式，拋出錯誤而非使用預設值
      throw new Error(`無法解析時區格式 "${timezone}"，請提供有效的時區標識符（如：Asia/Taipei, UTC+08:00）`);
    } catch (error) {
      console.error(`Error getting timezone offset for ${timezone}:`, error);
      // 拋出錯誤而非使用當地時區作為後備
      throw new Error(`時區計算失敗："${timezone}"。請確認時區格式正確，精確計算需要正確的時區資訊`);
    }
  }
  
  /**
   * 獲取特定位置和時間的真太陽時
   * @param date 日期時間
   * @param longitude 經度
   * @param timezone 時區（可選）
   * @returns 調整後的真太陽時日期物件
   */
  public getTrueSolarTime(date: Date, longitude: number, timezone?: string): Date {
    // 創建日期的副本
    const trueSolarTime = new Date(date.getTime());
    
    // 1. 應用時區修正（如果提供）
    if (timezone) {
      const timezoneOffsetMinutes = this.getTimezoneOffset(timezone, date);
      const localOffsetMinutes = -date.getTimezoneOffset();
      const adjustmentMinutes = timezoneOffsetMinutes - localOffsetMinutes;
      
      trueSolarTime.setMinutes(trueSolarTime.getMinutes() + adjustmentMinutes);
    }
    
    // 2. 應用經度和均時差修正
    const solarTimeOffset = this.calculateTrueSolarTimeOffset(longitude, date);
    trueSolarTime.setMinutes(trueSolarTime.getMinutes() + solarTimeOffset);
    
    return trueSolarTime;
  }
  
  /**
   * 通過農曆資訊計算命宮索引，使用精確時間
   * @param lunarInfo 農曆資訊
   * @param longitude 出生地經度
   * @param timezone 時區
   * @param birthTime 出生時間（Date物件）
   * @returns 命宮標準索引
   */
  public calculatePreciseMingPalaceIndex(
    lunarInfo: LunarInfo, 
    longitude: number, 
    timezone: string | undefined,
    birthTime: Date
  ): number {
    // 獲取真太陽時
    const trueSolarTime = this.getTrueSolarTime(birthTime, longitude, timezone);
    
    // 使用精確的真太陽時計算時辰
    const hour = trueSolarTime.getHours();
    const minute = trueSolarTime.getMinutes();
    const chineseHour = this.hourToChineseHour(hour, minute);
    
    // 根據真太陽時重新計算時辰索引
    const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const chineseHourZhiIndex = ZHI_NAMES.indexOf(chineseHour);
    
    if (chineseHourZhiIndex === -1) {
      throw new Error(`無法識別的時辰: ${chineseHour}`);
    }
    
    // 寅宮標準索引
    const YIN_PALACE_STD_INDEX = 2;
    const lunarMonth = lunarInfo.month;
    
    // 計算命宮索引
    let mingPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) - chineseHourZhiIndex);
    mingPalaceStdIndex = (mingPalaceStdIndex % 12 + 12) % 12;
    
    return mingPalaceStdIndex;
  }
  
  /**
   * 處理國際日期變更線問題
   * @param longitude 經度
   * @param date 日期時間
   * @returns 可能修正的日期（考慮日期變更線）
   */
  public handleDateLine(longitude: number, date: Date): Date {
    const result = new Date(date.getTime());
    
    // 國際日期變更線附近的特殊處理
    if (longitude > 170 || longitude < -170) {
      // 計算經度對應的時差（小時）
      const hoursDiff = longitude / 15;
      
      // 如果時差超過12小時（接近日期變更線），根據東西半球調整日期
      if (Math.abs(hoursDiff) > 11) {
        if (longitude > 0) { // 東經，日期可能需要前進
          result.setDate(result.getDate() + 1);
        } else { // 西經，日期可能需要後退
          result.setDate(result.getDate() - 1);
        }
      }
    }
    
    return result;
  }
  
  /**
   * 檢測並處理夏令時
   * @param date 日期時間
   * @param timezone 時區
   * @returns 是否在夏令時期間
   */
  public isDaylightSavingTime(date: Date, timezone: string): boolean {
    try {
      // 取得兩個時間點：一個在冬季，一個在夏季
      const winterDate = new Date(date.getFullYear(), 0, 1); // 1月1日
      const summerDate = new Date(date.getFullYear(), 6, 1); // 7月1日
      
      // 獲取這兩個時間點在指定時區的偏移
      const winterOffset = this.getTimezoneOffset(timezone, winterDate);
      const summerOffset = this.getTimezoneOffset(timezone, summerDate);
      
      // 獲取當前日期在指定時區的偏移
      const currentOffset = this.getTimezoneOffset(timezone, date);
      
      // 如果有夏令時，冬季和夏季的偏移會不同
      const hasDST = winterOffset !== summerOffset;
      
      // 如果沒有夏令時，直接返回false
      if (!hasDST) return false;
      
      // 判斷當前是否在夏令時
      return currentOffset === Math.max(winterOffset, summerOffset);
    } catch (error) {
      console.warn(`Error detecting DST for ${timezone}:`, error);
      return false;
    }
  }
}
