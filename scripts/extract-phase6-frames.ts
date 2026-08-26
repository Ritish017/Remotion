import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';

const root = process.cwd();
const videoPath = path.join(root, 'PHASE6_REVISED_SHOWCASE.mp4');
const qaDir = path.join(root, 'storage', 'qa', 'phase6_revised');
const clipsDir = path.join(qaDir, 'clips');

fs.mkdirSync(qaDir, {recursive: true});
fs.mkdirSync(clipsDir, {recursive: true});

const percentages = Array.from({length: 34}, (_, i) => i === 33 ? 1.0 : i * 0.03);

console.log(`Extracting ${percentages.length} frames from ${videoPath}...`);

percentages.forEach((pct) => {
  const timestamp = Math.min(Math.max(0.1, pct * 45), 44.8);
  const pctStr = Math.round(pct * 100).toString().padStart(3, '0');
  const outFile = path.join(qaDir, `frame_${pctStr}pct.png`);
  execSync(`ffmpeg -hide_banner -loglevel error -y -ss ${timestamp.toFixed(2)} -i "${videoPath}" -vframes 1 "${outFile}"`);
});

console.log('Extracted all review frames.');

const scenes = [
  {name: 'scene1_the_race_is_silicon.mp4', start: 0, dur: 6},
  {name: 'scene2_the_fab.mp4', start: 6, dur: 6},
  {name: 'scene3_twenty_four_months.mp4', start: 12, dur: 7},
  {name: 'scene4_the_chip_is_global.mp4', start: 19, dur: 7},
  {name: 'scene5_city_of_logic.mp4', start: 26, dur: 8},
  {name: 'scene6_the_last_micron.mp4', start: 34, dur: 6},
  {name: 'scene7_100x_throughput.mp4', start: 40, dur: 5},
];

console.log('Extracting scene clips...');
scenes.forEach((sc) => {
  const outFile = path.join(clipsDir, sc.name);
  execSync(`ffmpeg -hide_banner -loglevel error -y -ss ${sc.start} -i "${videoPath}" -t ${sc.dur} -c copy "${outFile}"`);
});

console.log('Done extracting QA assets.');
