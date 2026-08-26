import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function extractPhase6Frames() {
  const videoPath = path.join(process.cwd(), 'PHASE6_SHOWCASE.mp4');
  const outputDir = path.join(process.cwd(), 'storage', 'qa', 'phase6');

  if (!fs.existsSync(videoPath)) {
    console.error(`Video file not found at: ${videoPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const percentages = [
    0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45,
    0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00
  ];

  const totalDurationSeconds = 45.0;
  console.log(`Extracting 21 frames from ${videoPath} to ${outputDir}...`);

  for (let i = 0; i < percentages.length; i++) {
    const pct = percentages[i];
    const pctInt = Math.round(pct * 100);
    const frameFilename = `frame_${pctInt.toString().padStart(3, '0')}pct.png`;
    const framePath = path.join(outputDir, frameFilename);

    const seekSec = Math.min(
      Math.max(0.1, pct * totalDurationSeconds),
      totalDurationSeconds - 0.2
    );

    try {
      await execAsync(`ffmpeg -y -ss ${seekSec.toFixed(2)} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}"`);
      const stats = fs.statSync(framePath);
      console.log(`[${pctInt}% | ${seekSec.toFixed(2)}s] -> ${frameFilename} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error(`Error extracting frame at ${pctInt}%:`, err.message);
    }
  }

  console.log('Extraction of 21 frames for Phase 6 completed successfully.');
}

extractPhase6Frames().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
