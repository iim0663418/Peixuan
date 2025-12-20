/**
 * Integration tests for Tai Sui Analysis
 */

import { describe, it, expect } from 'vitest';
import { analyzeTaiSui } from '../taiSuiAnalysis';
import type { Pillar } from '../../types';

describe('Tai Sui Analysis Integration', () => {
  // Helper to create test pillars
  const createPillar = (stem: string, branch: string): Pillar => ({
    stem: stem as any,
    branch: branch as any,
  });

  const createFourPillars = (
    year: [string, string],
    month: [string, string],
    day: [string, string],
    hour: [string, string]
  ) => ({
    year: createPillar(year[0], year[1]),
    month: createPillar(month[0], month[1]),
    day: createPillar(day[0], day[1]),
    hour: createPillar(hour[0], hour[1]),
  });

  describe('Single Tai Sui violation', () => {
    it('should detect Zhi Tai Sui only (本命年)', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['己', '巳'], // 年柱 - 屬蛇
        ['丙', '子'], // 月柱 - 改為子，避免與巳相刑
        ['甲', '子'],
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.zhi).toBe(true);
      expect(result.chong).toBe(false);
      expect(result.xing.hasXing).toBe(false);
      expect(result.po).toBe(false);
      expect(result.hai).toBe(false);
      expect(result.severity).toBe('medium'); // 值太歲 = 3分
      expect(result.types).toContain('值太歲');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should detect Chong Tai Sui only (沖太歲)', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['己', '亥'], // 年柱 - 屬豬，與巳沖
        ['丙', '子'], // 月柱 - 改為子，避免與巳相刑
        ['甲', '子'],
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.zhi).toBe(false);
      expect(result.chong).toBe(true);
      expect(result.severity).toBe('medium'); // 沖太歲 = 3分
      expect(result.types).toContain('沖太歲');
    });

    it('should detect Po Tai Sui only (破太歲)', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['壬', '申'], // 年柱 - 屬猴，與巳破
        ['丙', '子'], // 月柱 - 改為子，避免與巳相刑
        ['甲', '子'],
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.po).toBe(true);
      expect(result.severity).toBe('medium'); // 破太歲1分 + 刑太歲2分 = 3分
      expect(result.types).toContain('破太歲');
    });

    it('should detect Hai Tai Sui only (害太歲)', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['壬', '寅'], // 年柱 - 屬虎，與巳害
        ['丙', '子'],
        ['甲', '午'],
        ['庚', '申']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.hai).toBe(true);
      expect(result.severity).toBe('medium'); // 害太歲1分 + 刑太歲2分 = 3分
      expect(result.types).toContain('害太歲');
    });
  });

  describe('Multiple Tai Sui violations', () => {
    it('should detect Zhi + Xing (critical severity)', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['己', '巳'], // 值太歲
        ['壬', '申'], // 與巳形成三刑（寅巳申）
        ['甲', '寅'], // 與巳形成三刑
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.zhi).toBe(true);
      expect(result.xing.hasXing).toBe(true);
      expect(result.xing.xingType).toBe('san_xing');
      expect(result.severity).toBe('critical'); // 值太歲3分 + 刑太歲2分 + 其他可能的疊加
      expect(result.types.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect Chong + Po + Hai (critical severity)', () => {
      const annualPillar = createPillar('辛', '丑');
      const natalChart = createFourPillars(
        ['乙', '未'], // 與丑沖
        ['戊', '辰'], // 與丑破
        ['甲', '午'], // 與丑害
        ['庚', '申']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.chong).toBe(true);
      expect(result.po).toBe(true);
      expect(result.hai).toBe(true);
      expect(result.severity).toBe('critical'); // 沖3分 + 破1分 + 害1分 + 其他疊加 ≥7分
      expect(result.types.length).toBeGreaterThanOrEqual(3); // 沖+破+害，可能還有刑
    });
  });

  describe('No Tai Sui violation', () => {
    it('should return none severity when no violations', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['甲', '子'], // 無關係
        ['丙', '卯'],
        ['戊', '午'],
        ['庚', '酉']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.zhi).toBe(false);
      expect(result.chong).toBe(false);
      expect(result.xing.hasXing).toBe(false);
      expect(result.po).toBe(false);
      expect(result.hai).toBe(false);
      expect(result.severity).toBe('none');
      expect(result.types.length).toBe(0);
      expect(result.recommendations).toContain('本年度無犯太歲，運勢平穩');
    });
  });

  describe('Recommendations', () => {
    it('should provide specific recommendations for Zhi Tai Sui', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['己', '巳'],
        ['丙', '寅'],
        ['甲', '子'],
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.recommendations).toContain('本命年宜低調行事，避免重大變動');
    });

    it('should provide general recommendations for high severity', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['己', '巳'], // 值
        ['壬', '申'], // 刑
        ['甲', '寅'], // 刑
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.severity).toBe('critical'); // 值太歲 + 多重刑太歲疊加
      expect(result.recommendations).toContain('建議配戴護身符或吉祥物');
      expect(result.recommendations).toContain('可考慮捐血、洗牙等「見血」化解');
    });
  });

  describe('Real-world scenarios', () => {
    it('2025年乙巳年 - 屬蛇者本命年', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['己', '巳'], // 1989年己巳年生人
        ['丙', '寅'],
        ['甲', '子'],
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.zhi).toBe(true);
      expect(result.types).toContain('值太歲');
      expect(result.severity).not.toBe('none');
    });

    it('2025年乙巳年 - 屬豬者沖太歲', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['己', '亥'], // 1959/2019年己亥年生人
        ['丙', '寅'],
        ['甲', '子'],
        ['庚', '午']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.chong).toBe(true);
      expect(result.types).toContain('沖太歲');
    });

    it('2025年乙巳年 - 屬虎者害太歲', () => {
      const annualPillar = createPillar('乙', '巳');
      const natalChart = createFourPillars(
        ['壬', '寅'], // 1962/2022年壬寅年生人
        ['丙', '子'],
        ['甲', '午'],
        ['庚', '申']
      );

      const result = analyzeTaiSui(annualPillar, natalChart);

      expect(result.hai).toBe(true);
      expect(result.types).toContain('害太歲');
    });
  });
});
