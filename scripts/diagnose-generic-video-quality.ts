import dotenv from 'dotenv';
dotenv.config({ override: true });

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ResearchOrchestrator } from '../src/lib/research/ResearchOrchestrator';
import { runContentDirector } from '../src/lib/ai/claude/agents/ContentDirector';
import { runStoryboardDirector } from '../src/lib/ai/claude/agents/StoryboardDirector';
import { runVisualDirector } from '../src/lib/ai/claude/agents/VisualDirector';
import { runAssetDirector } from '../src/lib/ai/claude/agents/AssetDirector';
import { runMotionDirector } from '../src/lib/ai/claude/agents/MotionDirector';
import { analyzeNarrativeTiming } from '../src/lib/ai/claude/agents/NarrativeTimingAnalyzer';
import { assembleVideoSpecV2 } from '../src/lib/ai/claude/agents/ProductionAgent';
import { generateNarration } from '../src/lib/audio/narrator';
import { runAutomatedQA } from '../src/lib/qa';
import { validateVideoSpec } from '../src/lib/video-spec/validator';
import type { VideoSpec, ResearchSource } from '../src/lib/video-spec/types';

const root = process.cwd();
const diagDir = path.join(root, 'storage', 'qa', 'diagnostic_generic');
const framesDir = path.join(diagDir, 'frames');

fs.mkdirSync(diagDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });

async function runDiagnostic() {
  console.log('========================================================================');
  console.log('🔬 CATALYST DIAGNOSTIC TEST: GENERIC PIPELINE QUALITY ANALYSIS');
  console.log('========================================================================\n');

  const topic = 'The race to build commercial fusion power';
  const targetDurationSeconds = 45;
  const fps = 30;
  const totalFrames = targetDurationSeconds * fps;

  // 1. Research Orchestration
  console.log('📚 [STEP 1] Research Orchestration on arbitrary topic...');
  const researchOrchestrator = new ResearchOrchestrator();
  const researchReport = await researchOrchestrator.conductResearch({
    topic,
    useStructuredData: true,
    targetDurationSeconds,
  });
  console.log(`   - Summary: ${researchReport.executiveSummary.slice(0, 100)}...`);
  console.log(`   - Facts extracted: ${researchReport.evidence.facts.length}\n`);

  const formattedSources: ResearchSource[] = (researchReport.evidence.sources || []).map((s: any, idx: number) => ({
    sourceId: s.sourceId || s.id || `src-${idx + 1}`,
    title: s.title || `Research Source ${idx + 1}`,
    url: s.url,
    publisher: s.publisher,
  }));

  // 2. Content Director
  console.log('✍️ [STEP 2] Content Director (7-Beat Script Generation)...');
  const content = await runContentDirector({
    topic,
    targetAudience: 'Physicists, Energy Leaders, and Technology Executives',
    vertical: 'Advanced Physics & Clean Energy Engineering',
    brandVoice: 'Investigative, cinematic, analytical, authoritative',
    durationSeconds: targetDurationSeconds,
    sources: formattedSources,
  });
  console.log(`   - Title: "${content.title}"`);
  console.log(`   - Transcript: "${content.fullTranscript.slice(0, 120)}..."\n`);

  // 3. Audio & Forced Alignment
  console.log('🎙️ [STEP 3] Generating Voiceover & Whisper Forced Alignment...');
  const narration = await generateNarration(content.fullTranscript);
  console.log(`   - Audio URL: ${narration.audioUrl}`);
  console.log(`   - Duration:  ${narration.durationSeconds.toFixed(2)}s`);
  console.log(`   - Words aligned: ${narration.words.length}\n`);

  const timingAnalysis = analyzeNarrativeTiming(narration.words, fps);

  // 4. Storyboard Director
  console.log('🎨 [STEP 4] Storyboard Director (Scene Timing & Templates)...');
  const storyboard = await runStoryboardDirector({
    content,
    brandId: 'catalyst-editorial',
    format: '9:16',
  });
  console.log(`   - Generated ${storyboard.scenes.length} Scenes (${storyboard.totalDurationFrames} frames)\n`);

  // 5. Visual Director (Decomposes to Micro VisualBeats)
  console.log('📐 [STEP 5] Visual Director (Micro VisualBeats Across 7 Languages)...');
  const visualPlan = await runVisualDirector({
    content,
    storyboard: storyboard.scenes,
    words: narration.words,
    format: '9:16',
    durationSeconds: targetDurationSeconds,
  });

  const assetPlan = await runAssetDirector(visualPlan);
  const motionPlan = await runMotionDirector(visualPlan, timingAnalysis);

  console.log(`   - Resolved Assets: ${assetPlan.totalAssets}`);
  console.log(`   - Motion Seed: ${motionPlan.motionSeed}\n`);

  // 6. Production Agent Assembly & VideoSpec Validation
  console.log('⚙️ [STEP 6] VideoSpec v2.0 Assembly & Strict Validation...');
  const videoSpec: VideoSpec = assembleVideoSpecV2({
    content,
    storyboard: storyboard.scenes,
    visualPlan,
    motionPlan,
    resolvedAssets: assetPlan,
    words: narration.words,
    audioUrl: narration.audioUrl,
    durationSeconds: targetDurationSeconds,
    brandId: 'catalyst-editorial',
  });

  const validation = validateVideoSpec(videoSpec);
  if (!validation.valid && !validation.repairedSpec) {
    console.error('❌ VideoSpec validation failed:', validation.errors);
    process.exit(1);
  }

  const activeSpec = validation.repairedSpec || videoSpec;
  const specPath = path.join(diagDir, 'diagnostic_videospec.json');
  fs.writeFileSync(specPath, JSON.stringify(activeSpec, null, 2));
  console.log(`   - VideoSpec saved to: ${specPath} ✅\n`);

  // 7. Automated QA Gate
  console.log('🔍 [STEP 7] Automated QA Engine Verification...');
  const qaReport = runAutomatedQA(activeSpec);
  console.log(`   - QA Overall Score: ${qaReport.score}/100`);
  console.log(`   - Human Visual Score: ${qaReport.humanVisualQualityScore}/10.0`);
  console.log(`   - Status: ${qaReport.passed ? 'PASSED ✅' : 'WARNED ⚠️'}\n`);

  // 8. Remotion Headless Master Render
  console.log('🎥 [STEP 8] Remotion Headless Master Render (1080x1920 @ 30fps)...');
  const outMp4 = path.join(diagDir, 'diagnostic_generic_fusion.mp4');

  const renderCmd = `npx remotion render src/remotion/index.ts MasterComposition "${outMp4}" --props="${specPath}" --codec=h264 --crf=20 --concurrency=1 --port=3055 --image-format=jpeg`;
  console.log(`   Executing: ${renderCmd}`);

  try {
    execSync(renderCmd, { stdio: 'inherit', cwd: root });
  } catch (err: any) {
    console.error('❌ Render command failed:', err.message);
    process.exit(1);
  }

  const stat = fs.statSync(outMp4);
  console.log(`\n🎉 MASTER MP4 RENDER COMPLETE: ${outMp4} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)\n`);

  // 9. Extract 24 Review Frames Across Timeline
  console.log('📸 [STEP 9] Extracting 24 Diagnostic Review Frames Across Timeline...');
  const frameCount = 24;
  const extractedFrames: string[] = [];

  for (let i = 0; i < frameCount; i++) {
    const pct = i / (frameCount - 1);
    const timestamp = Math.min(Math.max(0.1, pct * targetDurationSeconds), targetDurationSeconds - 0.2);
    const pctStr = Math.round(pct * 100).toString().padStart(3, '0');
    const outFile = path.join(framesDir, `diagnostic_frame_${pctStr}pct.png`);

    execSync(`ffmpeg -hide_banner -loglevel error -y -ss ${timestamp.toFixed(2)} -i "${outMp4}" -vframes 1 "${outFile}"`);
    extractedFrames.push(outFile);
  }

  console.log(`   - Extracted ${extractedFrames.length} keyframes to: ${framesDir} ✅\n`);

  console.log('========================================================================');
  console.log('🏁 DIAGNOSTIC TEST FINISHED');
  console.log('========================================================================');
}

runDiagnostic().catch((err) => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
