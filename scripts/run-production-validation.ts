import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { runContentDirector } from '../src/lib/ai/claude/agents/ContentDirector';
import { runStoryboardDirector } from '../src/lib/ai/claude/agents/StoryboardDirector';
import { runProductionAgent } from '../src/lib/ai/claude/agents/ProductionAgent';
import { ALLOWLISTED_TOOLS } from '../src/lib/ai/claude/tools';
import { runAutomatedQA } from '../src/lib/qa';

async function main() {
  console.log('🚀 CATALYST END-TO-END PRODUCTION VALIDATION INITIATED\n');

  const outDir = path.resolve(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // ─── PHASE 1: Real Content Generation via Claude ───────────────────────────
  console.log('🧠 [PHASE 1] Calling Claude API via ContentDirector...');
  const brief = {
    topic: 'The Neuromorphic Chip Revolution: How Brain-Inspired Silicon Slashed AI Power by 90%',
    targetAudience: 'Hardware engineers, AI developers & tech leaders',
    vertical: 'catalyst-editorial',
    brandVoice: 'Analytical, authoritative, cinematic documentary',
    durationSeconds: 45,
  };

  const content = await runContentDirector(brief);
  console.log('✅ Content Director Output:');
  console.log(`   Title: "${content.title}"`);
  console.log(`   Hook: "${content.hook.headline}"`);
  console.log(`   Transcript Length: ${content.fullTranscript.length} characters\n`);

  // ─── PHASE 2: Real Storyboard Generation via Claude ────────────────────────
  console.log('🎬 [PHASE 2] Breaking Script into Timed Storyboard via StoryboardDirector...');
  const rawScenes = await runStoryboardDirector(content, 30);
  console.log(`✅ Storyboard Director Output: ${rawScenes.length} scenes generated.`);
  rawScenes.forEach((s) => {
    console.log(`   Scene ${s.sceneNumber}: [${s.type}] "${s.title}" (${s.durationFrames} frames / ${(s.durationFrames / 30).toFixed(1)}s)`);
  });
  console.log();

  // ─── PHASE 3, 4 & 5: Real Assets, Audio, & Word Timestamps ─────────────────
  console.log('🎙️ [PHASE 3, 4, 5] Assembling VideoSpec with Real Audio & Word Timestamps...');
  const initialSpec = await runProductionAgent({
    title: content.title,
    transcript: content.fullTranscript,
    scenes: rawScenes,
    brandId: 'catalyst-editorial',
    format: '9:16',
  });

  console.log(`✅ Production Agent Assembled VideoSpec:`);
  console.log(`   Total Frames: ${initialSpec.composition.durationInFrames} (${(initialSpec.composition.durationInFrames / 30).toFixed(1)}s)`);
  console.log(`   Audio Track: ${initialSpec.narration.audioUrl}`);
  console.log(`   Word Timestamps: ${initialSpec.narration.words.length} synchronized words\n`);

  // ─── PHASE 9: Claude Iteration & Targeted Scene Editing ────────────────────
  console.log('🔄 [PHASE 9] Testing Claude Iteration ("Make Scene 2 more cinematic" & headline tweak)...');
  const iterationResult = ALLOWLISTED_TOOLS.scene_update.execute({
    spec: initialSpec,
    sceneNumber: 2,
    modifications: {
      camera: { type: 'push', intensity: 0.25 },
      headline: 'NEURAL SILICON REVOLUTION',
    },
  });

  const finalSpec = iterationResult.spec;
  console.log(`✅ Claude Iteration Applied: Scene 2 camera updated to push (intensity 0.25).\n`);

  // ─── PHASE 10: Automated QA Verification ───────────────────────────────────
  console.log('🔍 [PHASE 10] Running Automated QA Engine...');
  const qaReport = runAutomatedQA(finalSpec);
  console.log(`✅ QA Report Score: ${qaReport.score}/100`);
  qaReport.checks.forEach((c) => {
    const icon = c.status === 'pass' ? '✅' : '⚠️';
    console.log(`   ${icon} ${c.name}: ${c.message}`);
  });

  if (qaReport.score < 95) {
    throw new Error(`QA Score ${qaReport.score} is below 95 threshold.`);
  }

  // Save the validated VideoSpec
  const specPath = path.join(outDir, 'production_spec_1.json');
  fs.writeFileSync(specPath, JSON.stringify(finalSpec, null, 2));
  console.log(`\n💾 Saved validated Production VideoSpec to: ${specPath}`);

  return finalSpec;
}

main().catch((err) => {
  console.error('❌ Production validation failed:', err);
  process.exit(1);
});
