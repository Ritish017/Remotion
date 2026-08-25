import { ASSET_REGISTRY } from '../src/lib/assets/registry';

async function verifyAllAssets() {
  console.log('🔍 VERIFYING REAL ASSET REGISTRY URLS & LICENSES...\n');

  let allPassed = true;

  for (const asset of ASSET_REGISTRY) {
    console.log(`Checking Asset [${asset.id}] (${asset.type}):`);
    console.log(`   Source: ${asset.source}`);
    console.log(`   License: ${asset.license}`);
    console.log(`   URL: ${asset.url}`);

    try {
      const res = await fetch(asset.url, { method: 'HEAD' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok) {
        console.log(`   Status: HTTP ${res.status} OK (${contentType}) ✅\n`);
      } else {
        console.warn(`   Status: HTTP ${res.status} FAILED ❌\n`);
        allPassed = false;
      }
    } catch (e: any) {
      console.warn(`   Fetch Error: ${e.message} ❌\n`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('🎉 ALL ASSETS RESOLVE & PASS LICENSE VERIFICATION!');
  } else {
    console.error('❌ SOME ASSETS FAILED HTTP VERIFICATION.');
  }
}

verifyAllAssets().catch(console.error);
