/**
 * Quick verification script for star positioning integration
 * Run with: node test-star-positioning.js
 */

const { UnifiedCalculator } = require('./dist/index.js');

console.log('Testing Star Positioning Integration...\n');

const calculator = new UnifiedCalculator();

const testInput = {
  solarDate: new Date(2024, 0, 15, 14, 30, 0), // Jan 15, 2024, 14:30
  longitude: 121.5, // Taipei
  gender: 'female'
};

try {
  const result = calculator.calculate(testInput);

  console.log('✓ Calculation completed successfully\n');

  // Check palaces array
  console.log(`Palaces count: ${result.ziwei.palaces.length}`);
  console.log(`Expected: 12`);
  console.log(`Status: ${result.ziwei.palaces.length === 12 ? '✓ PASS' : '✗ FAIL'}\n`);

  // Count stars
  let totalStars = 0;
  const starMap = new Map();

  result.ziwei.palaces.forEach((palace, idx) => {
    if (palace.stars && palace.stars.length > 0) {
      console.log(`Palace ${idx} (${palace.branch}): ${palace.stars.map(s => s.name).join(', ')}`);
      totalStars += palace.stars.length;
      palace.stars.forEach(star => {
        starMap.set(star.name, palace.position);
      });
    }
  });

  console.log(`\nTotal stars placed: ${totalStars}`);
  console.log(`Expected: >= 18 (14 main + 4 auxiliary)`);
  console.log(`Status: ${totalStars >= 18 ? '✓ PASS' : '✗ FAIL'}\n`);

  // Verify specific stars
  const requiredStars = [
    // ZiWei system
    '紫微', '天機', '太陽', '武曲', '天同', '廉貞',
    // TianFu system
    '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
    // Auxiliary
    '文昌', '文曲', '左輔', '右弼'
  ];

  console.log('Verifying required stars:');
  const missingStars = [];
  requiredStars.forEach(star => {
    const found = starMap.has(star);
    if (!found) {
      missingStars.push(star);
    }
    console.log(`  ${star}: ${found ? `✓ at position ${starMap.get(star)}` : '✗ MISSING'}`);
  });

  console.log(`\nMissing stars: ${missingStars.length === 0 ? 'None' : missingStars.join(', ')}`);
  console.log(`Status: ${missingStars.length === 0 ? '✓ PASS' : '✗ FAIL'}\n`);

  // Overall result
  const allPassed = result.ziwei.palaces.length === 12 &&
                    totalStars >= 18 &&
                    missingStars.length === 0;

  console.log('='.repeat(60));
  console.log(`Overall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
  console.log('='.repeat(60));

  process.exit(allPassed ? 0 : 1);

} catch (error) {
  console.error('✗ Error during calculation:', error.message);
  console.error(error.stack);
  process.exit(1);
}
