/**
 * 五行關係模組測試 (WuXing Relations Module Tests)
 */

import { describe, it, expect } from 'vitest';
import {
  getWuXingRelation,
  stemToWuXing,
  branchToWuXing,
  type WuXing,
  type WuXingRelation,
} from '../src/calculation/core/wuXing';

describe('WuXing Relations', () => {
  describe('getWuXingRelation', () => {
    it('should return same for identical elements', () => {
      expect(getWuXingRelation('Wood', 'Wood')).toBe('same');
      expect(getWuXingRelation('Fire', 'Fire')).toBe('same');
      expect(getWuXingRelation('Earth', 'Earth')).toBe('same');
      expect(getWuXingRelation('Metal', 'Metal')).toBe('same');
      expect(getWuXingRelation('Water', 'Water')).toBe('same');
    });

    it('should return produce for generation cycle (我生)', () => {
      expect(getWuXingRelation('Wood', 'Fire')).toBe('produce');   // 木生火
      expect(getWuXingRelation('Fire', 'Earth')).toBe('produce');  // 火生土
      expect(getWuXingRelation('Earth', 'Metal')).toBe('produce'); // 土生金
      expect(getWuXingRelation('Metal', 'Water')).toBe('produce'); // 金生水
      expect(getWuXingRelation('Water', 'Wood')).toBe('produce');  // 水生木
    });

    it('should return overcome for control cycle (我克)', () => {
      expect(getWuXingRelation('Wood', 'Earth')).toBe('overcome');  // 木克土
      expect(getWuXingRelation('Fire', 'Metal')).toBe('overcome');  // 火克金
      expect(getWuXingRelation('Earth', 'Water')).toBe('overcome'); // 土克水
      expect(getWuXingRelation('Metal', 'Wood')).toBe('overcome');  // 金克木
      expect(getWuXingRelation('Water', 'Fire')).toBe('overcome');  // 水克火
    });

    it('should return produced for reverse generation cycle (生我)', () => {
      expect(getWuXingRelation('Wood', 'Water')).toBe('produced');  // 水生木
      expect(getWuXingRelation('Fire', 'Wood')).toBe('produced');   // 木生火
      expect(getWuXingRelation('Earth', 'Fire')).toBe('produced');  // 火生土
      expect(getWuXingRelation('Metal', 'Earth')).toBe('produced'); // 土生金
      expect(getWuXingRelation('Water', 'Metal')).toBe('produced'); // 金生水
    });

    it('should return overcomed for reverse control cycle (克我)', () => {
      expect(getWuXingRelation('Wood', 'Metal')).toBe('overcomed');  // 金克木
      expect(getWuXingRelation('Fire', 'Water')).toBe('overcomed');  // 水克火
      expect(getWuXingRelation('Earth', 'Wood')).toBe('overcomed');  // 木克土
      expect(getWuXingRelation('Metal', 'Fire')).toBe('overcomed');  // 火克金
      expect(getWuXingRelation('Water', 'Earth')).toBe('overcomed'); // 土克水
    });

    it('should validate complete 5x5 relation matrix', () => {
      const elements: WuXing[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
      const expectedMatrix: Record<WuXing, Record<WuXing, WuXingRelation>> = {
        Wood: {
          Wood: 'same',
          Fire: 'produce',
          Earth: 'overcome',
          Metal: 'overcomed',
          Water: 'produced',
        },
        Fire: {
          Wood: 'produced',
          Fire: 'same',
          Earth: 'produce',
          Metal: 'overcome',
          Water: 'overcomed',
        },
        Earth: {
          Wood: 'overcomed',
          Fire: 'produced',
          Earth: 'same',
          Metal: 'produce',
          Water: 'overcome',
        },
        Metal: {
          Wood: 'overcome',
          Fire: 'overcomed',
          Earth: 'produced',
          Metal: 'same',
          Water: 'produce',
        },
        Water: {
          Wood: 'produce',
          Fire: 'overcome',
          Earth: 'overcomed',
          Metal: 'produced',
          Water: 'same',
        },
      };

      elements.forEach((from) => {
        elements.forEach((to) => {
          const relation = getWuXingRelation(from, to);
          const expected = expectedMatrix[from][to];
          expect(relation).toBe(expected);
        });
      });
    });
  });

  describe('stemToWuXing', () => {
    it('should map Wood stems correctly', () => {
      expect(stemToWuXing('甲')).toBe('Wood');
      expect(stemToWuXing('乙')).toBe('Wood');
    });

    it('should map Fire stems correctly', () => {
      expect(stemToWuXing('丙')).toBe('Fire');
      expect(stemToWuXing('丁')).toBe('Fire');
    });

    it('should map Earth stems correctly', () => {
      expect(stemToWuXing('戊')).toBe('Earth');
      expect(stemToWuXing('己')).toBe('Earth');
    });

    it('should map Metal stems correctly', () => {
      expect(stemToWuXing('庚')).toBe('Metal');
      expect(stemToWuXing('辛')).toBe('Metal');
    });

    it('should map Water stems correctly', () => {
      expect(stemToWuXing('壬')).toBe('Water');
      expect(stemToWuXing('癸')).toBe('Water');
    });

    it('should throw error for invalid stem', () => {
      expect(() => stemToWuXing('invalid')).toThrow('Invalid stem: invalid');
    });

    it('should validate all 10 stems', () => {
      const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const expected: WuXing[] = [
        'Wood', 'Wood',
        'Fire', 'Fire',
        'Earth', 'Earth',
        'Metal', 'Metal',
        'Water', 'Water',
      ];

      stems.forEach((stem, index) => {
        expect(stemToWuXing(stem)).toBe(expected[index]);
      });
    });
  });

  describe('branchToWuXing', () => {
    it('should map Wood branches correctly', () => {
      expect(branchToWuXing('寅')).toBe('Wood');
      expect(branchToWuXing('卯')).toBe('Wood');
    });

    it('should map Fire branches correctly', () => {
      expect(branchToWuXing('巳')).toBe('Fire');
      expect(branchToWuXing('午')).toBe('Fire');
    });

    it('should map Earth branches correctly', () => {
      expect(branchToWuXing('辰')).toBe('Earth');
      expect(branchToWuXing('戌')).toBe('Earth');
      expect(branchToWuXing('丑')).toBe('Earth');
      expect(branchToWuXing('未')).toBe('Earth');
    });

    it('should map Metal branches correctly', () => {
      expect(branchToWuXing('申')).toBe('Metal');
      expect(branchToWuXing('酉')).toBe('Metal');
    });

    it('should map Water branches correctly', () => {
      expect(branchToWuXing('亥')).toBe('Water');
      expect(branchToWuXing('子')).toBe('Water');
    });

    it('should throw error for invalid branch', () => {
      expect(() => branchToWuXing('invalid')).toThrow('Invalid branch: invalid');
    });

    it('should validate all 12 branches', () => {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const expected: WuXing[] = [
        'Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire',
        'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water',
      ];

      branches.forEach((branch, index) => {
        expect(branchToWuXing(branch)).toBe(expected[index]);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should correctly relate stems via WuXing', () => {
      // 甲木 生 丙火
      expect(getWuXingRelation(stemToWuXing('甲'), stemToWuXing('丙'))).toBe('produce');

      // 丙火 克 庚金
      expect(getWuXingRelation(stemToWuXing('丙'), stemToWuXing('庚'))).toBe('overcome');

      // 壬水 生 甲木
      expect(getWuXingRelation(stemToWuXing('壬'), stemToWuXing('甲'))).toBe('produce');
    });

    it('should correctly relate branches via WuXing', () => {
      // 寅木 克 辰土
      expect(getWuXingRelation(branchToWuXing('寅'), branchToWuXing('辰'))).toBe('overcome');

      // 午火 生 戌土
      expect(getWuXingRelation(branchToWuXing('午'), branchToWuXing('戌'))).toBe('produce');

      // 子水 克 午火
      expect(getWuXingRelation(branchToWuXing('子'), branchToWuXing('午'))).toBe('overcome');
    });
  });
});
