import { describe, it, expect } from 'vitest';
import { calculateTrueSolarTime } from '../src/calculation/core/time/trueSolarTime';

describe('True Solar Time Calculation', () => {
  it('calculates true solar time for Beijing (116.4°E) at noon on 2024-01-01', () => {
    const clockTime = new Date(2024, 0, 1, 12, 0, 0);
    const longitude = 116.4;

    const result = calculateTrueSolarTime(clockTime, longitude);

    // Beijing is 3.6° west of 120°E standard meridian
    // Longitude correction: (116.4 - 120) × 4 = -14.4 minutes
    expect(result.longitudeCorrection).toBeCloseTo(-14.4, 1);

    // Verify total correction is applied
    expect(result.totalCorrection).toBeDefined();
    expect(result.trueSolarTime).toBeInstanceOf(Date);

    // True solar time should be earlier than clock time (negative correction)
    expect(result.trueSolarTime.getTime()).toBeLessThan(clockTime.getTime());
  });

  it('calculates true solar time for Taipei (121.5°E) at noon on 2024-06-21', () => {
    const clockTime = new Date(2024, 5, 21, 12, 0, 0); // June 21 (month index 5)
    const longitude = 121.5;

    const result = calculateTrueSolarTime(clockTime, longitude);

    // Taipei is 1.5° east of 120°E standard meridian
    // Longitude correction: (121.5 - 120) × 4 = 6 minutes
    expect(result.longitudeCorrection).toBeCloseTo(6.0, 1);

    // Verify result structure
    expect(result.equationOfTime).toBeDefined();
    expect(result.totalCorrection).toBeDefined();

    // True solar time should be later than clock time (positive correction)
    expect(result.trueSolarTime.getTime()).toBeGreaterThan(clockTime.getTime());
  });
});
