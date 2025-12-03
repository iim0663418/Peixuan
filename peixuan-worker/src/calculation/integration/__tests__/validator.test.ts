/**
 * Validator Test Suite
 * Tests comprehensive input validation logic
 */

import { describe, it, expect } from 'vitest';
import { validateBirthInfo } from '../validator';
import type { BirthInfo } from '../../types';

describe('validateBirthInfo', () => {
  // Valid input baseline
  const validInput: BirthInfo = {
    solarDate: new Date(2024, 0, 1, 12, 0),
    longitude: 121.5,
    gender: 'male'
  };

  describe('Valid inputs', () => {
    it('should validate correct input', () => {
      const result = validateBirthInfo(validInput);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate female gender', () => {
      const result = validateBirthInfo({
        ...validInput,
        gender: 'female'
      });
      expect(result.valid).toBe(true);
    });

    it('should validate with isLeapMonth flag', () => {
      const result = validateBirthInfo({
        ...validInput,
        isLeapMonth: true
      });
      expect(result.valid).toBe(true);
    });

    it('should validate negative longitude (West)', () => {
      const result = validateBirthInfo({
        ...validInput,
        longitude: -122.5
      });
      expect(result.valid).toBe(true);
    });

    it('should validate edge case longitudes', () => {
      expect(validateBirthInfo({ ...validInput, longitude: 180 }).valid).toBe(true);
      expect(validateBirthInfo({ ...validInput, longitude: -180 }).valid).toBe(true);
      expect(validateBirthInfo({ ...validInput, longitude: 0 }).valid).toBe(true);
    });
  });

  describe('Invalid solarDate', () => {
    it('should reject missing solarDate', () => {
      const result = validateBirthInfo({
        ...validInput,
        solarDate: undefined as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('solarDate is required');
    });

    it('should reject non-Date solarDate', () => {
      const result = validateBirthInfo({
        ...validInput,
        solarDate: '2024-01-01' as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('solarDate must be a Date object');
    });

    it('should reject invalid Date object', () => {
      const result = validateBirthInfo({
        ...validInput,
        solarDate: new Date('invalid')
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('solarDate is invalid');
    });

    it('should reject year before 1900', () => {
      const result = validateBirthInfo({
        ...validInput,
        solarDate: new Date(1899, 0, 1)
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('solarDate year must be between 1900 and 2100');
    });

    it('should reject year after 2100', () => {
      const result = validateBirthInfo({
        ...validInput,
        solarDate: new Date(2101, 0, 1)
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('solarDate year must be between 1900 and 2100');
    });
  });

  describe('Invalid longitude', () => {
    it('should reject missing longitude', () => {
      const result = validateBirthInfo({
        ...validInput,
        longitude: undefined as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('longitude is required');
    });

    it('should reject null longitude', () => {
      const result = validateBirthInfo({
        ...validInput,
        longitude: null as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('longitude is required');
    });

    it('should reject non-number longitude', () => {
      const result = validateBirthInfo({
        ...validInput,
        longitude: '121.5' as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('longitude must be a number');
    });

    it('should reject NaN longitude', () => {
      const result = validateBirthInfo({
        ...validInput,
        longitude: NaN
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('longitude is invalid');
    });

    it('should reject longitude > 180', () => {
      const result = validateBirthInfo({
        ...validInput,
        longitude: 180.1
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('longitude must be between -180 and 180 degrees');
    });

    it('should reject longitude < -180', () => {
      const result = validateBirthInfo({
        ...validInput,
        longitude: -180.1
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('longitude must be between -180 and 180 degrees');
    });
  });

  describe('Invalid gender', () => {
    it('should reject missing gender', () => {
      const result = validateBirthInfo({
        ...validInput,
        gender: undefined as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('gender is required');
    });

    it('should reject invalid gender value', () => {
      const result = validateBirthInfo({
        ...validInput,
        gender: 'unknown' as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('gender must be "male" or "female"');
    });
  });

  describe('Invalid isLeapMonth', () => {
    it('should reject non-boolean isLeapMonth', () => {
      const result = validateBirthInfo({
        ...validInput,
        isLeapMonth: 'true' as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('isLeapMonth must be a boolean');
    });
  });

  describe('Multiple errors', () => {
    it('should accumulate multiple validation errors', () => {
      const result = validateBirthInfo({
        solarDate: new Date('invalid'),
        longitude: 200,
        gender: 'unknown' as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
