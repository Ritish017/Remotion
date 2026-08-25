import { runRemotionTestSuite } from '../src/__tests__/remotion.test';

console.log('🎬 Running Catalyst Remotion Platform Test Suite...\n');
const results = runRemotionTestSuite();

let allPassed = true;
results.forEach((r, idx) => {
  const icon = r.passed ? '✅' : '❌';
  console.log(`${icon} [${idx + 1}/${results.length}] ${r.test}`);
  console.log(`   Details: ${r.message}\n`);
  if (!r.passed) allPassed = false;
});

if (allPassed) {
  console.log('🎉 ALL TESTS PASSED! The Remotion Video Platform engine is 100% verified.');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED. Please review output above.');
  process.exit(1);
}
