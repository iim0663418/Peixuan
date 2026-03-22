/**
 * GanZhi Modulo Arithmetic Utilities
 * Provides modulo operations for Heavenly Stems (mod 10) and Earthly Branches (mod 12)
 */

/**
 * Perform modulo 10 arithmetic for Heavenly Stems
 * @param value - Input value
 * @returns Normalized value in range [0, 9]
 */
export function stemModulo(value: number): number {
  return ((value % 10) + 10) % 10;
}

/**
 * Perform modulo 12 arithmetic for Earthly Branches
 * @param value - Input value
 * @returns Normalized value in range [0, 11]
 */
export function branchModulo(value: number): number {
  return ((value % 12) + 12) % 12;
}
