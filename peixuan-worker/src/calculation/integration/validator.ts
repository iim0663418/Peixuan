/**
 * Input Validation Module
 *
 * Provides comprehensive validation for birth information input.
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Task 4.1
 */

import { BirthInfo, ValidationResult } from '../types';

/**
 * Validate birth information input
 *
 * @param input - Birth information to validate
 * @returns Validation result with error messages
 *
 * @example
 * const result = validateBirthInfo({
 *   solarDate: new Date(2024, 0, 1, 12, 0),
 *   longitude: 121.5,
 *   gender: 'male'
 * });
 * // Returns: { valid: true, errors: [] }
 */
export function validateBirthInfo(input: BirthInfo): ValidationResult {
  const errors: string[] = [];

  // Validate solarDate
  if (!input.solarDate) {
    errors.push('solarDate is required');
  } else if (!(input.solarDate instanceof Date)) {
    errors.push('solarDate must be a Date object');
  } else if (isNaN(input.solarDate.getTime())) {
    errors.push('solarDate is invalid');
  } else {
    // Check reasonable date range (1900-2100)
    const year = input.solarDate.getFullYear();
    if (year < 1900 || year > 2100) {
      errors.push('solarDate year must be between 1900 and 2100');
    }
  }

  // Validate longitude
  if (input.longitude === undefined || input.longitude === null) {
    errors.push('longitude is required');
  } else if (typeof input.longitude !== 'number') {
    errors.push('longitude must be a number');
  } else if (isNaN(input.longitude)) {
    errors.push('longitude is invalid');
  } else if (input.longitude < -180 || input.longitude > 180) {
    errors.push('longitude must be between -180 and 180 degrees');
  }

  // Validate gender
  if (!input.gender) {
    errors.push('gender is required');
  } else if (input.gender !== 'male' && input.gender !== 'female') {
    errors.push('gender must be "male" or "female"');
  }

  // Validate isLeapMonth (optional)
  if (input.isLeapMonth !== undefined && typeof input.isLeapMonth !== 'boolean') {
    errors.push('isLeapMonth must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
