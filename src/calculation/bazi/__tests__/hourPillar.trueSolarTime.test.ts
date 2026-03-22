/**
 * Hour Pillar True Solar Time Test
 *
 * Tests calculateHourPillar with Date overload and true solar time corrections
 */

import { describe, it, expect } from 'vitest';
import { calculateHourPillar } from '../fourPillars';
import { calculateTrueSolarTime } from '../../core/time';

describe('Hour Pillar - True Solar Time', () => {
  describe('Date overload parameter extraction', () => {
    it('should extract hour=5, minute=56 from Date parameter', () => {
      const clockTime = new Date(1992, 8, 10, 5, 56, 0);
      const dayStemIndex = 4; // 戊

      // Test Date overload
      const result = calculateHourPillar(clockTime, dayStemIndex);

      // Expected: 卯時 (05:00-07:00), 五鼠遁日法: (2*4 + 3) mod 10 = 1 → 乙卯
      expect(result.stem).toBe('乙');
      expect(result.branch).toBe('卯');
    });
  });

  describe('True solar time correction impact', () => {
    it('Beijing (116.4°E) at noon should differ from Urumqi (87.6°E)', () => {
      const clockTime = new Date(2024, 0, 1, 12, 0, 0); // Noon
      const dayStemIndex = 0; // 甲

      // Beijing: 116.4°E → longitude correction = (116.4 - 120) * 4 = -14.4 min
      const beijingResult = calculateTrueSolarTime(clockTime, 116.4);
      const beijingHourPillar = calculateHourPillar(beijingResult.trueSolarTime, dayStemIndex);

      // Urumqi: 87.6°E → longitude correction = (87.6 - 120) * 4 = -129.6 min (~2.16h)
      // 12:00 - 2.16h = 9:50 → 巳時 (9:00-11:00)
      const urumqiResult = calculateTrueSolarTime(clockTime, 87.6);
      const urumqiHourPillar = calculateHourPillar(urumqiResult.trueSolarTime, dayStemIndex);

      // Verify corrections are significantly different
      expect(beijingResult.longitudeCorrection).toBeCloseTo(-14.4);
      expect(urumqiResult.longitudeCorrection).toBeCloseTo(-129.6);

      // Beijing at noon: 午時 (11:00-13:00), 五鼠遁日法: (2*0 + 6) mod 10 = 6 → 庚午
      expect(beijingHourPillar.stem).toBe('庚');
      expect(beijingHourPillar.branch).toBe('午');
      
      // Urumqi at noon (true solar ~9:50): 巳時 (9:00-11:00), 五鼠遁日法: (2*0 + 5) mod 10 = 5 → 己巳
      expect(urumqiHourPillar.stem).toBe('己');
      expect(urumqiHourPillar.branch).toBe('巳');
    });
  });

  describe('Hour boundary at 23:00 (子時)', () => {
    it('should handle 23:00 as 子時 (Zi hour)', () => {
      const clockTime = new Date(1992, 8, 10, 23, 0, 0);
      const dayStemIndex = 4; // 戊

      const result = calculateHourPillar(clockTime, dayStemIndex);

      // 23:00-01:00 is 子時 (branch index 0)
      // 五鼠遁日法: (2*4 + 0) mod 10 = 8 → 壬子
      expect(result.stem).toBe('壬');
      expect(result.branch).toBe('子');
    });

    it('should handle 23:30 as 子時 with Date overload', () => {
      const clockTime = new Date(1992, 8, 10, 23, 30, 0);
      const dayStemIndex = 4; // 戊

      const result = calculateHourPillar(clockTime, dayStemIndex);

      // Should still be 子時
      expect(result.stem).toBe('壬');
      expect(result.branch).toBe('子');
    });
  });

  describe('Overload equivalence', () => {
    it('both overloads should produce same result', () => {
      const clockTime = new Date(1992, 8, 10, 5, 56, 0);
      const dayStemIndex = 4; // 戊

      // Date overload
      const dateResult = calculateHourPillar(clockTime, dayStemIndex);

      // Number overload (hour, minute, dayStemIndex)
      const numberResult = calculateHourPillar(5, 56, dayStemIndex);

      // Should be identical
      expect(dateResult.stem).toBe(numberResult.stem);
      expect(dateResult.branch).toBe(numberResult.branch);
      expect(dateResult.stem).toBe('乙');
      expect(dateResult.branch).toBe('卯');
    });

    it('both overloads should handle 子時 boundary identically', () => {
      const clockTime = new Date(1992, 8, 10, 23, 15, 0);
      const dayStemIndex = 4; // 戊

      const dateResult = calculateHourPillar(clockTime, dayStemIndex);
      const numberResult = calculateHourPillar(23, 15, dayStemIndex);

      expect(dateResult.stem).toBe(numberResult.stem);
      expect(dateResult.branch).toBe(numberResult.branch);
      expect(dateResult.stem).toBe('壬');
      expect(dateResult.branch).toBe('子');
    });
  });
});
