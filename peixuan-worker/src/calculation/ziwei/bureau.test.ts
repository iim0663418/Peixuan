/**
 * Tests for Bureau Calculation Module
 * Validates 60 Jiazi NaYin mapping completeness and correctness
 */

import { describe, it, expect } from 'vitest';
import { calculateBureau, getStemBranchPair, type Bureau } from './bureau';

describe('Bureau Calculation', () => {
  describe('calculateBureau', () => {
    it('should calculate bureau for all 60 Jiazi combinations', () => {
      // 60 Jiazi validation table
      const jiazi60: Array<{ stem: string; branch: string; bureau: Bureau; nayin: string }> = [
        // First 10 pairs (甲子 cycle)
        { stem: '甲', branch: '子', bureau: 4, nayin: '海中金' },
        { stem: '乙', branch: '丑', bureau: 4, nayin: '海中金' },
        { stem: '丙', branch: '寅', bureau: 6, nayin: '爐中火' },
        { stem: '丁', branch: '卯', bureau: 6, nayin: '爐中火' },
        { stem: '戊', branch: '辰', bureau: 3, nayin: '大林木' },
        { stem: '己', branch: '巳', bureau: 3, nayin: '大林木' },
        { stem: '庚', branch: '午', bureau: 5, nayin: '路旁土' },
        { stem: '辛', branch: '未', bureau: 5, nayin: '路旁土' },
        { stem: '壬', branch: '申', bureau: 4, nayin: '劍鋒金' },
        { stem: '癸', branch: '酉', bureau: 4, nayin: '劍鋒金' },

        // Second 10 pairs (甲戌 cycle)
        { stem: '甲', branch: '戌', bureau: 6, nayin: '山頭火' },
        { stem: '乙', branch: '亥', bureau: 6, nayin: '山頭火' },
        { stem: '丙', branch: '子', bureau: 2, nayin: '澗下水' },
        { stem: '丁', branch: '丑', bureau: 2, nayin: '澗下水' },
        { stem: '戊', branch: '寅', bureau: 5, nayin: '城頭土' },
        { stem: '己', branch: '卯', bureau: 5, nayin: '城頭土' },
        { stem: '庚', branch: '辰', bureau: 4, nayin: '白蠟金' },
        { stem: '辛', branch: '巳', bureau: 4, nayin: '白蠟金' },
        { stem: '壬', branch: '午', bureau: 3, nayin: '楊柳木' },
        { stem: '癸', branch: '未', bureau: 3, nayin: '楊柳木' },

        // Third 10 pairs (甲申 cycle)
        { stem: '甲', branch: '申', bureau: 2, nayin: '泉中水' },
        { stem: '乙', branch: '酉', bureau: 2, nayin: '泉中水' },
        { stem: '丙', branch: '戌', bureau: 5, nayin: '屋上土' },
        { stem: '丁', branch: '亥', bureau: 5, nayin: '屋上土' },
        { stem: '戊', branch: '子', bureau: 6, nayin: '霹靂火' },
        { stem: '己', branch: '丑', bureau: 6, nayin: '霹靂火' },
        { stem: '庚', branch: '寅', bureau: 3, nayin: '松柏木' },
        { stem: '辛', branch: '卯', bureau: 3, nayin: '松柏木' },
        { stem: '壬', branch: '辰', bureau: 2, nayin: '長流水' },
        { stem: '癸', branch: '巳', bureau: 2, nayin: '長流水' },

        // Fourth 10 pairs (甲午 cycle)
        { stem: '甲', branch: '午', bureau: 4, nayin: '砂中金' },
        { stem: '乙', branch: '未', bureau: 4, nayin: '砂中金' },
        { stem: '丙', branch: '申', bureau: 6, nayin: '山下火' },
        { stem: '丁', branch: '酉', bureau: 6, nayin: '山下火' },
        { stem: '戊', branch: '戌', bureau: 3, nayin: '平地木' },
        { stem: '己', branch: '亥', bureau: 3, nayin: '平地木' },
        { stem: '庚', branch: '子', bureau: 5, nayin: '壁上土' },
        { stem: '辛', branch: '丑', bureau: 5, nayin: '壁上土' },
        { stem: '壬', branch: '寅', bureau: 4, nayin: '金箔金' },
        { stem: '癸', branch: '卯', bureau: 4, nayin: '金箔金' },

        // Fifth 10 pairs (甲辰 cycle)
        { stem: '甲', branch: '辰', bureau: 6, nayin: '覆燈火' },
        { stem: '乙', branch: '巳', bureau: 6, nayin: '覆燈火' },
        { stem: '丙', branch: '午', bureau: 2, nayin: '天河水' },
        { stem: '丁', branch: '未', bureau: 2, nayin: '天河水' },
        { stem: '戊', branch: '申', bureau: 5, nayin: '大驛土' },
        { stem: '己', branch: '酉', bureau: 5, nayin: '大驛土' },
        { stem: '庚', branch: '戌', bureau: 4, nayin: '釵釧金' },
        { stem: '辛', branch: '亥', bureau: 4, nayin: '釵釧金' },
        { stem: '壬', branch: '子', bureau: 3, nayin: '桑柘木' },
        { stem: '癸', branch: '丑', bureau: 3, nayin: '桑柘木' },

        // Sixth 10 pairs (甲寅 cycle)
        { stem: '甲', branch: '寅', bureau: 2, nayin: '大溪水' },
        { stem: '乙', branch: '卯', bureau: 2, nayin: '大溪水' },
        { stem: '丙', branch: '辰', bureau: 5, nayin: '砂中土' },
        { stem: '丁', branch: '巳', bureau: 5, nayin: '砂中土' },
        { stem: '戊', branch: '午', bureau: 6, nayin: '天上火' },
        { stem: '己', branch: '未', bureau: 6, nayin: '天上火' },
        { stem: '庚', branch: '申', bureau: 3, nayin: '石榴木' },
        { stem: '辛', branch: '酉', bureau: 3, nayin: '石榴木' },
        { stem: '壬', branch: '戌', bureau: 2, nayin: '大海水' },
        { stem: '癸', branch: '亥', bureau: 2, nayin: '大海水' },
      ];

      // Validate all 60 combinations
      jiazi60.forEach(({ stem, branch, bureau, nayin }) => {
        const result = calculateBureau(stem, branch);
        expect(result).toBe(bureau);
      });

      // Verify we tested all 60
      expect(jiazi60.length).toBe(60);
    });

    it('should correctly map each bureau type', () => {
      // Water Bureau (2)
      expect(calculateBureau('丙', '子')).toBe(2);
      expect(calculateBureau('壬', '戌')).toBe(2);

      // Wood Bureau (3)
      expect(calculateBureau('戊', '辰')).toBe(3);
      expect(calculateBureau('庚', '申')).toBe(3);

      // Metal Bureau (4)
      expect(calculateBureau('甲', '子')).toBe(4);
      expect(calculateBureau('庚', '戌')).toBe(4);

      // Earth Bureau (5)
      expect(calculateBureau('庚', '午')).toBe(5);
      expect(calculateBureau('戊', '申')).toBe(5);

      // Fire Bureau (6)
      expect(calculateBureau('丙', '寅')).toBe(6);
      expect(calculateBureau('戊', '午')).toBe(6);
    });

    it('should throw error for invalid heavenly stem', () => {
      expect(() => calculateBureau('X', '子')).toThrow('Invalid heavenly stem');
      expect(() => calculateBureau('', '子')).toThrow('Invalid heavenly stem');
    });

    it('should throw error for invalid earthly branch', () => {
      expect(() => calculateBureau('甲', 'X')).toThrow('Invalid earthly branch');
      expect(() => calculateBureau('甲', '')).toThrow('Invalid earthly branch');
    });
  });

  describe('getStemBranchPair', () => {
    it('should convert indices to stem-branch pair', () => {
      // 甲子 (0, 0)
      expect(getStemBranchPair(0, 0)).toEqual({ stem: '甲', branch: '子' });

      // 乙丑 (1, 1)
      expect(getStemBranchPair(1, 1)).toEqual({ stem: '乙', branch: '丑' });

      // 癸亥 (9, 11)
      expect(getStemBranchPair(9, 11)).toEqual({ stem: '癸', branch: '亥' });
    });

    it('should throw error for invalid stem index', () => {
      expect(() => getStemBranchPair(-1, 0)).toThrow('Invalid stem index');
      expect(() => getStemBranchPair(10, 0)).toThrow('Invalid stem index');
    });

    it('should throw error for invalid branch index', () => {
      expect(() => getStemBranchPair(0, -1)).toThrow('Invalid branch index');
      expect(() => getStemBranchPair(0, 12)).toThrow('Invalid branch index');
    });
  });

  describe('Bureau distribution', () => {
    it('should have correct distribution of bureaus in 60 Jiazi', () => {
      const bureauCount: Record<Bureau, number> = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      // Count all 60 Jiazi
      for (let stemIdx = 0; stemIdx < 10; stemIdx++) {
        for (let branchIdx = 0; branchIdx < 12; branchIdx++) {
          // Only count valid Jiazi combinations (60 out of 120)
          if ((stemIdx % 2) === (branchIdx % 2)) {
            const { stem, branch } = getStemBranchPair(stemIdx, branchIdx);
            const bureau = calculateBureau(stem, branch);
            bureauCount[bureau]++;
          }
        }
      }

      // Each bureau should appear 12 times in 60 Jiazi
      expect(bureauCount[2]).toBe(12); // Water
      expect(bureauCount[3]).toBe(12); // Wood
      expect(bureauCount[4]).toBe(12); // Metal
      expect(bureauCount[5]).toBe(12); // Earth
      expect(bureauCount[6]).toBe(12); // Fire
    });
  });
});
