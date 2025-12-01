/**
 * BaZi Verification Script
 * 
 * Directly tests four pillars calculation to identify issues
 */

import { calculateYearPillar } from '../src/calculation/bazi/fourPillars';
import { getLichunTime } from '../src/calculation/core/time/solarTerms';
import { ganZhiToIndex } from '../src/calculation/core/ganZhi';

console.log('=== BaZi Four Pillars Verification ===\n');

// Test Case 1: 1988-01-01 (before LiChun)
console.log('Test 1: 1988-01-01 12:00');
const date1 = new Date(1988, 0, 1, 12, 0, 0);
const lichun1988 = getLichunTime(1988);
console.log('  Birth Date:', date1.toISOString());
console.log('  1988 LiChun:', lichun1988.toISOString());
console.log('  Before LiChun:', date1 < lichun1988);

const year1 = calculateYearPillar(date1, lichun1988);
const index1 = ganZhiToIndex(year1);
console.log('  Year Pillar:', year1.stem + year1.branch, `(index: ${index1})`);
console.log('  Expected: 丁卯 (index: 3)');
console.log('  Result:', year1.stem === '丁' && year1.branch === '卯' ? '✅ PASS' : '❌ FAIL');
console.log();

// Test Case 2: 1988-02-05 (after LiChun)
console.log('Test 2: 1988-02-05 12:00');
const date2 = new Date(1988, 1, 5, 12, 0, 0);
console.log('  Birth Date:', date2.toISOString());
console.log('  1988 LiChun:', lichun1988.toISOString());
console.log('  After LiChun:', date2 >= lichun1988);

const year2 = calculateYearPillar(date2, lichun1988);
const index2 = ganZhiToIndex(year2);
console.log('  Year Pillar:', year2.stem + year2.branch, `(index: ${index2})`);
console.log('  Expected: 戊辰 (index: 4)');
console.log('  Result:', year2.stem === '戊' && year2.branch === '辰' ? '✅ PASS' : '❌ FAIL');
console.log();

// Test Case 3: 1992-09-10 (known correct)
console.log('Test 3: 1992-09-10 05:56');
const date3 = new Date(1992, 8, 10, 5, 56, 0);
const lichun1992 = getLichunTime(1992);
console.log('  Birth Date:', date3.toISOString());
console.log('  1992 LiChun:', lichun1992.toISOString());

const year3 = calculateYearPillar(date3, lichun1992);
const index3 = ganZhiToIndex(year3);
console.log('  Year Pillar:', year3.stem + year3.branch, `(index: ${index3})`);
console.log('  Expected: 壬申 (index: 8)');
console.log('  Result:', year3.stem === '壬' && year3.branch === '申' ? '✅ PASS' : '❌ FAIL');
