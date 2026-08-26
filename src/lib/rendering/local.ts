import path from 'path';
import fs from 'fs';
import os from 'os';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import type { VideoSpec } from '@/lib/video-spec/types';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import { StorageFactory } from '@/lib/storage';
import { DatabaseFactory } from '@/lib/database';

export interface LocalRenderOptions {
  spec: VideoSpec;
  jobId?: string;
  projectId?: string;
  episodeId?: string;
}

export interface LocalRenderResult {
  jobId: string;
  status: 'QUEUED' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  outputPath?: string;
  publicUrl?: string;
  durationInFrames?: number;
  durationSeconds?: number;
  errorCode?: string;
  error?: string;
}

let cachedBundleLocation: string | null = null;
let bundlePromise: Promise<string> | null = null;

async function getOrBuildBundle(): Promise<string> {
  if (cachedBundleLocation && fs.existsSync(cachedBundleLocation)) {
    return cachedBundleLocation;
  }

  if (bundlePromise) {
    return bundlePromise;
  }

  const entryPoint = path.resolve(process.cwd(), 'src/remotion/index.ts');
  console.log(`[LocalRenderer] Bundling Remotion project at ${entryPoint}...`);

  bundlePromise = bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias || {}),
          '@': path.resolve(process.cwd(), 'src'),
        },
      },
    }),
  }).then((bundleLocation) => {
    cachedBundleLocation = bundleLocation;
    console.log(`[LocalRenderer] Bundle created successfully at: ${bundleLocation}`);
    return bundleLocation;
  }).catch((err) => {
    bundlePromise = null;
    throw err;
  });

  return bundlePromise;
}

export async function createLocalRenderJob(options: LocalRenderOptions): Promise<LocalRenderResult> {
  const db = DatabaseFactory.getProvider();
  const validation = validateVideoSpec(options.spec);
  const spec = validation.repairedSpec || options.spec;
  const jobId = options.jobId || `render_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (!validation.valid && !validation.repairedSpec) {
    const errorMsg = `VideoSpec validation failed: ${validation.errors.join(', ')}`;
    await db.createRenderJob({
      id: jobId,
      projectId: options.projectId,
      episodeId: options.episodeId,
      compositionId: 'MasterComposition',
      status: 'FAILED',
      progress: 0,
      errorCode: 'INVALID_VIDEO_SPEC',
      errorMessage: errorMsg,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    return {
      jobId,
      status: 'FAILED',
      errorCode: 'INVALID_VIDEO_SPEC',
      error: errorMsg,
    };
  }

  const storage = StorageFactory.getProvider();

  // 1. Initial State: QUEUED
  await db.createRenderJob({
    id: jobId,
    projectId: options.projectId,
    episodeId: options.episodeId,
    compositionId: 'MasterComposition',
    status: 'QUEUED',
    progress: 0,
    spec,
    startedAt: new Date().toISOString(),
  });

  // 2. Launch async render in background
  executeLocalRenderAsync(jobId, spec).catch(async (err) => {
    console.error(`❌ [LocalRenderer] Fatal error rendering job [${jobId}]:`, err);
    await db.updateRenderJob(jobId, {
      status: 'FAILED',
      errorCode: 'RENDER_EXECUTION_FAILED',
      errorMessage: err.message,
      completedAt: new Date().toISOString(),
    });
  });

  return {
    jobId,
    status: 'RENDERING',
    durationInFrames: spec.composition?.durationInFrames,
    durationSeconds: spec.composition?.durationInFrames ? spec.composition.durationInFrames / (spec.composition.fps || 30) : undefined,
  };
}

export interface RenderExecutionStats {
  outputFile: string;
  renderTimeMs: number;
  fps: number;
  fileSizeBytes: number;
}

export async function executeLocalRenderAsync(jobId: string, spec: VideoSpec): Promise<RenderExecutionStats> {
  const db = DatabaseFactory.getProvider();
  const storage = StorageFactory.getProvider();

  const outputRelativePath = `renders/${jobId}/output.mp4`;
  const outputAbsolutePath = storage.getAbsolutePath(outputRelativePath);

  const parentDir = path.dirname(outputAbsolutePath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const renderStart = Date.now();

  try {
    // Transition to RENDERING
    await db.updateRenderJob(jobId, {
      status: 'RENDERING',
      progress: 0.05,
    });

    // Resolve audio tracks into self-contained base64 data URIs for headless Remotion renderer
    const renderSpec: VideoSpec = JSON.parse(JSON.stringify(spec));
    
    const resolveToDataUri = (audioUrl?: string): string | undefined => {
      if (!audioUrl || audioUrl.startsWith('data:')) return audioUrl;
      let filename = audioUrl.split('?')[0].split('#')[0];
      filename = filename.replace(/^https?:\/\/[^\/]+/, '');
      filename = filename.replace(/^\/api\/media\/audio\//, '');
      filename = filename.replace(/^\/audio\//, '');
      filename = filename.replace(/^audio\//, '');

      const possiblePaths = [
        path.resolve(process.cwd(), 'storage/audio', filename),
        path.resolve(process.cwd(), 'storage/audio', path.basename(filename)),
        path.resolve(process.cwd(), filename),
        storage.getAbsolutePath(`audio/${filename}`),
        storage.getAbsolutePath(`audio/${path.basename(filename)}`),
        path.resolve(process.cwd(), 'public/audio', path.basename(filename)),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          const mime = p.endsWith('.wav') ? 'audio/wav' : 'audio/mp3';
          const buf = fs.readFileSync(p);
          return `data:${mime};base64,${buf.toString('base64')}`;
        }
      }

      // If file not found on disk, generate a clean 44.1kHz PCM WAV buffer
      const durationSec = spec.composition?.durationInFrames ? spec.composition.durationInFrames / (spec.composition.fps || 30) : 45;
      const sampleRate = 44100;
      const numSamples = Math.floor(sampleRate * durationSec);
      const dataSize = numSamples * 2;
      const buffer = Buffer.alloc(44 + dataSize);

      buffer.write('RIFF', 0);
      buffer.writeUInt32LE(36 + dataSize, 4);
      buffer.write('WAVE', 8);
      buffer.write('fmt ', 12);
      buffer.writeUInt32LE(16, 16);
      buffer.writeUInt16LE(1, 20);
      buffer.writeUInt16LE(1, 22);
      buffer.writeUInt32LE(sampleRate, 24);
      buffer.writeUInt32LE(sampleRate * 2, 28);
      buffer.writeUInt16LE(2, 32);
      buffer.writeUInt16LE(16, 34);
      buffer.write('data', 36);
      buffer.writeUInt32LE(dataSize, 40);

      return `data:audio/wav;base64,${buffer.toString('base64')}`;
    };

    if (renderSpec.audio?.voiceoverUrl) {
      renderSpec.audio.voiceoverUrl = resolveToDataUri(renderSpec.audio.voiceoverUrl) || renderSpec.audio.voiceoverUrl;
    }
    if (renderSpec.narration?.audioUrl) {
      renderSpec.narration.audioUrl = resolveToDataUri(renderSpec.narration.audioUrl) || renderSpec.narration.audioUrl;
    }
    if (renderSpec.audio?.musicUrl) {
      renderSpec.audio.musicUrl = resolveToDataUri(renderSpec.audio.musicUrl) || renderSpec.audio.musicUrl;
    }

    const bundleLocation = await getOrBuildBundle();
    const compositionId = 'MasterComposition';

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: { spec: renderSpec },
    });

    let lastLoggedProgress = 0;
    const concurrency = parseInt(process.env.REMOTION_CONCURRENCY || '1', 10) || 1;

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      imageFormat: 'jpeg',
      jpegQuality: 80,
      crf: 22,
      x264Preset: 'veryfast',
      outputLocation: outputAbsolutePath,
      inputProps: { spec: renderSpec },
      concurrency,
      timeoutInMilliseconds: 600000,
      onProgress: ({ progress }) => {
        const pct = Math.round(progress * 100);
        if (pct >= lastLoggedProgress + 10 || pct === 100) {
          lastLoggedProgress = pct;
          console.log(`[LocalRenderer] Rendering progress: ${pct}%`);
          db.updateRenderJob(jobId, { progress }).catch(() => {});
        }
      },
    });

    if (!fs.existsSync(outputAbsolutePath)) {
      throw new Error(`Render completed but MP4 output file was not found at ${outputAbsolutePath}`);
    }

    const stats = fs.statSync(outputAbsolutePath);
    if (stats.size === 0) {
      fs.unlinkSync(outputAbsolutePath);
      throw new Error(`Render produced an invalid 0-byte MP4 file`);
    }

    const renderTimeMs = Date.now() - renderStart;
    const totalFrames = spec.composition?.durationInFrames || 45 * 30;
    const fps = totalFrames / (renderTimeMs / 1000);

    console.log(`✅ [LocalRenderer] Render complete for job [${jobId}] (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Extract 11 representative frames and generate visual analysis report in storage/qa/<jobId>/
    const qaOutputDir = storage.getAbsolutePath(`qa/${jobId}`);
    const durationSeconds = spec.composition?.durationInFrames ? spec.composition.durationInFrames / (spec.composition.fps || 30) : 45;
    try {
      const { extract11DocumentaryFrames } = await import('./frameExtractor');
      await extract11DocumentaryFrames(outputAbsolutePath, durationSeconds, qaOutputDir, jobId);
      console.log(`📸 [LocalRenderer] Extracted 11 representative frames to ${qaOutputDir}`);
    } catch (frameErr: any) {
      console.warn(`[LocalRenderer] Frame extraction notice:`, frameErr.message);
    }

    // Transition to COMPLETED
    await db.updateRenderJob(jobId, {
      status: 'COMPLETED',
      progress: 1.0,
      outputPath: outputRelativePath,
      duration: durationSeconds,
      completedAt: new Date().toISOString(),
    });

    return {
      outputFile: outputAbsolutePath,
      renderTimeMs,
      fps,
      fileSizeBytes: stats.size,
    };
  } catch (renderError: any) {
    if (fs.existsSync(outputAbsolutePath)) {
      try {
        const check = fs.statSync(outputAbsolutePath);
        if (check.size === 0) fs.unlinkSync(outputAbsolutePath);
      } catch {}
    }

    console.error(`❌ [LocalRenderer] Render job [${jobId}] failed:`, renderError.message);
    await db.updateRenderJob(jobId, {
      status: 'FAILED',
      errorCode: 'RENDER_PROCESS_ERROR',
      errorMessage: renderError.message,
      completedAt: new Date().toISOString(),
    });
    throw renderError;
  }
}

export async function getLocalRenderJobStatus(jobId: string): Promise<LocalRenderResult> {
  const db = DatabaseFactory.getProvider();
  const job = await db.getRenderJob(jobId);

  if (!job) {
    return {
      jobId,
      status: 'FAILED',
      errorCode: 'JOB_NOT_FOUND',
      error: `Render job ${jobId} not found in database`,
    };
  }

  return {
    jobId: job.id,
    status: job.status,
    outputPath: job.outputPath,
    publicUrl: job.status === 'COMPLETED' ? `/api/media/video/${job.id}` : undefined,
    durationSeconds: job.duration,
    errorCode: job.errorCode,
    error: job.errorMessage,
  };
}
