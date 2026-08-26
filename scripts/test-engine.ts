// @ts-ignore
Object.defineProperty(globalThis, 'remotion_imported', { get: () => undefined, set: () => {} });

import dotenv from 'dotenv';
dotenv.config({ override: true });

import { runRemotionTestSuite } from '../src/__tests__/remotion.test';

async function main() {
  console.log('🎬 Running Catalyst Production Hardened Test Suite...\n');
  const results = await runRemotionTestSuite();

  let allPassed = true;
  results.forEach((r, idx) => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} [${idx + 1}/${results.length}] ${r.test}`);
    console.log(`   Details: ${r.message}\n`);
    if (!r.passed) allPassed = false;
  });

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Catalyst production hardening & safety checks are 100% verified.');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED. Please review output above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
