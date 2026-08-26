import dotenv from 'dotenv';
dotenv.config({ override: true });

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function verifyLambdaConfiguration() {
  console.log('========================================================================');
  console.log('🚀 REMOTION LAMBDA & S3 CONFIGURATION VERIFICATION');
  console.log('========================================================================\n');

  const region = process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
  const bucket = process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913';
  const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_SERVE_URL;

  console.log(`📍 AWS Region:            ${region}`);
  console.log(`🪣 S3 Bucket:             ${bucket}`);
  console.log(`⚡ Lambda Function Name:  ${functionName || '⚠️ Not configured'}`);
  console.log(`🌐 Remotion Serve URL:    ${serveUrl || '⚠️ Not configured'}\n`);

  // 1. Check AWS S3 connectivity
  console.log('🔍 [Step 1] Verifying AWS S3 Bucket Connectivity...');
  try {
    const s3 = new S3Client({ region });
    const s3Res = await s3.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }));
    console.log(`   ✅ S3 Connection Successful! Bucket [${bucket}] is reachable.`);
    console.log(`   Found ${s3Res.KeyCount ?? 0} sample objects in bucket.\n`);
  } catch (err: any) {
    console.error(`   ❌ S3 Connection Error: ${err.message}\n`);
  }

  // 2. Check Remotion Lambda Client API
  console.log('🔍 [Step 2] Verifying Remotion Lambda Client Package...');
  try {
    const { getSites } = await import('@remotion/lambda/client');
    console.log('   ✅ @remotion/lambda/client loaded successfully.');

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const sites = await getSites({ region: region as any });
        console.log(`\n   Found ${sites.sites.length} deployed Remotion site bundle(s) in S3:`);
        sites.sites.forEach((site) => {
          console.log(`     - Site ID: ${site.id} (ServeUrl: ${site.serveUrl})`);
        });
      } catch (lambdaErr: any) {
        console.warn(`   ⚠️ Remotion Lambda API notice: ${lambdaErr.message}`);
      }
    } else {
      console.log('   ⚠️ AWS credentials not set in environment.');
    }
  } catch (err: any) {
    console.error(`   ❌ Remotion Lambda verification error: ${err.message}`);
  }

  console.log('\n========================================================================');
  console.log('🏁 REMOTION LAMBDA & S3 VERIFICATION AUDIT COMPLETE');
  console.log('========================================================================');
}

verifyLambdaConfiguration().catch(console.error);
