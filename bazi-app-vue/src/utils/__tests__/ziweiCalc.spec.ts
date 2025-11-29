import { describe, it, expect, vi } from 'vitest';
import {
  calculateZiwei,
  determineMainStar,
  calculateFiveElementsBureau,
  calculatePalacePositions,
} from '../ziweiCalc';

// 模擬全局 Solar 和 Lunar 物件
global.Solar = {
  fromDate: vi.fn().mockReturnValue({
    getLunar: vi.fn().mockReturnValue({
      getYear: vi.fn().mockReturnValue(1990),
      getMonth: vi.fn().mockReturnValue(5),
      getDay: vi.fn().mockReturnValue(15),
      getHour: vi.fn().mockReturnValue(14),
      getYearGan: vi.fn().mockReturnValue('庚'),
      getYearZhi: vi.fn().mockReturnValue('午'),
      getMonthGan: vi.fn().mockReturnValue('丙'),
      getMonthZhi: vi.fn().mockReturnValue('午'),
      getDayGan: vi.fn().mockReturnValue('壬'),
      getDayZhi: vi.fn().mockReturnValue('戌'),
      getTimeGan: vi.fn().mockReturnValue('己'),
      getTimeZhi: vi.fn().mockReturnValue('未'),
    }),
  }),
};

describe('Ziwei Calculation', () => {
  // 測試五行局計算
  it('calculates correct five elements bureau', () => {
    const bureau = calculateFiveElementsBureau(1990, 5, 15);

    // 驗證五行局
    expect(bureau).toBeDefined();
    expect(typeof bureau).toBe('string');
    expect(['水二局', '木三局', '金四局', '土五局', '火六局']).toContain(
      bureau,
    );
  });

  // 測試宮位計算
  it('calculates correct palace positions', () => {
    const birthInfo = {
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      gender: 'male',
    };

    const palaces = calculatePalacePositions(birthInfo);

    // 驗證宮位數量
    expect(palaces).toHaveLength(12);

    // 驗證宮位結構
    palaces.forEach((palace) => {
      expect(palace).toHaveProperty('name');
      expect(palace).toHaveProperty('index');
      expect(palace).toHaveProperty('zhi');
    });

    // 驗證宮位名稱
    const palaceNames = palaces.map((p) => p.name);
    expect(palaceNames).toContain('命宮');
    expect(palaceNames).toContain('財帛宮');
    expect(palaceNames).toContain('官祿宮');
    expect(palaceNames).toContain('田宅宮');
  });

  // 測試主星計算
  it('determines correct main star position', () => {
    // 測試紫微星位置計算
    const ziweiPosition = determineMainStar('紫微', 1990, 5, 15);

    // 驗證紫微星位置
    expect(ziweiPosition).toBeGreaterThanOrEqual(0);
    expect(ziweiPosition).toBeLessThanOrEqual(11);

    // 測試天府星位置計算
    const tianfuPosition = determineMainStar('天府', 1990, 5, 15);

    // 驗證天府星位置
    expect(tianfuPosition).toBeGreaterThanOrEqual(0);
    expect(tianfuPosition).toBeLessThanOrEqual(11);
  });

  // 測試完整命盤計算
  it('calculates complete purple star chart', () => {
    const birthInfo = {
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      gender: 'male',
    };

    const chart = calculateZiwei(birthInfo);

    // 驗證命盤結構
    expect(chart).toHaveProperty('palaces');
    expect(chart).toHaveProperty('mingPalaceIndex');
    expect(chart).toHaveProperty('shenPalaceIndex');
    expect(chart).toHaveProperty('fiveElementsBureau');

    // 驗證宮位數量
    expect(chart.palaces).toHaveLength(12);

    // 驗證命宮和身宮索引
    expect(chart.mingPalaceIndex).toBeGreaterThanOrEqual(0);
    expect(chart.mingPalaceIndex).toBeLessThanOrEqual(11);
    expect(chart.shenPalaceIndex).toBeGreaterThanOrEqual(0);
    expect(chart.shenPalaceIndex).toBeLessThanOrEqual(11);

    // 驗證星曜分配
    let starCount = 0;
    chart.palaces.forEach((palace) => {
      expect(palace).toHaveProperty('stars');
      expect(Array.isArray(palace.stars)).toBe(true);
      starCount += palace.stars.length;
    });

    // 驗證至少有一些星曜
    expect(starCount).toBeGreaterThan(0);
  });
});
