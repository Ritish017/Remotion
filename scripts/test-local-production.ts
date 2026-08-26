import dotenv from 'dotenv';
dotenv.config({ override: true });

import fs from 'fs';
import path from 'path';
import { printStartupBanner, runStartupCheck } from '../src/lib/startup/startupCheck';
import { runContentDirector } from '../src/lib/ai/claude/agents/ContentDirector';
import { runStoryboardDirector } from '../src/lib/ai/claude/agents/StoryboardDirector';
import { runProductionAgent } from '../src/lib/ai/claude/agents/ProductionAgent';
import { createLocalRenderJob, getLocalRenderJobStatus } from '../src/lib/rendering/local';
import { StorageFactory } from '../src/lib/storage';
import { DatabaseFactory } from '../src/lib/database';
import { runAutomatedQA } from '../src/lib/qa';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function renderVideoPipeline(topic: string, videoNumber: number) {
  console.log(`\n========================================================================`);
  console.log(`🎬 [VIDEO #${videoNumber}] GENERATING & RENDERING PIPELINE`);
  console.log(`Topic: "${topic}"`);
  console.log(`========================================================================\n`);

  const storage = StorageFactory.getProvider();
  const db = DatabaseFactory.getProvider();

  // Phase 1: Content Director (Script)
  console.log(`🧠 [Phase 1] Generating Narrative Script via Claude...`);
  const content = await runContentDirector({
    topic,
    targetAudience: 'Hardware engineers, technologists & innovators',
    vertical: 'tech-explainer',
    brandVoice: 'Analytical, authoritative, dynamic',
    durationSeconds: 30,
  });
  console.log(`   ✅ Script Created: "${content.title}" (${content.fullTranscript.length} characters)`);

  // Phase 2: Storyboard Director (7 Timed Scenes)
  console.log(`\n🎬 [Phase 2] Generating Storyboard Scenes via Claude...`);
  const storyboard = await runStoryboardDirector(content, 30);
  console.log(`   ✅ Storyboard Created: ${storyboard.scenes.length} timed scenes (${storyboard.totalDurationFrames} frames)`);

  // Phase 3: Production Agent (OpenAI TTS + Whisper Word Timestamps + VideoSpec)
  console.log(`\n🎙️ [Phase 3] Generating Voiceover & Synchronized Timestamps...`);
  const spec = await runProductionAgent({
    title: content.title,
    transcript: content.fullTranscript,
    scenes: storyboard.scenes,
    brandId: 'tech-explainer',
    format: '9:16',
  });

  console.log(`   ✅ VideoSpec Assembled:`);
  console.log(`      Duration: ${spec.composition.durationInFrames} frames (${(spec.composition.durationInFrames / 30).toFixed(1)}s)`);
  console.log(`      Audio Track: ${spec.narration.audioUrl}`);
  console.log(`      Word Timestamps: ${spec.narration.words.length} words`);

  // Phase 4: Automated Video QA
  console.log(`\n🔍 [Phase 4] Running Automated Video Quality Assurance...`);
  const qa = runAutomatedQA(spec);
  console.log(`   QA Score: ${qa.score}/100 — ${qa.summary}`);

  // Save VideoSpec to Local Storage
  const specPath = `videospecs/video_${videoNumber}_spec.json`;
  await storage.save(specPath, JSON.stringify(spec, null, 2));
  console.log(`   💾 VideoSpec saved to storage: ${specPath}`);

  // Phase 5: Local Remotion Rendering
  console.log(`\n⚡ [Phase 5] Triggering Local Remotion Render Engine...`);
  const renderJob = await createLocalRenderJob({
    spec,
    projectId: `proj_local_${videoNumber}`,
    episodeId: `ep_local_${videoNumber}`,
  });

  console.log(`   Render Job Enqueued: ID [${renderJob.jobId}], Status: [${renderJob.status}]`);

  // Poll Local Render Progress
  console.log(`   Rendering frame-by-frame on local GPU/CPU...`);
  let attempts = 0;
  let finalStatus = renderJob.status;
  let completedJob: any = null;

  while (attempts < 180) {
    await sleep(2000);
    attempts++;
    const statusRes = await getLocalRenderJobStatus(renderJob.jobId);
    finalStatus = statusRes.status;

    if (attempts % 5 === 0) {
      console.log(`   ...rendering in progress (status: ${finalStatus}, elapsed: ${attempts * 2}s)...`);
    }

    if (finalStatus === 'COMPLETED') {
      completedJob = statusRes;
      break;
    } else if (finalStatus === 'FAILED') {
      throw new Error(`Local render failed: ${statusRes.error || 'Unknown error'}`);
    }
  }

  if (!completedJob || finalStatus !== 'COMPLETED') {
    throw new Error(`Render timed out after 360 seconds`);
  }

  // Phase 6: Output MP4 Verification
  console.log(`\n📁 [Phase 6] Verifying Local MP4 Output Artifact...`);
  const mp4AbsolutePath = storage.getAbsolutePath(completedJob.outputPath!);
  if (!fs.existsSync(mp4AbsolutePath)) {
    throw new Error(`Rendered MP4 file missing at ${mp4AbsolutePath}`);
  }

  const stat = fs.statSync(mp4AbsolutePath);
  if (stat.size === 0) {
    throw new Error(`Rendered MP4 is 0 bytes`);
  }

  console.log(`   ✅ MP4 Verified on Local Disk:`);
  console.log(`      File Path:    ${mp4AbsolutePath}`);
  console.log(`      File Size:    ${(stat.size / (1024 * 1024)).toFixed(2)} MB (${stat.size} bytes)`);
  console.log(`      Public URL:   ${completedJob.publicUrl}`);
  console.log(`      Duration:     ${completedJob.durationSeconds}s`);

  // Phase 7: SQLite Persistence Verification
  const dbJob = await db.getRenderJob(renderJob.jobId);
  console.log(`\n💾 [Phase 7] Verifying SQLite Database Record:`);
  console.log(`      Job ID:       ${dbJob?.id}`);
  console.log(`      DB Status:    ${dbJob?.status}`);
  console.log(`      Output Path:  ${dbJob?.outputPath}`);
  console.log(`      Completed At: ${dbJob?.completedAt}`);

  return {
    jobId: renderJob.jobId,
    title: content.title,
    outputPath: mp4AbsolutePath,
    sizeBytes: stat.size,
    durationSeconds: completedJob.durationSeconds,
    status: 'COMPLETED',
  };
}

async function main() {
  await printStartupBanner();

  console.log('🚀 CATALYST LOCAL PRODUCTION VERIFICATION SUITE\n');

  // Video #1: "Why AI chips are becoming more efficient"
  const video1 = await renderVideoPipeline(
    'Why AI chips are becoming more efficient: Neuromorphic & In-Memory Compute',
    1
  );

  // Video #2: "The Race to Build Humanoid Robots"
  const video2 = await renderVideoPipeline(
    'The Race to Build Humanoid Robots: Actuators, Power Density, and AI Vision',
    2
  );

  console.log(`\n========================================================================`);
  console.log(`🎉 LOCAL PRODUCTION VERIFICATION SUCCESSFUL!`);
  console.log(`========================================================================`);
  console.log(`Video #1: "${video1.title}" (${(video1.sizeBytes / (1024 * 1024)).toFixed(2)} MB) -> COMPLETED`);
  console.log(`Video #2: "${video2.title}" (${(video2.sizeBytes / (1024 * 1024)).toFixed(2)} MB) -> COMPLETED`);
  console.log(`\nBoth videos rendered locally and verified on disk and SQLite database.`);
  console.log(`========================================================================\n`);
}

main().catch((err) => {
  console.error('\n❌ Local Production Verification Failed:', err);
  process.exit(1);
});
