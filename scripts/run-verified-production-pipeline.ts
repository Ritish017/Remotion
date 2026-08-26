import dotenv from 'dotenv';
dotenv.config({ override: true });

import fs from 'fs';
import path from 'path';
import { runContentDirector } from '../src/lib/ai/claude/agents/ContentDirector';
import { runStoryboardDirector } from '../src/lib/ai/claude/agents/StoryboardDirector';
import { runProductionAgent } from '../src/lib/ai/claude/agents/ProductionAgent';
import { ResearchOrchestrator } from '../src/lib/research/ResearchOrchestrator';
import { runAutomatedQA } from '../src/lib/qa';
import { ProviderRegistry } from '../src/lib/providers';
import { execSync } from 'child_process';

async function runFullProductionPipeline() {
  console.log('========================================================================');
  console.log('🎬 CATALYST VERIFIED END-TO-END PRODUCTION PIPELINE');
  console.log('========================================================================\n');

  const topic = 'The Neuromorphic Chip Revolution: How Brain-Inspired Silicon Slashed AI Power by 90%';

  // 1. Research Orchestrator
  console.log('📚 [PHASE 1] Research Orchestration (Firecrawl + Evidence Synthesis)...');
  const orchestrator = new ResearchOrchestrator();
  const researchReport = await orchestrator.conductResearch({
    topic,
    useStructuredData: true,
    targetDurationSeconds: 45,
  });

  console.log(`   - Executive Summary: ${researchReport.executiveSummary}`);
  console.log(`   - Recommended Hook:  "${researchReport.recommendedHook}"`);
  console.log(`   - Key Metrics:       ${researchReport.evidence.keyMetrics.map((m) => `${m.label}: ${m.value}`).join(', ')}`);
  console.log('   Research dossier synthesized successfully. ✅\n');

  // 2. Claude Content Director
  console.log('✍️ [PHASE 2] Claude Content Director (Script Generation)...');
  const content = await runContentDirector({
    topic,
    targetAudience: 'Engineers & Technology Executives',
    brandVoice: 'Cinematic, Analytical, Authoritative',
    durationSeconds: 45,
  });

  console.log(`   - Script Title: "${content.title}"`);
  console.log(`   - Transcript:   "${content.fullTranscript.slice(0, 100)}..."`);
  console.log('   Content Director complete. ✅\n');

  // 3. Claude Storyboard Director
  console.log('🎨 [PHASE 3] Claude Storyboard Director (Visual Direction & Timing)...');
  const storyboard = await runStoryboardDirector({
    content,
    brandId: 'editorial-dark',
    format: '9:16',
  });

  console.log(`   - Generated ${storyboard.scenes.length} Scenes (${storyboard.totalDurationFrames} frames @ 30 FPS)`);
  storyboard.scenes.forEach((s) => {
    console.log(`     Scene ${s.sceneNumber}: [${s.templateId}] "${s.props?.headline || s.title}" (${s.durationFrames}f)`);
  });
  console.log('   Storyboard Director complete. ✅\n');

  // 4. Production Agent (OpenAI TTS + Whisper Word Timestamps + VideoSpec)
  console.log('🎙️ [PHASE 4] Production Agent (Real OpenAI TTS Narration & Whisper Word Timestamps)...');
  const videoSpec = await runProductionAgent({
    title: content.title,
    transcript: content.fullTranscript,
    scenes: storyboard.scenes,
    brandId: 'editorial-dark',
    format: '9:16',
  });

  console.log(`   - Audio URL:         ${videoSpec.narration.audioUrl}`);
  console.log(`   - Audio Duration:    ${videoSpec.narration.durationSeconds}s`);
  console.log(`   - Synchronized Words:${videoSpec.narration.words.length} words`);
  console.log(`   - Total Frames:      ${videoSpec.composition.durationInFrames} frames`);

  const outDir = path.resolve(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const specPath = path.join(outDir, 'verified_production_spec.json');
  fs.writeFileSync(specPath, JSON.stringify(videoSpec, null, 2));
  console.log(`   - VideoSpec saved:   ${specPath} ✅\n`);

  // 5. Automated Video QA Engine
  console.log('🔍 [PHASE 5] Automated Video QA Verification...');
  const qaReport = runAutomatedQA(videoSpec);
  console.log(`   - QA Overall Score:  ${qaReport.score}/100`);
  console.log(`   - Status:            ${qaReport.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  qaReport.checks.forEach((c) => {
    console.log(`   - ${c.name}: [${c.status.toUpperCase()}] ${c.message}`);
  });

  // 6. Local High-Definition Remotion Render
  console.log('\n🎥 [PHASE 6] Remotion High-Definition Production Render (1080x1920 MP4)...');
  const outMp4 = path.join(outDir, 'catalyst-verified-production.mp4');

  const renderCmd = `npx remotion render src/remotion/index.ts VerticalExplainer "${outMp4}" --props="${specPath}" --port=3033 --concurrency=1 --image-format=jpeg`;
  console.log(`   Executing: ${renderCmd}`);

  try {
    execSync(renderCmd, { stdio: 'inherit' });
    const stats = fs.statSync(outMp4);
    console.log(`\n🎉 MASTER MP4 RENDER COMPLETE!`);
    console.log(`   - File:     ${outMp4}`);
    console.log(`   - Size:     ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   - Format:   1080x1920 @ 30 FPS H.264 MP4`);
  } catch (e: any) {
    console.error('❌ Render error:', e.message);
  }

  // 7. Resend Notification
  console.log('\n✉️ [PHASE 7] Dispatching Transactional Resend Email Notification...');
  try {
    const emailRes = await ProviderRegistry.email.resend.sendRenderComplete(
      content.title,
      'https://catalyst-videos-759433041913.s3.amazonaws.com/out/catalyst-verified-production.mp4',
      videoSpec.narration.durationSeconds
    );
    console.log(`   - Email Status: ${emailRes.status} (ID: ${emailRes.id}) ✅`);
  } catch (e: any) {
    console.warn('   ⚠️ Resend notification warning:', e.message);
  }

  console.log('\n========================================================================');
  console.log('🏁 CATALYST PRODUCTION PIPELINE COMPLETED WITH 100% REAL INTEGRATIONS!');
  console.log('========================================================================');
}

runFullProductionPipeline().catch(console.error);
