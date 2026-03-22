/**
 * Tests for BaZi Ten Gods Module
 */

import { describe, it, expect } from 'vitest';
import { calculateTenGod, getAllTenGods, type TenGod } from '../tenGods';

describe('BaZi Ten Gods', () => {
  const allStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  describe('calculateTenGod', () => {
    it('should throw error for invalid stems', () => {
      expect(() => calculateTenGod('invalid', '甲')).toThrow('Invalid stem');
      expect(() => calculateTenGod('甲', 'invalid')).toThrow('Invalid stem');
    });

    describe('Same element relationships', () => {
      it('should return 比肩 for same stem', () => {
        allStems.forEach(stem => {
          expect(calculateTenGod(stem, stem)).toBe('比肩');
        });
      });

      it('should return 劫財 for opposite polarity same element', () => {
        expect(calculateTenGod('甲', '乙')).toBe('劫財');
        expect(calculateTenGod('乙', '甲')).toBe('劫財');
        expect(calculateTenGod('丙', '丁')).toBe('劫財');
        expect(calculateTenGod('丁', '丙')).toBe('劫財');
        expect(calculateTenGod('戊', '己')).toBe('劫財');
        expect(calculateTenGod('己', '戊')).toBe('劫財');
        expect(calculateTenGod('庚', '辛')).toBe('劫財');
        expect(calculateTenGod('辛', '庚')).toBe('劫財');
        expect(calculateTenGod('壬', '癸')).toBe('劫財');
        expect(calculateTenGod('癸', '壬')).toBe('劫財');
      });
    });

    describe('Output relationships (I produce)', () => {
      it('should return 食神 for same polarity output', () => {
        // Wood produces Fire
        expect(calculateTenGod('甲', '丙')).toBe('食神');
        expect(calculateTenGod('乙', '丁')).toBe('食神');
        // Fire produces Earth
        expect(calculateTenGod('丙', '戊')).toBe('食神');
        expect(calculateTenGod('丁', '己')).toBe('食神');
        // Earth produces Metal
        expect(calculateTenGod('戊', '庚')).toBe('食神');
        expect(calculateTenGod('己', '辛')).toBe('食神');
        // Metal produces Water
        expect(calculateTenGod('庚', '壬')).toBe('食神');
        expect(calculateTenGod('辛', '癸')).toBe('食神');
        // Water produces Wood
        expect(calculateTenGod('壬', '甲')).toBe('食神');
        expect(calculateTenGod('癸', '乙')).toBe('食神');
      });

      it('should return 傷官 for opposite polarity output', () => {
        // Wood produces Fire
        expect(calculateTenGod('甲', '丁')).toBe('傷官');
        expect(calculateTenGod('乙', '丙')).toBe('傷官');
        // Fire produces Earth
        expect(calculateTenGod('丙', '己')).toBe('傷官');
        expect(calculateTenGod('丁', '戊')).toBe('傷官');
        // Earth produces Metal
        expect(calculateTenGod('戊', '辛')).toBe('傷官');
        expect(calculateTenGod('己', '庚')).toBe('傷官');
        // Metal produces Water
        expect(calculateTenGod('庚', '癸')).toBe('傷官');
        expect(calculateTenGod('辛', '壬')).toBe('傷官');
        // Water produces Wood
        expect(calculateTenGod('壬', '乙')).toBe('傷官');
        expect(calculateTenGod('癸', '甲')).toBe('傷官');
      });
    });

    describe('Wealth relationships (I control)', () => {
      it('should return 偏財 for same polarity wealth', () => {
        // Wood controls Earth
        expect(calculateTenGod('甲', '戊')).toBe('偏財');
        expect(calculateTenGod('乙', '己')).toBe('偏財');
        // Fire controls Metal
        expect(calculateTenGod('丙', '庚')).toBe('偏財');
        expect(calculateTenGod('丁', '辛')).toBe('偏財');
        // Earth controls Water
        expect(calculateTenGod('戊', '壬')).toBe('偏財');
        expect(calculateTenGod('己', '癸')).toBe('偏財');
        // Metal controls Wood
        expect(calculateTenGod('庚', '甲')).toBe('偏財');
        expect(calculateTenGod('辛', '乙')).toBe('偏財');
        // Water controls Fire
        expect(calculateTenGod('壬', '丙')).toBe('偏財');
        expect(calculateTenGod('癸', '丁')).toBe('偏財');
      });

      it('should return 正財 for opposite polarity wealth', () => {
        // Wood controls Earth
        expect(calculateTenGod('甲', '己')).toBe('正財');
        expect(calculateTenGod('乙', '戊')).toBe('正財');
        // Fire controls Metal
        expect(calculateTenGod('丙', '辛')).toBe('正財');
        expect(calculateTenGod('丁', '庚')).toBe('正財');
        // Earth controls Water
        expect(calculateTenGod('戊', '癸')).toBe('正財');
        expect(calculateTenGod('己', '壬')).toBe('正財');
        // Metal controls Wood
        expect(calculateTenGod('庚', '乙')).toBe('正財');
        expect(calculateTenGod('辛', '甲')).toBe('正財');
        // Water controls Fire
        expect(calculateTenGod('壬', '丁')).toBe('正財');
        expect(calculateTenGod('癸', '丙')).toBe('正財');
      });
    });

    describe('Authority relationships (Controls me)', () => {
      it('should return 七殺 for same polarity authority', () => {
        // Metal controls Wood
        expect(calculateTenGod('甲', '庚')).toBe('七殺');
        expect(calculateTenGod('乙', '辛')).toBe('七殺');
        // Water controls Fire
        expect(calculateTenGod('丙', '壬')).toBe('七殺');
        expect(calculateTenGod('丁', '癸')).toBe('七殺');
        // Wood controls Earth
        expect(calculateTenGod('戊', '甲')).toBe('七殺');
        expect(calculateTenGod('己', '乙')).toBe('七殺');
        // Fire controls Metal
        expect(calculateTenGod('庚', '丙')).toBe('七殺');
        expect(calculateTenGod('辛', '丁')).toBe('七殺');
        // Earth controls Water
        expect(calculateTenGod('壬', '戊')).toBe('七殺');
        expect(calculateTenGod('癸', '己')).toBe('七殺');
      });

      it('should return 正官 for opposite polarity authority', () => {
        // Metal controls Wood
        expect(calculateTenGod('甲', '辛')).toBe('正官');
        expect(calculateTenGod('乙', '庚')).toBe('正官');
        // Water controls Fire
        expect(calculateTenGod('丙', '癸')).toBe('正官');
        expect(calculateTenGod('丁', '壬')).toBe('正官');
        // Wood controls Earth
        expect(calculateTenGod('戊', '乙')).toBe('正官');
        expect(calculateTenGod('己', '甲')).toBe('正官');
        // Fire controls Metal
        expect(calculateTenGod('庚', '丁')).toBe('正官');
        expect(calculateTenGod('辛', '丙')).toBe('正官');
        // Earth controls Water
        expect(calculateTenGod('壬', '己')).toBe('正官');
        expect(calculateTenGod('癸', '戊')).toBe('正官');
      });
    });

    describe('Resource relationships (Produces me)', () => {
      it('should return 偏印 for same polarity resource', () => {
        // Water produces Wood
        expect(calculateTenGod('甲', '壬')).toBe('偏印');
        expect(calculateTenGod('乙', '癸')).toBe('偏印');
        // Wood produces Fire
        expect(calculateTenGod('丙', '甲')).toBe('偏印');
        expect(calculateTenGod('丁', '乙')).toBe('偏印');
        // Fire produces Earth
        expect(calculateTenGod('戊', '丙')).toBe('偏印');
        expect(calculateTenGod('己', '丁')).toBe('偏印');
        // Earth produces Metal
        expect(calculateTenGod('庚', '戊')).toBe('偏印');
        expect(calculateTenGod('辛', '己')).toBe('偏印');
        // Metal produces Water
        expect(calculateTenGod('壬', '庚')).toBe('偏印');
        expect(calculateTenGod('癸', '辛')).toBe('偏印');
      });

      it('should return 正印 for opposite polarity resource', () => {
        // Water produces Wood
        expect(calculateTenGod('甲', '癸')).toBe('正印');
        expect(calculateTenGod('乙', '壬')).toBe('正印');
        // Wood produces Fire
        expect(calculateTenGod('丙', '乙')).toBe('正印');
        expect(calculateTenGod('丁', '甲')).toBe('正印');
        // Fire produces Earth
        expect(calculateTenGod('戊', '丁')).toBe('正印');
        expect(calculateTenGod('己', '丙')).toBe('正印');
        // Earth produces Metal
        expect(calculateTenGod('庚', '己')).toBe('正印');
        expect(calculateTenGod('辛', '戊')).toBe('正印');
        // Metal produces Water
        expect(calculateTenGod('壬', '辛')).toBe('正印');
        expect(calculateTenGod('癸', '庚')).toBe('正印');
      });
    });
  });

  describe('getAllTenGods', () => {
    it('should return all 10 ten gods for each day stem', () => {
      allStems.forEach(dayStem => {
        const result = getAllTenGods(dayStem);
        expect(Object.keys(result)).toHaveLength(10);

        allStems.forEach(targetStem => {
          expect(result[targetStem]).toBeDefined();
        });
      });
    });

    it('should have exactly 10 different ten god types across all stems', () => {
      const dayStem = '甲';
      const result = getAllTenGods(dayStem);
      const uniqueTypes = new Set(Object.values(result));

      expect(uniqueTypes.size).toBe(10);
      expect(uniqueTypes).toContain('比肩');
      expect(uniqueTypes).toContain('劫財');
      expect(uniqueTypes).toContain('食神');
      expect(uniqueTypes).toContain('傷官');
      expect(uniqueTypes).toContain('偏財');
      expect(uniqueTypes).toContain('正財');
      expect(uniqueTypes).toContain('七殺');
      expect(uniqueTypes).toContain('正官');
      expect(uniqueTypes).toContain('偏印');
      expect(uniqueTypes).toContain('正印');
    });
  });

  describe('10x10 Matrix Validation', () => {
    /**
     * Complete 10x10 matrix of Ten Gods
     * Rows: Day Stem, Columns: Target Stem
     */
    const EXPECTED_MATRIX: Record<string, Record<string, TenGod>> = {
      甲: {
        甲: '比肩', 乙: '劫財', 丙: '食神', 丁: '傷官', 戊: '偏財',
        己: '正財', 庚: '七殺', 辛: '正官', 壬: '偏印', 癸: '正印'
      },
      乙: {
        甲: '劫財', 乙: '比肩', 丙: '傷官', 丁: '食神', 戊: '正財',
        己: '偏財', 庚: '正官', 辛: '七殺', 壬: '正印', 癸: '偏印'
      },
      丙: {
        甲: '偏印', 乙: '正印', 丙: '比肩', 丁: '劫財', 戊: '食神',
        己: '傷官', 庚: '偏財', 辛: '正財', 壬: '七殺', 癸: '正官'
      },
      丁: {
        甲: '正印', 乙: '偏印', 丙: '劫財', 丁: '比肩', 戊: '傷官',
        己: '食神', 庚: '正財', 辛: '偏財', 壬: '正官', 癸: '七殺'
      },
      戊: {
        甲: '七殺', 乙: '正官', 丙: '偏印', 丁: '正印', 戊: '比肩',
        己: '劫財', 庚: '食神', 辛: '傷官', 壬: '偏財', 癸: '正財'
      },
      己: {
        甲: '正官', 乙: '七殺', 丙: '正印', 丁: '偏印', 戊: '劫財',
        己: '比肩', 庚: '傷官', 辛: '食神', 壬: '正財', 癸: '偏財'
      },
      庚: {
        甲: '偏財', 乙: '正財', 丙: '七殺', 丁: '正官', 戊: '偏印',
        己: '正印', 庚: '比肩', 辛: '劫財', 壬: '食神', 癸: '傷官'
      },
      辛: {
        甲: '正財', 乙: '偏財', 丙: '正官', 丁: '七殺', 戊: '正印',
        己: '偏印', 庚: '劫財', 辛: '比肩', 壬: '傷官', 癸: '食神'
      },
      壬: {
        甲: '食神', 乙: '傷官', 丙: '偏財', 丁: '正財', 戊: '七殺',
        己: '正官', 庚: '偏印', 辛: '正印', 壬: '比肩', 癸: '劫財'
      },
      癸: {
        甲: '傷官', 乙: '食神', 丙: '正財', 丁: '偏財', 戊: '正官',
        己: '七殺', 庚: '正印', 辛: '偏印', 壬: '劫財', 癸: '比肩'
      }
    };

    it('should match complete 10x10 matrix for all day stems', () => {
      allStems.forEach(dayStem => {
        allStems.forEach(targetStem => {
          const result = calculateTenGod(dayStem, targetStem);
          const expected = EXPECTED_MATRIX[dayStem][targetStem];
          expect(result).toBe(expected);
        });
      });
    });

    it('should validate matrix completeness', () => {
      // Verify matrix has all stems as keys
      expect(Object.keys(EXPECTED_MATRIX)).toHaveLength(10);

      // Verify each row has all 10 stems
      Object.values(EXPECTED_MATRIX).forEach(row => {
        expect(Object.keys(row)).toHaveLength(10);
      });
    });
  });
});
