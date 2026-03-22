/**
 * Tests for BaZi Hidden Stems Module
 */

import { describe, it, expect } from 'vitest';
import {
  getHiddenStems,
  getPrimaryHiddenStem,
  branchContainsStem,
  type HiddenStem
} from '../hiddenStems';

describe('BaZi Hidden Stems', () => {
  describe('getHiddenStems', () => {
    it('should return hidden stems for all 12 earthly branches', () => {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      branches.forEach(branch => {
        const hiddenStems = getHiddenStems(branch);
        expect(hiddenStems).toBeDefined();
        expect(Array.isArray(hiddenStems)).toBe(true);
        expect(hiddenStems.length).toBeGreaterThan(0);
      });
    });

    it('should have correct structure for each hidden stem', () => {
      const hiddenStems = getHiddenStems('寅');

      hiddenStems.forEach(hs => {
        expect(hs).toHaveProperty('stem');
        expect(hs).toHaveProperty('weight');
        expect(hs).toHaveProperty('days');
        expect(['primary', 'middle', 'residual']).toContain(hs.weight);
        expect(typeof hs.days).toBe('number');
        expect(hs.days).toBeGreaterThan(0);
      });
    });

    it('should return correct hidden stems for 子 (single stem)', () => {
      const result = getHiddenStems('子');
      expect(result).toEqual([
        { stem: '癸', weight: 'primary', days: 30 }
      ]);
    });

    it('should return correct hidden stems for 丑 (three stems)', () => {
      const result = getHiddenStems('丑');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ stem: '己', weight: 'primary', days: 9 });
      expect(result[1]).toEqual({ stem: '癸', weight: 'middle', days: 9 });
      expect(result[2]).toEqual({ stem: '辛', weight: 'residual', days: 12 });
    });

    it('should return correct hidden stems for 寅', () => {
      const result = getHiddenStems('寅');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ stem: '甲', weight: 'primary', days: 7 });
      expect(result[1]).toEqual({ stem: '丙', weight: 'middle', days: 7 });
      expect(result[2]).toEqual({ stem: '戊', weight: 'residual', days: 16 });
    });

    it('should return correct hidden stems for 卯 (single stem)', () => {
      const result = getHiddenStems('卯');
      expect(result).toEqual([
        { stem: '乙', weight: 'primary', days: 30 }
      ]);
    });

    it('should return correct hidden stems for 辰', () => {
      const result = getHiddenStems('辰');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ stem: '戊', weight: 'primary', days: 9 });
    });

    it('should return correct hidden stems for 巳', () => {
      const result = getHiddenStems('巳');
      expect(result[0]).toEqual({ stem: '丙', weight: 'primary', days: 7 });
    });

    it('should return correct hidden stems for 午', () => {
      const result = getHiddenStems('午');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ stem: '丁', weight: 'primary', days: 10 });
      expect(result[1]).toEqual({ stem: '己', weight: 'residual', days: 20 });
    });

    it('should return correct hidden stems for 未', () => {
      const result = getHiddenStems('未');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ stem: '己', weight: 'primary', days: 9 });
    });

    it('should return correct hidden stems for 申', () => {
      const result = getHiddenStems('申');
      expect(result[0]).toEqual({ stem: '庚', weight: 'primary', days: 7 });
    });

    it('should return correct hidden stems for 酉 (single stem)', () => {
      const result = getHiddenStems('酉');
      expect(result).toEqual([
        { stem: '辛', weight: 'primary', days: 30 }
      ]);
    });

    it('should return correct hidden stems for 戌', () => {
      const result = getHiddenStems('戌');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ stem: '戊', weight: 'primary', days: 9 });
    });

    it('should return correct hidden stems for 亥', () => {
      const result = getHiddenStems('亥');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ stem: '壬', weight: 'primary', days: 7 });
      expect(result[1]).toEqual({ stem: '甲', weight: 'residual', days: 23 });
    });

    it('should throw error for invalid branch', () => {
      expect(() => getHiddenStems('invalid')).toThrow('Invalid earthly branch');
    });
  });

  describe('getPrimaryHiddenStem', () => {
    it('should return primary stem for each branch', () => {
      const expectations: Record<string, string> = {
        子: '癸',
        丑: '己',
        寅: '甲',
        卯: '乙',
        辰: '戊',
        巳: '丙',
        午: '丁',
        未: '己',
        申: '庚',
        酉: '辛',
        戌: '戊',
        亥: '壬'
      };

      Object.entries(expectations).forEach(([branch, expectedStem]) => {
        expect(getPrimaryHiddenStem(branch)).toBe(expectedStem);
      });
    });
  });

  describe('branchContainsStem', () => {
    it('should correctly identify if branch contains stem', () => {
      expect(branchContainsStem('子', '癸')).toBe(true);
      expect(branchContainsStem('子', '甲')).toBe(false);
      expect(branchContainsStem('丑', '己')).toBe(true);
      expect(branchContainsStem('丑', '癸')).toBe(true);
      expect(branchContainsStem('丑', '辛')).toBe(true);
      expect(branchContainsStem('丑', '甲')).toBe(false);
      expect(branchContainsStem('寅', '甲')).toBe(true);
      expect(branchContainsStem('寅', '丙')).toBe(true);
      expect(branchContainsStem('寅', '戊')).toBe(true);
    });
  });

  describe('Weight model validation', () => {
    it('should have exactly one primary stem per branch', () => {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      branches.forEach(branch => {
        const hiddenStems = getHiddenStems(branch);
        const primaryCount = hiddenStems.filter(hs => hs.weight === 'primary').length;
        expect(primaryCount).toBe(1);
      });
    });

    it('should have days totaling approximately 30 for each branch', () => {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      branches.forEach(branch => {
        const hiddenStems = getHiddenStems(branch);
        const totalDays = hiddenStems.reduce((sum, hs) => sum + hs.days, 0);
        expect(totalDays).toBe(30);
      });
    });
  });
});
