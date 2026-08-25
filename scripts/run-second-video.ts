import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { runContentDirector } from '../src/lib/ai/claude/agents/ContentDirector';
import { runStoryboardDirector } from '../src/lib/ai/claude/agents/StoryboardDirector';
import { runProductionAgent } from '../src/lib/ai/claude/agents/ProductionAgent';
import { runAutomatedQA } from '../src/lib/qa';

async function main() {
  console.log('🚀 CATALYST SECOND VIDEO GENERATION & QA INITIATED\n');

  const outDir = path.resolve(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Topic 2: Quantum Networking
  console.log('🧠 Generating Second Story: Quantum Internet & Entanglement Swapping...');
  const brief = {
    topic: 'The Quantum Internet: How Entanglement Swapping Connected Three Continents',
    targetAudience: 'Physicists, network engineers & futurists',
    vertical: 'tech-futurist',
    brandVoice: 'Scientific, cutting-edge, visionary',
    durationSeconds: 45,
  };

  const content = await runContentDirector(brief);
  const rawScenes = await runStoryboardDirector(content, 30);

  const spec = await runProductionAgent({
    title: content.title || 'The Quantum Internet',
    transcript: content.fullTranscript,
    scenes: rawScenes,
    brandId: 'tech-futurist',
    format: '9:16',
  });

  const qa = runAutomatedQA(spec);
  console.log(`✅ Second Video QA Score: ${qa.score}/100`);

  const specPath = path.join(outDir, 'production_spec_2.json');
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
  console.log(`💾 Saved Second VideoSpec to: ${specPath}`);

  return spec;
}

main().catch((e) => {
  console.error('❌ Failed generating second video:', e);
  process.exit(1);
});
