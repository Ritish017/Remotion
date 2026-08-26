import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const videos = [
  { id: 'video_a', jobId: 'job_prod_1787733024803_391', title: "The Race to Build the World's Most Efficient AI Chips", path: 'storage/renders/job_prod_1787733024803_391/output.mp4' },
  { id: 'video_b', jobId: 'job_prod_1787733263015_664', title: "The Neural Architecture of Next-Gen Humanoids", path: 'storage/renders/job_prod_1787733263015_664/output.mp4' },
  { id: 'video_c', jobId: 'job_prod_1787733468339_847', title: "The High-Frequency Core: How Trillions Move in Nanoseconds", path: 'storage/renders/job_prod_1787733468339_847/output.mp4' },
];

const percentages = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

for (const vid of videos) {
  const absVideoPath = path.resolve(process.cwd(), vid.path);
  const outDir = path.resolve(process.cwd(), 'storage/renders/frames', vid.id);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`\n📸 Extracting 11 Key Frames for ${vid.title} (${vid.id})...`);
  const totalSec = 45.0;

  for (const pct of percentages) {
    const sec = Math.min(totalSec - 0.2, Math.max(0.1, (pct / 100) * totalSec));
    const outFrame = path.join(outDir, `frame_${pct.toString().padStart(3, '0')}pct.png`);

    try {
      execSync(`ffmpeg -y -ss ${sec.toFixed(2)} -i "${absVideoPath}" -vframes 1 -q:v 2 "${outFrame}"`, { stdio: 'ignore' });
      const stat = fs.statSync(outFrame);
      console.log(`   - ${pct}% (${sec.toFixed(1)}s): ${path.basename(outFrame)} (${(stat.size / 1024).toFixed(1)} KB)`);
    } catch (e: any) {
      console.warn(`   ⚠️ Extraction failed at ${pct}%: ${e.message}`);
    }
  }
}
