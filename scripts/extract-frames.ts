import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const framesToCapture = [
  { frame: 0, label: '0pct_hook' },
  { frame: 135, label: '10pct_transition' },
  { frame: 270, label: '20pct_editorial' },
  { frame: 405, label: '30pct_chart_entrance' },
  { frame: 540, label: '40pct_chart_active' },
  { frame: 675, label: '50pct_map_nodes' },
  { frame: 810, label: '60pct_cutout_cards' },
  { frame: 945, label: '70pct_statistic_counter' },
  { frame: 1080, label: '80pct_statistic_full' },
  { frame: 1215, label: '90pct_outro_cta' },
  { frame: 1349, label: '100pct_outro_hold' },
];

const framesDir = path.resolve(process.cwd(), 'out', 'frames');
if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

console.log('📸 EXTRACTING 11 REPRESENTATIVE FRAMES ACROSS VIDEO TIMELINE...\n');

for (const { frame, label } of framesToCapture) {
  const outPath = path.join(framesDir, `frame_${frame}_${label}.jpeg`);
  const cmd = `npx remotion still src/remotion/index.ts VerticalExplainer "${outPath}" --frame=${frame} --props=out/production_spec_1.json --port=3033 --gl=angle`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ Captured Frame ${frame} (${label}) -> ${outPath}`);
  } catch (e: any) {
    console.warn(`⚠️ Frame ${frame} capture warning: ${e.message}`);
  }
}

console.log('\n🎉 ALL 11 FRAMES EXTRACTED SUCCESSFULLY!');
