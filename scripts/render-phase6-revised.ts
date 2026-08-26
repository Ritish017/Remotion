/**
 * Render the dedicated Phase 6 composition and extract independent review assets.
 * This deliberately does not calculate a human-quality score or claim approval.
 */
import fs from 'fs';
import path from 'path';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);
const root = process.cwd();
const output = path.join(root, 'PHASE6_REVISED_SHOWCASE.mp4');
const qaDir = path.join(root, 'storage', 'qa', 'phase6_revised');
const percentages = Array.from({length: 34}, (_, index) => index === 33 ? 1 : index * 0.03);
const scenes = [
  ['scene1_chip_race.mp4', 0, 6],
  ['scene2_fab.mp4', 6, 6],
  ['scene3_density.mp4', 12, 6],
  ['scene4_supply_chain.mp4', 18, 7],
  ['scene5_architecture.mp4', 25, 8],
  ['scene6_precision.mp4', 33, 7],
  ['scene7_statistic.mp4', 40, 5],
] as const;

async function run(command: string, args: string[]) {
  const quote = (value: string) => `"${value.replace(/"/g, '\\"')}"`;
  await execAsync([command, ...args.map(quote)].join(' '), {cwd: root, windowsHide: true});
}

async function main() {
  fs.mkdirSync(qaDir, {recursive: true});
  fs.mkdirSync(path.join(qaDir, 'clips'), {recursive: true});

  await run('npx', ['remotion', 'render', 'src/remotion/index.ts', 'Phase6RevisedShowcase', output, '--codec=h264', '--crf=20', '--concurrency=1', '--port=3005']);

  for (const pct of percentages) {
    const timestamp = Math.min(Math.max(.1, pct * 45), 44.8);
    const filename = `frame_${Math.round(pct * 100).toString().padStart(3, '0')}pct.png`;
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', timestamp.toFixed(2), '-i', output, '-vframes', '1', path.join(qaDir, filename)]);
  }

  for (const [filename, start, duration] of scenes) {
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(start), '-i', output, '-t', String(duration), '-c', 'copy', path.join(qaDir, 'clips', filename)]);
  }

  console.log(`Rendered ${output}`);
  console.log(`Extracted ${percentages.length} review frames and ${scenes.length} scene clips.`);
  console.log('Human approval: PENDING. Inspect PHASE6_REVISED_VISUAL_AUDIT.md before review.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
