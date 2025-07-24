import { describe, it, expect } from 'vitest';
import { 
  BaziCalculator, 
  TenGodsCalculator, 
  FiveElementsAnalyzer,
  FortuneCycleCalculator
} from '../baziCalc';

describe('BaziCalculator', () => {
  // 測試基本八字計算
  it('calculates correct pillars for known birth date', () => {
    // 測試案例：1990年5月15日 14:30
    const result = BaziCalculator.calculateBazi({
      solarDate: new Date('1990-05-15T14:30:00')
    });
    
    // 驗證四柱
    expect(result.yearPillar).toBe('庚午');
    expect(result.monthPillar).toBe('丙午');
    expect(result.dayPillar).toBe('壬戌');
    expect(result.hourPillar).toBe('己未');
  });
  
  // 測試八字納音
  it('calculates correct hidden elements', () => {
    const result = BaziCalculator.calculateBazi({
      solarDate: new Date('1990-05-15T14:30:00')
    });
    
    // 驗證納音
    expect(result.yearHiddenElement).toBe('路旁土');
    expect(result.monthHiddenElement).toBe('天上火');
    expect(result.dayHiddenElement).toBe('山頭火');
    expect(result.hourHiddenElement).toBe('天河水');
  });
  
  // 測試天干地支分解
  it('correctly separates stems and branches', () => {
    const result = BaziCalculator.calculateBazi({
      solarDate: new Date('1990-05-15T14:30:00')
    });
    
    // 驗證天干
    expect(result.yearStem).toBe('庚');
    expect(result.monthStem).toBe('丙');
    expect(result.dayStem).toBe('壬');
    expect(result.hourStem).toBe('己');
    
    // 驗證地支
    expect(result.yearBranch).toBe('午');
    expect(result.monthBranch).toBe('午');
    expect(result.dayBranch).toBe('戌');
    expect(result.hourBranch).toBe('未');
  });
});

describe('TenGodsCalculator', () => {
  it('calculates correct ten gods for day master', () => {
    // 測試案例：日主為壬水
    const baziResult = {
      dayStem: '壬',
      yearStem: '庚',
      monthStem: '丙',
      hourStem: '己'
    };
    
    const tenGods = TenGodsCalculator.getMainStemTenGods(baziResult);
    
    // 驗證十神
    expect(tenGods.yearTenGod).toBe('偏財'); // 庚金生壬水，為偏財
    expect(tenGods.monthTenGod).toBe('正官'); // 丙火克壬水，為正官
    expect(tenGods.hourTenGod).toBe('正財'); // 己土生壬水，為正財
  });
});

describe('FiveElementsAnalyzer', () => {
  it('calculates correct elements distribution', () => {
    // 測試案例：1990年5月15日 14:30
    const baziResult = BaziCalculator.calculateBazi({
      solarDate: new Date('1990-05-15T14:30:00')
    });
    
    const distribution = FiveElementsAnalyzer.calculateElementsDistribution(baziResult);
    
    // 驗證五行分佈
    expect(distribution.metal).toBeGreaterThan(0); // 有金
    expect(distribution.water).toBeGreaterThan(0); // 有水
    expect(distribution.wood).toBe(0); // 無木
    expect(distribution.fire).toBeGreaterThan(0); // 有火
    expect(distribution.earth).toBeGreaterThan(0); // 有土
    
    // 驗證總和為100%
    const total = distribution.metal + distribution.water + 
                  distribution.wood + distribution.fire + distribution.earth;
    expect(Math.round(total)).toBe(100);
  });
});

describe('FortuneCycleCalculator', () => {
  it('calculates correct start luck age', () => {
    // 模擬農曆日期物件
    const mockLunar = {
      getYearGan: () => '庚',
      getYearZhi: () => '午',
      getMonthGan: () => '丙',
      getMonthZhi: () => '午',
      getDayGan: () => '壬',
      getDayZhi: () => '戌',
      getTimeGan: () => '己',
      getTimeZhi: () => '未',
      getMonth: () => 4, // 農曆5月
      getDay: () => 22, // 農曆22日
      getSolar: () => ({
        toYmd: () => '1990-05-15'
      })
    };
    
    // 測試男性起運
    const maleStartLuck = FortuneCycleCalculator.calculateStartLuck(mockLunar, 0);
    expect(maleStartLuck.startAge).toBeGreaterThan(0);
    expect(maleStartLuck.startYear).toBeGreaterThan(1990);
    
    // 測試女性起運
    const femaleStartLuck = FortuneCycleCalculator.calculateStartLuck(mockLunar, 1);
    expect(femaleStartLuck.startAge).toBeGreaterThan(0);
    expect(femaleStartLuck.startYear).toBeGreaterThan(1990);
  });
  
  it('calculates correct decennial cycles', () => {
    // 測試案例：1990年5月15日 14:30，男性
    const baziResult = BaziCalculator.calculateBazi({
      solarDate: new Date('1990-05-15T14:30:00')
    });
    
    const cycles = FortuneCycleCalculator.calculateDecennialCycles(
      baziResult,
      new Date('1990-05-15T14:30:00'),
      0, // 男性
      3 // 計算3個大運
    );
    
    // 驗證大運數量
    expect(cycles.length).toBe(3);
    
    // 驗證大運結構
    cycles.forEach(cycle => {
      expect(cycle).toHaveProperty('index');
      expect(cycle).toHaveProperty('stem');
      expect(cycle).toHaveProperty('branch');
      expect(cycle).toHaveProperty('startAge');
      expect(cycle).toHaveProperty('endAge');
      expect(cycle).toHaveProperty('startYear');
      expect(cycle).toHaveProperty('endYear');
    });
    
    // 驗證大運順序
    expect(cycles[0].startAge).toBeLessThan(cycles[1].startAge);
    expect(cycles[1].startAge).toBeLessThan(cycles[2].startAge);
  });
});