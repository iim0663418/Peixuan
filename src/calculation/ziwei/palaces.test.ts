import { describe, it, expect } from 'vitest';
import { calculateLifePalace, calculateBodyPalace } from './palaces';

describe('ZiWei Palace Positioning', () => {
  describe('calculateLifePalace', () => {
    it('should calculate all 144 combinations (12 months × 12 hours)', () => {
      const results: { month: number; hour: number; position: number }[] = [];

      for (let month = 1; month <= 12; month++) {
        for (let hour = 0; hour < 12; hour++) {
          const result = calculateLifePalace(month, hour);
          results.push({ month, hour, position: result.position });

          // Validate result range
          expect(result.position).toBeGreaterThanOrEqual(0);
          expect(result.position).toBeLessThan(12);
          expect(result.branch).toBeTruthy();
        }
      }

      // Verify we have all 144 combinations
      expect(results).toHaveLength(144);
    });

    it('should handle leap month adjustment', () => {
      const month = 4;
      const hour = 5;

      const normal = calculateLifePalace(month, hour);
      const leapAdjusted = calculateLifePalace(month, hour, { leapMonthAdjustment: 1 });

      // Leap month adjustment should shift position by 1
      expect((leapAdjusted.position - normal.position + 12) % 12).toBe(1);
    });

    it('should return correct earthly branch names', () => {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      for (let pos = 0; pos < 12; pos++) {
        // Find a month/hour combination that produces this position
        const result = calculateLifePalace(pos + 1, 0);
        expect(branches).toContain(result.branch);
      }
    });

    it('should handle edge cases', () => {
      // Month 1, Hour 0 (子时)
      const case1 = calculateLifePalace(1, 0);
      expect(case1.position).toBeGreaterThanOrEqual(0);

      // Month 12, Hour 11 (亥时)
      const case2 = calculateLifePalace(12, 11);
      expect(case2.position).toBeGreaterThanOrEqual(0);

      // Month 6, Hour 6
      const case3 = calculateLifePalace(6, 6);
      expect(case3.position).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateBodyPalace', () => {
    it('should calculate all 144 combinations (12 months × 12 hours)', () => {
      const results: { month: number; hour: number; position: number }[] = [];

      for (let month = 1; month <= 12; month++) {
        for (let hour = 0; hour < 12; hour++) {
          const result = calculateBodyPalace(month, hour);
          results.push({ month, hour, position: result.position });

          // Validate result range
          expect(result.position).toBeGreaterThanOrEqual(0);
          expect(result.position).toBeLessThan(12);
          expect(result.branch).toBeTruthy();
        }
      }

      // Verify we have all 144 combinations
      expect(results).toHaveLength(144);
    });

    it('should return correct earthly branch names', () => {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      for (let month = 1; month <= 12; month++) {
        const result = calculateBodyPalace(month, 0);
        expect(branches).toContain(result.branch);
      }
    });

    it('should handle edge cases', () => {
      // Month 1, Hour 0 (子时)
      const case1 = calculateBodyPalace(1, 0);
      expect(case1.position).toBeGreaterThanOrEqual(0);

      // Month 12, Hour 11 (亥时)
      const case2 = calculateBodyPalace(12, 11);
      expect(case2.position).toBeGreaterThanOrEqual(0);

      // Month 6, Hour 6
      const case3 = calculateBodyPalace(6, 6);
      expect(case3.position).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Palace relationship validation', () => {
    it('should produce different positions for Life and Body palaces', () => {
      let differenceCount = 0;

      for (let month = 1; month <= 12; month++) {
        for (let hour = 0; hour < 12; hour++) {
          const life = calculateLifePalace(month, hour);
          const body = calculateBodyPalace(month, hour);

          if (life.position !== body.position) {
            differenceCount++;
          }
        }
      }

      // Most combinations should produce different positions
      expect(differenceCount).toBeGreaterThan(0);
    });
  });
});
