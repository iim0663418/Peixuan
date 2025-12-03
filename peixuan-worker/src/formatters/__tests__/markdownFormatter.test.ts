/**
 * Markdown Formatter Tests
 */

import { describe, it, expect } from 'vitest';
import { formatToMarkdown } from '../markdownFormatter';
import type { CalculationResult } from '../../calculation/types';

describe('Markdown Formatter', () => {
  const mockResult: CalculationResult = {
    input: {
      solarDate: new Date('2000-01-01T12:00:00Z'),
      longitude: 121.5,
      gender: 'male',
      isLeapMonth: false,
    },
    bazi: {
      fourPillars: {
        year: { stem: '庚', branch: '辰' },
        month: { stem: '戊', branch: '寅' },
        day: { stem: '甲', branch: '子' },
        hour: { stem: '庚', branch: '午' },
      },
      trueSolarTime: new Date('2000-01-01T11:45:30Z'),
      julianDay: 2451545.0,
      hiddenStems: {
        year: { primary: '戊', middle: '乙', residual: '癸' },
        month: { primary: '甲', middle: '丙', residual: '戊' },
        day: { primary: '癸' },
        hour: { primary: '丁', middle: '己' },
      },
      tenGods: {
        year: '七殺',
        month: '偏財',
        hour: '七殺',
      },
      calculationSteps: [],
      metadata: {
        algorithms: ['JulianDayMethod', 'TrueSolarTimeCorrection'],
        references: ['渊海子平', '三命通会'],
        methods: ['MonthPillarFromSolarTerms', 'DayPillarFromJulianDay'],
      },
    },
    ziwei: {
      lifePalace: { branch: '寅', position: 2 },
      bodyPalace: { branch: '申', position: 8 },
      bureau: 2,
      ziWeiPosition: 0,
      tianFuPosition: 6,
      auxiliaryStars: {
        wenChang: 3,
        wenQu: 9,
        zuoFu: 4,
        youBi: 10,
      },
      starSymmetry: [],
      calculationSteps: [],
      metadata: {
        algorithms: ['FiveElementsBureau', 'ZiWeiStarPosition'],
        references: ['紫微斗數全書'],
        methods: ['LifePalaceFromBirthTime', 'BureauFromNayin'],
      },
    },
    timestamp: new Date('2000-01-01T12:00:00Z'),
  };

  it('should generate markdown with header', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('# 命理分析結果');
  });

  it('should include basic information section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('## 📋 基本資訊');
    expect(markdown).toContain('出生日期');
    expect(markdown).toContain('性別');
    expect(markdown).toContain('經度');
    expect(markdown).toContain('真太陽時');
    expect(markdown).toContain('儒略日');
  });

  it('should include BaZi four pillars section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('## 🎋 八字四柱');
    expect(markdown).toContain('### 四柱');
    expect(markdown).toContain('| 柱位 | 天干 | 地支 |');
    expect(markdown).toContain('| 年柱 | 庚 | 辰 |');
    expect(markdown).toContain('| 月柱 | 戊 | 寅 |');
    expect(markdown).toContain('| 日柱 | 甲 | 子 |');
    expect(markdown).toContain('| 時柱 | 庚 | 午 |');
  });

  it('should include hidden stems section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('### 藏干');
    expect(markdown).toContain('**年柱藏干**');
    expect(markdown).toContain('主氣：戊');
    expect(markdown).toContain('中氣：乙');
    expect(markdown).toContain('餘氣：癸');
  });

  it('should include ten gods section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('### 十神關係');
    expect(markdown).toContain('年干（庚）→ 日主（甲）：**七殺**');
    expect(markdown).toContain('月干（戊）→ 日主（甲）：**偏財**');
    expect(markdown).toContain('時干（庚）→ 日主（甲）：**七殺**');
  });

  it('should include ZiWei section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('## 🌟 紫微斗數');
    expect(markdown).toContain('### 命盤基本資訊');
    expect(markdown).toContain('命宮');
    expect(markdown).toContain('身宮');
    expect(markdown).toContain('五行局');
  });

  it('should include main stars section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('### 主星分布');
    expect(markdown).toContain('紫微星');
    expect(markdown).toContain('天府星');
  });

  it('should include auxiliary stars section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('### 輔星分布');
    expect(markdown).toContain('文昌');
    expect(markdown).toContain('文曲');
    expect(markdown).toContain('左輔');
    expect(markdown).toContain('右弼');
  });

  it('should include metadata section', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('## 📚 元數據');
    expect(markdown).toContain('### 八字算法');
    expect(markdown).toContain('### 紫微斗數算法');
    expect(markdown).toContain('計算時間');
  });

  it('should handle fortune cycles when present', () => {
    const resultWithFortune: CalculationResult = {
      ...mockResult,
      bazi: {
        ...mockResult.bazi,
        fortuneCycles: {
          qiyunDate: new Date('2003-05-15'),
          direction: 'forward',
          dayunList: [
            {
              stem: '己',
              branch: '卯',
              startDate: new Date('2003-05-15'),
              endDate: new Date('2013-05-15'),
              startAge: 3,
              endAge: 13,
            },
          ],
          currentDayun: {
            stem: '己',
            branch: '卯',
            startDate: new Date('2003-05-15'),
            endDate: new Date('2013-05-15'),
            startAge: 3,
            endAge: 13,
          },
        },
      },
    };

    const markdown = formatToMarkdown(resultWithFortune);
    expect(markdown).toContain('## 🔄 大運流年');
    expect(markdown).toContain('### 起運資訊');
    expect(markdown).toContain('### 大運列表');
    expect(markdown).toContain('當前大運');
  });

  it('should handle annual fortune when present', () => {
    const resultWithAnnual: CalculationResult = {
      ...mockResult,
      annualFortune: {
        annualPillar: { stem: '甲', branch: '辰' },
        annualLifePalace: 2,
        interactions: {
          stemCombinations: [],
          branchClashes: [],
          harmoniousCombinations: [],
        },
        taiSuiAnalysis: {
          zhi: false,
          chong: false,
          xing: false,
          po: false,
          hai: false,
          severity: 'none',
          score: 0,
          types: [],
        },
      },
    };

    const markdown = formatToMarkdown(resultWithAnnual);
    expect(markdown).toContain('## 📅 流年分析');
    expect(markdown).toContain('### 流年年柱');
  });

  it('should use section separators', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toContain('---');
  });

  it('should format dates correctly', () => {
    const markdown = formatToMarkdown(mockResult);
    expect(markdown).toMatch(/\d{4}-\d{2}-\d{2}/); // ISO date format
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalResult: CalculationResult = {
      ...mockResult,
      bazi: {
        ...mockResult.bazi,
        fortuneCycles: undefined,
        wuxingDistribution: undefined,
      },
      annualFortune: undefined,
    };

    const markdown = formatToMarkdown(minimalResult);
    expect(markdown).toContain('# 命理分析結果');
    expect(markdown).not.toContain('## 🔄 大運流年');
    expect(markdown).not.toContain('## 📅 流年分析');
  });
});
