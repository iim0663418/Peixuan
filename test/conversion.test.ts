/**
 * GanZhi Conversion Tests
 * Validates full 60 Jiazi cycle conversion correctness
 */

import { describe, it, expect } from 'vitest';
import {
  indexToGanZhi,
  ganZhiToIndex,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  type GanZhi
} from '../src/calculation/core/ganZhi';

// Complete 60 Jiazi cycle for validation
const SIXTY_JIAZI: GanZhi[] = [
  { stem: '甲', branch: '子' }, { stem: '乙', branch: '丑' }, { stem: '丙', branch: '寅' },
  { stem: '丁', branch: '卯' }, { stem: '戊', branch: '辰' }, { stem: '己', branch: '巳' },
  { stem: '庚', branch: '午' }, { stem: '辛', branch: '未' }, { stem: '壬', branch: '申' },
  { stem: '癸', branch: '酉' }, { stem: '甲', branch: '戌' }, { stem: '乙', branch: '亥' },
  { stem: '丙', branch: '子' }, { stem: '丁', branch: '丑' }, { stem: '戊', branch: '寅' },
  { stem: '己', branch: '卯' }, { stem: '庚', branch: '辰' }, { stem: '辛', branch: '巳' },
  { stem: '壬', branch: '午' }, { stem: '癸', branch: '未' }, { stem: '甲', branch: '申' },
  { stem: '乙', branch: '酉' }, { stem: '丙', branch: '戌' }, { stem: '丁', branch: '亥' },
  { stem: '戊', branch: '子' }, { stem: '己', branch: '丑' }, { stem: '庚', branch: '寅' },
  { stem: '辛', branch: '卯' }, { stem: '壬', branch: '辰' }, { stem: '癸', branch: '巳' },
  { stem: '甲', branch: '午' }, { stem: '乙', branch: '未' }, { stem: '丙', branch: '申' },
  { stem: '丁', branch: '酉' }, { stem: '戊', branch: '戌' }, { stem: '己', branch: '亥' },
  { stem: '庚', branch: '子' }, { stem: '辛', branch: '丑' }, { stem: '壬', branch: '寅' },
  { stem: '癸', branch: '卯' }, { stem: '甲', branch: '辰' }, { stem: '乙', branch: '巳' },
  { stem: '丙', branch: '午' }, { stem: '丁', branch: '未' }, { stem: '戊', branch: '申' },
  { stem: '己', branch: '酉' }, { stem: '庚', branch: '戌' }, { stem: '辛', branch: '亥' },
  { stem: '壬', branch: '子' }, { stem: '癸', branch: '丑' }, { stem: '甲', branch: '寅' },
  { stem: '乙', branch: '卯' }, { stem: '丙', branch: '辰' }, { stem: '丁', branch: '巳' },
  { stem: '戊', branch: '午' }, { stem: '己', branch: '未' }, { stem: '庚', branch: '申' },
  { stem: '辛', branch: '酉' }, { stem: '壬', branch: '戌' }, { stem: '癸', branch: '亥' }
];

describe('GanZhi Conversion', () => {
  describe('indexToGanZhi', () => {
    it('should convert all 60 Jiazi indices correctly', () => {
      for (let i = 0; i < 60; i++) {
        const result = indexToGanZhi(i);
        expect(result).toEqual(SIXTY_JIAZI[i]);
      }
    });

    it('should handle negative indices with modulo arithmetic', () => {
      expect(indexToGanZhi(-1)).toEqual(SIXTY_JIAZI[59]);
      expect(indexToGanZhi(-60)).toEqual(SIXTY_JIAZI[0]);
    });

    it('should handle indices beyond 60 with modulo arithmetic', () => {
      expect(indexToGanZhi(60)).toEqual(SIXTY_JIAZI[0]);
      expect(indexToGanZhi(120)).toEqual(SIXTY_JIAZI[0]);
      expect(indexToGanZhi(61)).toEqual(SIXTY_JIAZI[1]);
    });
  });

  describe('ganZhiToIndex', () => {
    it('should convert all 60 Jiazi pairs to correct indices', () => {
      for (let i = 0; i < 60; i++) {
        const result = ganZhiToIndex(SIXTY_JIAZI[i]);
        expect(result).toBe(i);
      }
    });

    it('should throw error for invalid stem', () => {
      expect(() => ganZhiToIndex({ stem: '無' as any, branch: '子' })).toThrow();
    });

    it('should throw error for invalid branch', () => {
      expect(() => ganZhiToIndex({ stem: '甲', branch: '無' as any })).toThrow();
    });
  });

  describe('Bidirectional conversion', () => {
    it('should maintain consistency in round-trip conversion', () => {
      for (let i = 0; i < 60; i++) {
        const ganZhi = indexToGanZhi(i);
        const index = ganZhiToIndex(ganZhi);
        expect(index).toBe(i);
      }
    });
  });

  describe('Constants validation', () => {
    it('should have 10 Heavenly Stems', () => {
      expect(HEAVENLY_STEMS).toHaveLength(10);
    });

    it('should have 12 Earthly Branches', () => {
      expect(EARTHLY_BRANCHES).toHaveLength(12);
    });
  });
});
