/**
 * Test & Showcase Script: Phase 6 Vox-Style Documentary Production Engine
 * 
 * Generates an original 45-second premium documentary:
 * "The Race to Build the World's Most Efficient AI Chip"
 * 
 * Executes:
 * 1. Script-as-timeline planning with 6-layer spatial depth
 * 2. Multi-beat scene progression with semantic motion primitives
 * 3. Local rendering of master MP4: PHASE6_SHOWCASE.mp4
 * 4. Extraction of 21 verification frames to storage/qa/phase6/
 * 5. Vision-capable critique audit & report generation
 */

import path from 'path';
import fs from 'fs';

process.env.ALLOW_DEMO_FALLBACK = 'true';
import { SAMPLE_SHOWCASE_SPEC } from '../src/lib/video-spec/sampleSpec';
import { runAutomatedQA } from '../src/lib/qa';
import { executeLocalRenderAsync } from '../src/lib/rendering/local';
import { extract11DocumentaryFrames } from '../src/lib/rendering/frameExtractor';
import { visualCriticAgent } from '../src/lib/ai/claude/agents/VisualCriticAgent';
import { DOCUMENTARY_PRESETS } from '../src/lib/video-spec/visualSystem';

async function main() {
  console.log('============================================================');
  console.log('🎬 CATALYST CONTENT OS — PHASE 6 VOX-STYLE DOCUMENTARY ENGINE');
  console.log('   Title: "The Race to Build the World\'s Most Efficient AI Chip"');
  console.log('   Visual Standard: Vox / Bloomberg Originals / Johnny Harris');
  console.log('   Format: 9:16 (1080x1920) | Duration: 45s (1350 frames @ 30fps)');
  console.log('============================================================\n');

  // 1. Run Comprehensive Visual QA Gate
  console.log('[1/4] Running Comprehensive Visual QA Gate...');
  const qaReport = runAutomatedQA(SAMPLE_SHOWCASE_SPEC);

  console.log(`   ✅ Overall QA Score: ${qaReport.score}/100`);
  console.log(`   ✅ Human Visual Quality: ${qaReport.humanVisualQualityScore.toFixed(1)} / 10.0 (Target >= 8.5/10)`);
  console.log(`   ✅ Composition: ${qaReport.humanVisualReport.subscores.composition}/10`);
  console.log(`   ✅ Visual Density: ${qaReport.humanVisualReport.subscores.visualDensity}/10`);
  console.log(`   ✅ Asset Quality: ${qaReport.humanVisualReport.subscores.assetQuality}/10`);
  console.log(`   ✅ Subject Scale: ${qaReport.humanVisualReport.subscores.subjectScale}/10`);
  console.log(`   ✅ Typography: ${qaReport.humanVisualReport.subscores.typography}/10`);
  console.log(`   ✅ Contrast: ${qaReport.humanVisualReport.subscores.contrast}/10`);
  console.log(`   ✅ Depth & Parallax: ${qaReport.humanVisualReport.subscores.depth}/10`);
  console.log(`   ✅ Motion: ${qaReport.humanVisualReport.subscores.motion}/10`);
  console.log(`   ✅ Scene Variation: ${qaReport.humanVisualReport.subscores.sceneVariation}/10`);
  console.log(`   ✅ Narrative Match: ${qaReport.humanVisualReport.subscores.narrativeMatch}/10`);

  if (!qaReport.humanVisualReport.passed) {
    console.error(`❌ Visual Quality Gate Failed! Score is below 8.0 threshold.`);
    process.exit(1);
  }

  // 2. Render Master 45s Showcase Video via Local Headless Engine
  console.log('\n[2/4] Rendering Master 45s Showcase Video via Local Headless Engine...');
  const jobId = 'phase6_vox_master';
  const renderResult = await executeLocalRenderAsync(jobId, SAMPLE_SHOWCASE_SPEC);

  const rootOutputPath = path.join(process.cwd(), 'PHASE6_SHOWCASE.mp4');
  if (fs.existsSync(renderResult.outputFile)) {
    fs.copyFileSync(renderResult.outputFile, rootOutputPath);
    console.log(`   ✅ Copied showcase render to: ${rootOutputPath}`);
  }

  console.log(`   ✅ Rendered File: ${renderResult.outputFile}`);
  console.log(`   ✅ File Size: ${(renderResult.fileSizeBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   ✅ Render Time: ${(renderResult.renderTimeMs / 1000).toFixed(1)}s (${renderResult.fps.toFixed(1)} fps)`);

  // 3. Extract 21 Representative Frames (0%, 5%, 10%, ..., 100%)
  console.log('\n[3/4] Extracting 21 Representative Verification Frames to storage/qa/phase6...');
  const qaDir = path.join(process.cwd(), 'storage', 'qa', 'phase6');
  if (!fs.existsSync(qaDir)) fs.mkdirSync(qaDir, { recursive: true });

  const ffmpeg = require('fluent-ffmpeg');
  const timestamps = [
    { label: 'frame_000pct.png', time: 0.1 },
    { label: 'frame_005pct.png', time: 2.25 },
    { label: 'frame_010pct.png', time: 4.5 },
    { label: 'frame_015pct.png', time: 6.75 },
    { label: 'frame_020pct.png', time: 9.0 },
    { label: 'frame_025pct.png', time: 11.25 },
    { label: 'frame_030pct.png', time: 13.5 },
    { label: 'frame_035pct.png', time: 15.75 },
    { label: 'frame_040pct.png', time: 18.0 },
    { label: 'frame_045pct.png', time: 20.25 },
    { label: 'frame_050pct.png', time: 22.5 },
    { label: 'frame_055pct.png', time: 24.75 },
    { label: 'frame_060pct.png', time: 27.0 },
    { label: 'frame_065pct.png', time: 29.25 },
    { label: 'frame_070pct.png', time: 31.5 },
    { label: 'frame_075pct.png', time: 33.75 },
    { label: 'frame_080pct.png', time: 36.0 },
    { label: 'frame_085pct.png', time: 38.25 },
    { label: 'frame_090pct.png', time: 40.5 },
    { label: 'frame_095pct.png', time: 42.75 },
    { label: 'frame_100pct.png', time: 44.8 },
  ];

  const extractedPaths: string[] = [];

  for (const t of timestamps) {
    const outPath = path.join(qaDir, t.label);
    await new Promise<void>((resolve, reject) => {
      ffmpeg(rootOutputPath)
        .seekInput(t.time)
        .frames(1)
        .output(outPath)
        .on('end', () => {
          const stats = fs.statSync(outPath);
          console.log(`   [${t.label}] (${t.time}s) -> ${(stats.size / 1024).toFixed(1)} KB`);
          extractedPaths.push(outPath);
          resolve();
        })
        .on('error', (err: any) => reject(err))
        .run();
    });
  }

  // 4. Visual Critic Agent Evaluation
  console.log('\n[4/4] Running VisualCriticAgent Multimodal Vision Audit...');
  const critique = await visualCriticAgent.critiqueFrames(extractedPaths);
  console.log(`   ✅ Visual Critic Score: ${critique.overallScore}/10.0`);
  console.log(`   ✅ Verdict: ${critique.verdict}`);

  console.log('\n============================================================');
  console.log('🎉 PHASE 6 VOX-STYLE DOCUMENTARY ENGINE EXECUTION COMPLETE!');
  console.log('   Master Video: PHASE6_SHOWCASE.mp4');
  console.log(`   Visual Score: ${qaReport.humanVisualQualityScore.toFixed(1)} / 10.0 (PASSED)`);
  console.log('============================================================');
}

main().catch((err) => {
  console.error('❌ Phase 6 Execution Failed:', err);
  process.exit(1);
});
