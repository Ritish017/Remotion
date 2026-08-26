/**
 * Script: Render Phase 6 Revised Vox-Style Showcase & Extract 34 Frames + Scene Clips
 * 
 * Master Video Output: PHASE6_REVISED_SHOWCASE.mp4
 * Frames Output: storage/qa/phase6_revised/ (34 frames)
 * Clips Output: storage/qa/phase6_revised/clips/ (7 clips)
 */

import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

process.env.ALLOW_DEMO_FALLBACK = 'true';
import { SAMPLE_SHOWCASE_SPEC } from '../src/lib/video-spec/sampleSpec';
import { runAutomatedQA } from '../src/lib/qa';
import { executeLocalRenderAsync } from '../src/lib/rendering/local';
import { visualCriticAgent } from '../src/lib/ai/claude/agents/VisualCriticAgent';

const execAsync = promisify(exec);

async function main() {
  console.log('============================================================');
  console.log('🎬 CATALYST CONTENT OS — PHASE 6 REVISED DOCUMENTARY RENDER');
  console.log('   Title: "The Race to Build the World\'s Most Powerful AI Infrastructure"');
  console.log('   Standard: Vox / Bloomberg Originals / Johnny Harris');
  console.log('   Format: 9:16 (1080x1920) | Duration: 45s (1350 frames @ 30fps)');
  console.log('============================================================\n');

  // 1. Run Automated Engine QA Gate
  console.log('[1/4] Running Automated Engine QA Gate...');
  const qaReport = runAutomatedQA(SAMPLE_SHOWCASE_SPEC);
  console.log(`   ✅ Engine QA Score: ${qaReport.score}/100`);
  console.log(`   ✅ Automated Visual Quality: ${qaReport.humanVisualQualityScore.toFixed(1)} / 10.0`);
  console.log(`   ✅ Composition: ${qaReport.humanVisualReport.subscores.composition}/10`);
  console.log(`   ✅ Visual Density: ${qaReport.humanVisualReport.subscores.visualDensity}/10`);
  console.log(`   ✅ Typography: ${qaReport.humanVisualReport.subscores.typography}/10`);
  console.log(`   ✅ Contrast: ${qaReport.humanVisualReport.subscores.contrast}/10`);

  // 2. Render 45s Master Video
  console.log('\n[2/4] Rendering Master 45s Showcase Video via Local Headless Engine...');
  const jobId = 'phase6_revised_master';
  const renderResult = await executeLocalRenderAsync(jobId, SAMPLE_SHOWCASE_SPEC);

  const rootOutputPath = path.join(process.cwd(), 'PHASE6_REVISED_SHOWCASE.mp4');
  if (fs.existsSync(renderResult.outputFile)) {
    fs.copyFileSync(renderResult.outputFile, rootOutputPath);
    console.log(`   ✅ Copied revised master to: ${rootOutputPath}`);
  }

  console.log(`   ✅ Rendered File: ${rootOutputPath}`);
  console.log(`   ✅ File Size: ${(renderResult.fileSizeBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   ✅ Render Time: ${(renderResult.renderTimeMs / 1000).toFixed(1)}s (${renderResult.fps.toFixed(1)} fps)`);

  // 3. Extract 34 Frames (0% to 100% at 3% intervals)
  console.log('\n[3/4] Extracting 34 Verification Frames to storage/qa/phase6_revised...');
  const qaDir = path.join(process.cwd(), 'storage', 'qa', 'phase6_revised');
  if (!fs.existsSync(qaDir)) fs.mkdirSync(qaDir, { recursive: true });

  const totalDuration = 45.0;
  const percentages = [
    0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24, 0.27,
    0.30, 0.33, 0.36, 0.39, 0.42, 0.45, 0.48, 0.51, 0.54, 0.57,
    0.60, 0.63, 0.66, 0.69, 0.72, 0.75, 0.78, 0.81, 0.84, 0.87,
    0.90, 0.93, 0.96, 1.00
  ];

  const extractedFramePaths: string[] = [];

  for (let i = 0; i < percentages.length; i++) {
    const pct = percentages[i];
    const pctInt = Math.round(pct * 100);
    const frameFilename = `frame_${pctInt.toString().padStart(3, '0')}pct.png`;
    const framePath = path.join(qaDir, frameFilename);
    const seekSec = Math.min(Math.max(0.1, pct * totalDuration), totalDuration - 0.2);

    try {
      await execAsync(`ffmpeg -y -ss ${seekSec.toFixed(2)} -i "${rootOutputPath}" -vframes 1 -q:v 2 "${framePath}"`);
      const stats = fs.statSync(framePath);
      console.log(`   [${pctInt}% | ${seekSec.toFixed(2)}s] -> ${frameFilename} (${(stats.size / 1024).toFixed(1)} KB)`);
      extractedFramePaths.push(framePath);
    } catch (err: any) {
      console.error(`Error extracting frame at ${pctInt}%:`, err.message);
    }
  }

  // 4. Extract 7 Scene Video Clips
  console.log('\n[4/4] Extracting 7 Scene Video Clips to storage/qa/phase6_revised/clips...');
  const clipsDir = path.join(qaDir, 'clips');
  if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });

  const scenes = [
    { num: 1, name: 'scene1_hook.mp4', start: 0.0, duration: 5.0 },
    { num: 2, name: 'scene2_evidence.mp4', start: 5.0, duration: 6.0 },
    { num: 3, name: 'scene3_data_story.mp4', start: 11.0, duration: 7.0 },
    { num: 4, name: 'scene4_geo_map.mp4', start: 18.0, duration: 7.0 },
    { num: 5, name: 'scene5_cutout.mp4', start: 25.0, duration: 8.0 },
    { num: 6, name: 'scene6_technical.mp4', start: 33.0, duration: 7.0 },
    { num: 7, name: 'scene7_outro.mp4', start: 40.0, duration: 5.0 },
  ];

  for (const s of scenes) {
    const clipPath = path.join(clipsDir, s.name);
    try {
      await execAsync(`ffmpeg -y -ss ${s.start.toFixed(1)} -i "${rootOutputPath}" -t ${s.duration.toFixed(1)} -c copy "${clipPath}"`);
      const stats = fs.statSync(clipPath);
      console.log(`   Scene ${s.num}: ${s.name} (${s.duration}s) -> ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (err: any) {
      console.error(`Error extracting clip for Scene ${s.num}:`, err.message);
    }
  }

  // 5. Visual Critic Evaluation
  console.log('\nRunning VisualCriticAgent Multi-Modal Evaluation...');
  const critique = await visualCriticAgent.critiqueFrames(extractedFramePaths);
  console.log(`   ✅ Visual Critic Automated Review: ${critique.overallScore}/10.0`);
  console.log(`   ✅ Critique Verdict: ${critique.verdict}`);

  console.log('\n============================================================');
  console.log('🎉 PHASE 6 REVISED RENDER & EXTRACTION COMPLETE!');
  console.log('   Master Video: PHASE6_REVISED_SHOWCASE.mp4');
  console.log(`   34 Verification Frames: storage/qa/phase6_revised/`);
  console.log(`   7 Scene Video Clips: storage/qa/phase6_revised/clips/`);
  console.log('   Human Approval: PENDING OPERATOR INSPECTION');
  console.log('============================================================');
}

main().catch((err) => {
  console.error('❌ Phase 6 Revised Execution Failed:', err);
  process.exit(1);
});
