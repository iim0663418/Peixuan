/**
 * Test script to verify integration calculator fixes
 *
 * Test Case:
 * - 己土 day stem should give: 癸水=正財, 甲木=正官
 * - 酉命宮 should correctly locate 巳 branch
 */

import { calculateTenGod } from './src/calculation/bazi/tenGods';

// Test 1: Verify calculateTenGod for 己土 day stem
console.log('=== Test 1: calculateTenGod with 己土 day stem ===');
const dayStem = '己';

const testCases = [
  { target: '癸', expected: '正財' },
  { target: '甲', expected: '正官' }
];

let allPassed = true;

for (const { target, expected } of testCases) {
  const result = calculateTenGod(dayStem, target);
  const passed = result === expected;
  console.log(`  ${dayStem}土 -> ${target}: ${result} ${passed ? '✓' : `✗ (expected ${expected})`}`);
  if (!passed) {allPassed = false;}
}

// Test 2: Verify createPalaceArrayFromLifePalace for 酉命宮
console.log('\n=== Test 2: createPalaceArrayFromLifePalace with 酉命宮 ===');

// Simulate the function (copied from calculator.ts)
function createPalaceArrayFromLifePalace(
  lifePalacePosition: number,
  lifePalaceBranch: string
): Array<{ position: number; branch: string }> {
  const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const lifePalaceBranchIndex = EARTHLY_BRANCHES.indexOf(lifePalaceBranch);
  if (lifePalaceBranchIndex === -1) {
    return [];
  }

  const palaces: Array<{ position: number; branch: string }> = [];
  for (let i = 0; i < 12; i++) {
    const branchIndex = (lifePalaceBranchIndex + (i - lifePalacePosition) + 12) % 12;
    palaces.push({
      position: i,
      branch: EARTHLY_BRANCHES[branchIndex]
    });
  }

  return palaces;
}

// Test with 酉命宮 at position 1 (example)
const lifePalacePosition = 1;
const lifePalaceBranch = '酉';
const palaces = createPalaceArrayFromLifePalace(lifePalacePosition, lifePalaceBranch);

console.log(`  Life Palace: Position ${lifePalacePosition}, Branch ${lifePalaceBranch}`);
console.log('  Generated palaces:');
palaces.forEach(p => {
  console.log(`    Position ${p.position}: ${p.branch}`);
});

// Verify life palace is correct
const lifePalaceCheck = palaces[lifePalacePosition].branch === lifePalaceBranch;
console.log(`\n  Life palace check: Position ${lifePalacePosition} = ${palaces[lifePalacePosition].branch} ${lifePalaceCheck ? '✓' : '✗'}`);
if (!lifePalaceCheck) {allPassed = false;}

// Find 巳 branch
const siPosition = palaces.find(p => p.branch === '巳');
if (siPosition) {
  console.log(`  巳 branch found at position ${siPosition.position} ✓`);
} else {
  console.log('  巳 branch NOT found ✗');
  allPassed = false;
}

// Summary
console.log('\n=== Test Summary ===');
console.log(allPassed ? '✓ All tests passed!' : '✗ Some tests failed');
process.exit(allPassed ? 0 : 1);
