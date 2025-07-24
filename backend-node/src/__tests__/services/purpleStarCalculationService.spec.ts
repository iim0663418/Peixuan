import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PurpleStarCalculationService } from '../../services/purpleStarCalculationService';
import { BirthInfo } from '../../types/purpleStarTypes';

// 模擬 Lunar 物件
const mockLunar = {
  getYear: jest.fn().mockReturnValue(1990),
  getMonth: jest.fn().mockReturnValue(5),
  getDay: jest.fn().mockReturnValue(15),
  getHour: jest.fn().mockReturnValue(14),
  getYearGan: jest.fn().mockReturnValue('庚'),
  getYearZhi: jest.fn().mockReturnValue('午'),
  getMonthGan: jest.fn().mockReturnValue('丙'),
  getMonthZhi: jest.fn().mockReturnValue('午'),
  getDayGan: jest.fn().mockReturnValue('壬'),
  getDayZhi: jest.fn().mockReturnValue('戌'),
  getTimeGan: jest.fn().mockReturnValue('己'),
  getTimeZhi: jest.fn().mockReturnValue('未')
};

// 模擬 Solar 物件
global.Solar = {
  fromDate: jest.fn().mockReturnValue({
    getLunar: jest.fn().mockReturnValue(mockLunar)
  })
};

describe('PurpleStarCalculationService', () => {
  let service: PurpleStarCalculationService;
  let birthInfo: BirthInfo;

  beforeEach(() => {
    birthInfo = {
      solarDate: new Date('1990-05-15T14:30:00'),
      gender: 'male'
    };
    service = new PurpleStarCalculationService(birthInfo);
  });

  // 測試五行局計算
  it('calculates five elements bureau correctly', async () => {
    const bureau = await service.calculateFiveElementsBureau();
    
    // 驗證五行局
    expect(bureau).toBeDefined();
    expect(typeof bureau).toBe('string');
    expect(['水二局', '木三局', '金四局', '土五局', '火六局']).toContain(bureau);
  });

  // 測試命宮計算
  it('calculates ming palace index correctly', async () => {
    const mingPalaceIndex = await service.calculateMingPalace();
    
    // 驗證命宮索引
    expect(mingPalaceIndex).toBeGreaterThanOrEqual(0);
    expect(mingPalaceIndex).toBeLessThanOrEqual(11);
  });

  // 測試身宮計算
  it('calculates shen palace index correctly', async () => {
    const shenPalaceIndex = await service.calculateShenPalace();
    
    // 驗證身宮索引
    expect(shenPalaceIndex).toBeGreaterThanOrEqual(0);
    expect(shenPalaceIndex).toBeLessThanOrEqual(11);
  });

  // 測試宮位計算
  it('calculates palace positions correctly', async () => {
    const palaces = await service.calculatePalaces();
    
    // 驗證宮位數量
    expect(palaces).toHaveLength(12);
    
    // 驗證宮位結構
    palaces.forEach(palace => {
      expect(palace).toHaveProperty('name');
      expect(palace).toHaveProperty('index');
      expect(palace).toHaveProperty('zhi');
    });
  });

  // 測試完整命盤計算
  it('calculates complete chart correctly', async () => {
    const options = {
      includeMajorCycles: true,
      includeMinorCycles: true,
      includeAnnualCycles: true,
      detailLevel: 'basic',
      maxAge: 100
    };
    
    const chart = await service.calculateChart(options);
    
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
  });
});
