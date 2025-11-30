/**
 * WuXing Distribution Tests
 *
 * Test cases for weighted Five Elements distribution calculation
 * Reference: 八字命理後端模組研究.md §2.2.2
 */

import {
  calculateWuXingDistribution,
  getTianganScores,
  getHiddenStemScores,
  getTotalScores,
  type FourPillars,
} from '../distribution';
import type { WuXing } from '../../core/wuXing/relations';

describe('WuXing Distribution Module', () => {
  describe('getTianganScores', () => {
    it('should count tiangan with weight 1.0 each', () => {
      const stems = ['甲', '丙', '戊', '庚'];
      const scores = getTianganScores(stems);

      expect(scores.Wood).toBe(1); // 甲
      expect(scores.Fire).toBe(1); // 丙
      expect(scores.Earth).toBe(1); // 戊
      expect(scores.Metal).toBe(1); // 庚
      expect(scores.Water).toBe(0);
    });

    it('should accumulate multiple stems of same element', () => {
      const stems = ['甲', '乙', '丙', '丁'];
      const scores = getTianganScores(stems);

      expect(scores.Wood).toBe(2); // 甲 + 乙
      expect(scores.Fire).toBe(2); // 丙 + 丁
    });
  });

  describe('getHiddenStemScores', () => {
    it('should calculate weighted hidden stems for known chart (子寅辰酉)', () => {
      // Reference: Research doc §2.2.2 example
      const branches = ['子', '寅', '辰', '酉'];
      const scores = getHiddenStemScores(branches);

      // 子: 癸(Water) 1.0
      // 寅: 甲(Wood) 0.6, 丙(Fire) 0.3, 戊(Earth) 0.1
      // 辰: 戊(Earth) 0.6, 乙(Wood) 0.3, 癸(Water) 0.1
      // 酉: 辛(Metal) 1.0

      expect(scores.Wood).toBeCloseTo(0.6 + 0.3, 5); // 0.9
      expect(scores.Fire).toBeCloseTo(0.3, 5);
      expect(scores.Earth).toBeCloseTo(0.1 + 0.6, 5); // 0.7
      expect(scores.Metal).toBeCloseTo(1.0, 5);
      expect(scores.Water).toBeCloseTo(1.0 + 0.1, 5); // 1.1
    });

    it('should handle single-stem branches with weight 1.0', () => {
      const branches = ['子', '卯', '午', '酉'];
      const scores = getHiddenStemScores(branches);

      expect(scores.Water).toBeCloseTo(1.0, 5); // 子: 癸 1.0
      expect(scores.Wood).toBeCloseTo(1.0, 5); // 卯: 乙 1.0
      expect(scores.Metal).toBeCloseTo(1.0, 5); // 酉: 辛 1.0
    });
  });

  describe('getTotalScores', () => {
    it('should apply seasonality adjustment correctly', () => {
      const tianganScores = {
        Wood: 1,
        Fire: 0,
        Earth: 0,
        Metal: 0,
        Water: 0,
      };

      const hiddenStemScores = {
        Wood: 0,
        Fire: 0,
        Earth: 0,
        Metal: 0,
        Water: 0,
      };

      // Test in Spring (寅) - Wood gets 1.5x multiplier
      const springScores = getTotalScores(tianganScores, hiddenStemScores, '寅');
      expect(springScores.Wood).toBeCloseTo(1.5, 5);

      // Test in Autumn (酉) - Wood gets 0.7x multiplier
      const autumnScores = getTotalScores(tianganScores, hiddenStemScores, '酉');
      expect(autumnScores.Wood).toBeCloseTo(0.7, 5);
    });
  });

  describe('calculateWuXingDistribution', () => {
    it('should calculate distribution for known chart (子寅辰酉 example)', () => {
      // Based on research doc §2.2.2 example
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '寅' },
        day: { stem: '戊', branch: '辰' },
        hour: { stem: '庚', branch: '酉' },
      };

      const distribution = calculateWuXingDistribution(fourPillars);

      // Check raw tiangan counts
      expect(distribution.raw.tiangan.Wood).toBe(1); // 甲
      expect(distribution.raw.tiangan.Fire).toBe(1); // 丙
      expect(distribution.raw.tiangan.Earth).toBe(1); // 戊
      expect(distribution.raw.tiangan.Metal).toBe(1); // 庚
      expect(distribution.raw.tiangan.Water).toBe(0);

      // Check raw hidden stem scores
      expect(distribution.raw.hiddenStems.Wood).toBeCloseTo(0.9, 5);
      expect(distribution.raw.hiddenStems.Fire).toBeCloseTo(0.3, 5);
      expect(distribution.raw.hiddenStems.Earth).toBeCloseTo(0.7, 5);
      expect(distribution.raw.hiddenStems.Metal).toBeCloseTo(1.0, 5);
      expect(distribution.raw.hiddenStems.Water).toBeCloseTo(1.1, 5);

      // Month branch is 寅 (Spring), so Wood is boosted
      expect(distribution.adjusted.Wood).toBeGreaterThan(distribution.raw.tiangan.Wood + distribution.raw.hiddenStems.Wood);

      // Dominant and deficient should be determined
      expect(distribution.dominant).toBeDefined();
      expect(distribution.deficient).toBeDefined();

      // Balance should be between 0 and 1
      expect(distribution.balance).toBeGreaterThanOrEqual(0);
      expect(distribution.balance).toBeLessThanOrEqual(1);
    });

    it('should handle extreme case: all elements missing except one', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '寅' },
        month: { stem: '乙', branch: '卯' },
        day: { stem: '甲', branch: '寅' },
        hour: { stem: '乙', branch: '卯' },
      };

      const distribution = calculateWuXingDistribution(fourPillars);

      // All Wood
      expect(distribution.dominant).toBe('Wood');

      // Should have very low balance (high imbalance)
      expect(distribution.balance).toBeLessThan(0.5);
    });

    it('should handle extreme case: single dominant element', () => {
      const fourPillars: FourPillars = {
        year: { stem: '庚', branch: '申' },
        month: { stem: '辛', branch: '酉' },
        day: { stem: '庚', branch: '申' },
        hour: { stem: '辛', branch: '酉' },
      };

      const distribution = calculateWuXingDistribution(fourPillars);

      // All Metal
      expect(distribution.dominant).toBe('Metal');

      // Metal should have highest adjusted score
      const metalScore = distribution.adjusted.Metal;
      expect(metalScore).toBeGreaterThan(distribution.adjusted.Wood);
      expect(metalScore).toBeGreaterThan(distribution.adjusted.Fire);
      expect(metalScore).toBeGreaterThan(distribution.adjusted.Earth);
      expect(metalScore).toBeGreaterThan(distribution.adjusted.Water);
    });

    it('should validate balance calculation for perfectly balanced chart', () => {
      // Create a relatively balanced chart
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '子' }, // Wood stem, Water branch
        month: { stem: '丙', branch: '午' }, // Fire stem, Fire branch
        day: { stem: '戊', branch: '辰' }, // Earth stem, Earth branch
        hour: { stem: '庚', branch: '申' }, // Metal stem, Metal branch
      };

      const distribution = calculateWuXingDistribution(fourPillars);

      // All five elements should have some representation
      expect(distribution.adjusted.Wood).toBeGreaterThan(0);
      expect(distribution.adjusted.Fire).toBeGreaterThan(0);
      expect(distribution.adjusted.Earth).toBeGreaterThan(0);
      expect(distribution.adjusted.Metal).toBeGreaterThan(0);
      expect(distribution.adjusted.Water).toBeGreaterThan(0);

      // Balance should be better than single-element charts
      expect(distribution.balance).toBeGreaterThan(0);
    });

    it('should correctly identify deficient element', () => {
      // Chart with no Fire
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '寅' }, // Wood
        month: { stem: '戊', branch: '辰' }, // Earth
        day: { stem: '庚', branch: '申' }, // Metal
        hour: { stem: '壬', branch: '子' }, // Water
      };

      const distribution = calculateWuXingDistribution(fourPillars);

      // Fire should be either deficient or have very low score
      expect(distribution.adjusted.Fire).toBeLessThan(distribution.adjusted.Wood);
      expect(distribution.adjusted.Fire).toBeLessThan(distribution.adjusted.Earth);
    });
  });
});
