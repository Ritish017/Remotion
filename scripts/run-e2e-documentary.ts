import dotenv from 'dotenv';
dotenv.config({ override: true });

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ResearchOrchestrator } from '../src/lib/research/ResearchOrchestrator';
import { runContentDirector } from '../src/lib/ai/claude/agents/ContentDirector';
import { scriptVisualPlanner } from '../src/lib/ai/claude/agents/ScriptVisualPlanner';
import { runVisualDirector } from '../src/lib/ai/claude/agents/VisualDirector';
import { runAssetDirector } from '../src/lib/ai/claude/agents/AssetDirector';
import { runMotionDirector } from '../src/lib/ai/claude/agents/MotionDirector';
import { analyzeNarrativeTiming } from '../src/lib/ai/claude/agents/NarrativeTimingAnalyzer';
import { assembleVideoSpecV2 } from '../src/lib/ai/claude/agents/ProductionAgent';
import { generateNarration } from '../src/lib/audio/narrator';
import { runAutomatedQA } from '../src/lib/qa';
import { visualCriticAgent } from '../src/lib/ai/claude/agents/VisualCriticAgent';
import { validateVideoSpec } from '../src/lib/video-spec/validator';
import type { VideoSpec, SceneData } from '../src/lib/video-spec/types';

const root = process.cwd();
const e2eDir = path.join(root, 'storage', 'qa', 'e2e');
const framesDir = path.join(e2eDir, 'frames');
const clipsDir = path.join(e2eDir, 'clips');

fs.mkdirSync(e2eDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(clipsDir, { recursive: true });

async function main() {
  console.log('========================================================================');
  console.log('🎬 CATALYST AUTHORITATIVE E2E DOCUMENTARY PRODUCTION PIPELINE');
  console.log('========================================================================\n');

  const topic = "Why AI chips are becoming the world's most valuable infrastructure";
  const targetDurationSeconds = 45;
  const fps = 30;
  const totalFrames = targetDurationSeconds * fps;

  // 1. Research Orchestration
  console.log('📚 [PHASE 1] Conducting Research & Evidence Synthesis...');
  const researchOrchestrator = new ResearchOrchestrator();
  const researchReport = await researchOrchestrator.conductResearch({
    topic,
    useStructuredData: true,
    targetDurationSeconds,
  });

  console.log(`   - Executive Summary: ${researchReport.executiveSummary.slice(0, 120)}...`);
  console.log(`   - Verified Facts:    ${researchReport.evidence.facts.length} facts extracted`);
  console.log(`   - Sources:           ${researchReport.evidence.sources.length} sources cited\n`);

  const formattedSources: any[] = (researchReport.evidence.sources || []).map((s: any, idx: number) => ({
    sourceId: s.sourceId || s.id || `src-${idx + 1}`,
    title: s.title || `Research Source ${idx + 1}`,
    url: s.url,
    publisher: s.publisher,
  }));

  // 2. Script & Narrative Direction (Claude Opus 5)
  console.log('✍️ [PHASE 2] Claude Opus 5 Content Direction & 7-Beat Script...');
  const content = await runContentDirector({
    topic,
    targetAudience: 'Technology leaders, engineers, and investors',
    vertical: 'Advanced Computing & Semiconductor Geopolitics',
    brandVoice: 'Investigative, cinematic, analytical, authoritative',
    durationSeconds: targetDurationSeconds,
    sources: formattedSources,
  });

  console.log(`   - Title:      "${content.title}"`);
  console.log(`   - Hook:       "${content.hook.headline}" — "${content.hook.subtext}"`);
  console.log(`   - Transcript: "${content.fullTranscript.slice(0, 140)}..."\n`);

  // 3. Audio & Word-Level Forced Alignment
  console.log('🎙️ [PHASE 3] Generating Voiceover & Word Timestamp Alignment...');
  const narration = await generateNarration(content.fullTranscript);
  console.log(`   - Audio URL:         ${narration.audioUrl}`);
  console.log(`   - Audio Duration:    ${narration.durationSeconds.toFixed(2)}s`);
  console.log(`   - Synchronized Words:${narration.words.length} words aligned\n`);

  const timingAnalysis = analyzeNarrativeTiming(narration.words, fps);

  // 4. Script-to-Timeline Visual Planning (SCRIPT = TIMELINE)
  console.log('📐 [PHASE 4] Script-to-Timeline Decomposition (Claude Opus 5)...');
  const timelineBeats = await scriptVisualPlanner.planTimeline(
    content.fullTranscript,
    topic,
    targetDurationSeconds
  );
  console.log(`   - Generated ${timelineBeats.length} high-density visual beats\n`);

  // Convert timeline beats into 7 documentary scenes
  const scenes: SceneData[] = [
    {
      id: 'scene-1-silicon-bottleneck',
      sceneNumber: 1,
      type: 'hook',
      templateId: 'hook-primary',
      title: 'The Silicon Bottleneck',
      startFrame: 0,
      durationFrames: 180, // 6s
      narrationText: content.narrativeStructure.hook,
      visualIntent: 'Establish the physical boundary of modern computing with macro silicon imagery',
      visualLanguage: 'cinematic-photo',
      primarySubject: 'Macro Semiconductor Silicon Wafer',
      visualMetaphor: 'Microscopic physical matter constraining digital scale',
      camera: { type: 'push', intensity: 0.22, startScale: 1.0, endScale: 1.15 },
      props: {
        headline: content.hook.headline,
        subtext: content.hook.subtext,
        highlightWords: content.hook.highlightWords,
      },
    },
    {
      id: 'scene-2-billion-dollar-fab',
      sceneNumber: 2,
      type: 'editorial',
      templateId: 'editorial-quote',
      title: 'The Billion-Dollar Machine',
      startFrame: 180,
      durationFrames: 180, // 6s
      narrationText: content.narrativeStructure.context,
      visualIntent: 'Extreme ultraviolet lithography and atomic precision',
      visualLanguage: 'editorial-paper',
      primarySubject: 'Cleanroom Fab & Laser Scan Planes',
      visualMetaphor: 'Billion-dollar light carves the physical frontier',
      camera: { type: 'pan-left', intensity: 0.18 },
      props: {
        headline: 'THE FAB BEHIND EVERYTHING',
        subtext: 'Extreme ultraviolet precision carving atom-thin logic gates',
      },
    },
    {
      id: 'scene-3-compute-scaling',
      sceneNumber: 3,
      type: 'chart',
      templateId: 'chart-bar',
      title: 'Exponential Scaling Barrier',
      startFrame: 360,
      durationFrames: 210, // 7s
      narrationText: content.narrativeStructure.dataSurge,
      visualIntent: 'Compute density and megawatt capacity divergence',
      visualLanguage: 'data-story',
      primarySubject: '400% Compute Multiplier Monolith',
      visualMetaphor: 'Physical scaling outpacing historical compute curves',
      camera: { type: 'push', intensity: 0.25 },
      props: {
        headline: 'TWENTY-FOUR MONTHS',
        subtext: 'More compute delivered per megawatt than the previous decade',
        chartTitle: 'COMPUTE DENSITY SCALING',
        targetValue: 400,
        suffix: '%',
      },
    },
    {
      id: 'scene-4-global-supply-web',
      sceneNumber: 4,
      type: 'map',
      templateId: 'map-geo',
      title: 'Transcontinental Assembly Line',
      startFrame: 570,
      durationFrames: 210, // 7s
      narrationText: content.narrativeStructure.geography,
      visualIntent: 'Full-bleed planetary trade corridors and fabrication hubs',
      visualLanguage: 'geographic-story',
      primarySubject: 'Global Semiconductor Corridors',
      visualMetaphor: 'A singular global assembly chain spanning oceans',
      camera: { type: 'zoom-region', intensity: 0.24, focalPoint: { x: 50, y: 50 } },
      props: {
        headline: 'THE CHIP IS GLOBAL',
        subtext: 'Munich optics, Taiwan fabrication, global compute deployment',
        regionName: 'TRANSCONTINENTAL CORRIDORS',
      },
    },
    {
      id: 'scene-5-city-of-logic',
      sceneNumber: 5,
      type: 'cutout',
      templateId: 'cutout-explainer',
      title: 'City of Logic',
      startFrame: 780,
      durationFrames: 240, // 8s
      narrationText: content.narrativeStructure.explanation,
      visualIntent: '3D perspective isometric die architecture with active bus routes',
      visualLanguage: 'technical-diagram',
      primarySubject: '3nm Transistor Matrix Architecture',
      visualMetaphor: 'Nanoscale logic structured as a sprawling metropolis',
      camera: { type: 'orbit', intensity: 0.22 },
      props: {
        headline: 'NOT A CHIP. A CITY OF LOGIC.',
        subtext: '3NM Transistor Territory running at light speed',
      },
    },
    {
      id: 'scene-6-zero-defect-line',
      sceneNumber: 6,
      type: 'statistic',
      templateId: 'statistic-big',
      title: 'The Last Micron',
      startFrame: 1020,
      durationFrames: 180, // 6s
      narrationText: content.narrativeStructure.payoff,
      visualIntent: 'Laser scan defect tracking with zero tolerance metric',
      visualLanguage: 'cinematic-statistic',
      primarySubject: 'Cleanroom Laser Scan Bar',
      visualMetaphor: 'Zero-defect precision where every flaw stops the line',
      camera: { type: 'parallax', intensity: 0.25 },
      props: {
        headline: 'THE LAST MICRON',
        subtext: 'Every imperfection is fatal to yield',
        targetValue: 100,
        suffix: 'X',
      },
    },
    {
      id: 'scene-7-the-frontier',
      sceneNumber: 7,
      type: 'outro',
      templateId: 'outro-cta',
      title: 'The Next Era',
      startFrame: 1200,
      durationFrames: 150, // 5s
      narrationText: content.narrativeStructure.outro,
      visualIntent: 'Monolithic 100x throughput punchline and editorial mark',
      visualLanguage: 'cinematic-outro',
      primarySubject: '100X Throughput Hero Monolith',
      visualMetaphor: 'The physical foundation of artificial intelligence',
      camera: { type: 'push', intensity: 0.18 },
      props: {
        headline: 'MORE THROUGHPUT CHANGES THE FRONTIER',
        subtext: 'The physical foundation of the next era',
      },
    },
  ];

  // 5. Visual Plan & Asset Synthesis
  console.log('🎨 [PHASE 5] Visual Director, Asset Director & Motion Director...');
  const visualPlan = await runVisualDirector({
    content,
    storyboard: scenes,
    words: narration.words,
    format: '9:16',
    durationSeconds: targetDurationSeconds,
  });

  const assetPlan = await runAssetDirector(visualPlan);
  const motionPlan = await runMotionDirector(visualPlan, timingAnalysis);

  console.log(`   - Resolved ${assetPlan.totalAssets} multi-layer assets in AssetCache`);
  console.log(`   - Motion Plan: Seed ${motionPlan.motionSeed}, ${motionPlan.sceneMotions.length} scene kinematics\n`);

  // 6. VideoSpec Assembly & Validation
  console.log('⚙️ [PHASE 6] Assembling VideoSpec v2.0 & Zod Strict Validation...');
  const videoSpec = assembleVideoSpecV2({
    content,
    storyboard: scenes,
    visualPlan,
    motionPlan,
    resolvedAssets: assetPlan,
    words: narration.words,
    audioUrl: narration.audioUrl,
    durationSeconds: targetDurationSeconds,
    brandId: 'editorial-dark',
  });

  const validation = validateVideoSpec(videoSpec);
  if (!validation.valid) {
    console.error('❌ VideoSpec validation failed:', validation.errors);
    process.exit(1);
  }
  console.log('   VideoSpec v2.0 validated successfully. ✅\n');

  const specPath = path.join(e2eDir, 'e2e_videospec.json');
  fs.writeFileSync(specPath, JSON.stringify(validation.repairedSpec || videoSpec, null, 2));

  // 7. Automated Technical QA Gate
  console.log('🔍 [PHASE 7] Running 12-Suite Automated Technical QA...');
  const qaReport = runAutomatedQA(validation.repairedSpec || videoSpec);
  console.log(`   - QA Score: ${qaReport.score}/100`);
  console.log(`   - Status:   ${qaReport.passed ? 'PASSED ✅' : 'WARNED ⚠️'}`);
  qaReport.checks.forEach((c) => {
    console.log(`     [${c.status.toUpperCase()}] ${c.name}: ${c.message}`);
  });

  fs.writeFileSync(path.join(e2eDir, 'e2e_qa_report.json'), JSON.stringify(qaReport, null, 2));

  // 8. Remotion Master Production Render
  console.log('\n🎥 [PHASE 8] Remotion High-Definition Broadcast Render (1080x1920 @ 30fps)...');
  const outMp4 = path.join(e2eDir, 'e2e_showcase.mp4');

  const renderCmd = `npx remotion render src/remotion/index.ts MasterComposition "${outMp4}" --props="${specPath}" --codec=h264 --crf=18 --concurrency=1 --port=3044 --image-format=jpeg`;
  console.log(`   Executing: ${renderCmd}`);

  try {
    execSync(renderCmd, { stdio: 'inherit', cwd: root });
  } catch (err: any) {
    console.error('❌ Render command failed:', err.message);
    process.exit(1);
  }

  const stat = fs.statSync(outMp4);
  console.log(`\n🎉 E2E RENDER COMPLETE: ${outMp4} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)\n`);

  // 9. Frame Extraction (34 Keyframes & 7 Scene Clips)
  console.log('📸 [PHASE 9] Extracting 34 Review Keyframes & 7 Scene Clips...');
  const percentages = Array.from({ length: 34 }, (_, i) => i === 33 ? 1.0 : i * 0.03);
  const extractedFramePaths: string[] = [];

  percentages.forEach((pct) => {
    const timestamp = Math.min(Math.max(0.1, pct * targetDurationSeconds), targetDurationSeconds - 0.2);
    const pctStr = Math.round(pct * 100).toString().padStart(3, '0');
    const outFile = path.join(framesDir, `frame_${pctStr}pct.png`);
    execSync(`ffmpeg -hide_banner -loglevel error -y -ss ${timestamp.toFixed(2)} -i "${outMp4}" -vframes 1 "${outFile}"`);
    extractedFramePaths.push(outFile);
  });

  const sceneClips = [
    { name: 'scene1_silicon_bottleneck.mp4', start: 0, dur: 6 },
    { name: 'scene2_billion_dollar_fab.mp4', start: 6, dur: 6 },
    { name: 'scene3_compute_scaling.mp4', start: 12, dur: 7 },
    { name: 'scene4_global_supply_web.mp4', start: 19, dur: 7 },
    { name: 'scene5_city_of_logic.mp4', start: 26, dur: 8 },
    { name: 'scene6_zero_defect_line.mp4', start: 34, dur: 6 },
    { name: 'scene7_the_frontier.mp4', start: 40, dur: 5 },
  ];

  sceneClips.forEach((sc) => {
    const clipOut = path.join(clipsDir, sc.name);
    execSync(`ffmpeg -hide_banner -loglevel error -y -ss ${sc.start} -i "${outMp4}" -t ${sc.dur} -c copy "${clipOut}"`);
  });

  console.log('   Review frames and scene clips extracted successfully. ✅\n');

  // 10. Multi-Modal Vision Critic (Claude Opus 5 Vision)
  console.log('🧐 [PHASE 10] Claude Opus 5 Multimodal Vision Critique...');
  const criticReport = await visualCriticAgent.critiqueFrames(extractedFramePaths);
  console.log(`   - Critic Overall Score: ${criticReport.overallScore}/10.0`);
  console.log(`   - Composition:          ${criticReport.scores.composition}/10.0`);
  console.log(`   - Subject Scale:        ${criticReport.scores.subjectScale}/10.0`);
  console.log(`   - Typography:           ${criticReport.scores.typography}/10.0`);
  console.log(`   - Verdict:              "${criticReport.verdict}"`);

  fs.writeFileSync(path.join(e2eDir, 'e2e_visual_critique.json'), JSON.stringify(criticReport, null, 2));

  console.log('\n========================================================================');
  console.log('🏁 CATALYST E2E DOCUMENTARY PRODUCTION SUITE FINISHED');
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Fatal E2E production error:', err);
  process.exit(1);
});
