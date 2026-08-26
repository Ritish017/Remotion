import type { VideoSpec } from '@/lib/video-spec/types';
import { DatabaseFactory } from './index';

export type RenderJobStatus = 'QUEUED' | 'RENDERING' | 'COMPLETED' | 'FAILED';

export interface RenderJobRecord {
  id?: string;
  job_id: string;
  content_id?: string | null;
  spec_id?: string | null;
  composition_id?: string | null;
  status: RenderJobStatus;
  progress?: number;
  render_id?: string | null;
  bucket?: string | null;
  output_key?: string | null;
  output_url?: string | null;
  download_url?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  requested_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
  spec?: VideoSpec | null;
  metadata?: Record<string, any>;
}

export async function insertRenderJob(record: RenderJobRecord): Promise<RenderJobRecord | null> {
  try {
    const db = DatabaseFactory.getProvider();
    const created = await db.createRenderJob({
      id: record.job_id,
      projectId: record.content_id ?? undefined,
      episodeId: record.spec_id ?? undefined,
      compositionId: record.composition_id ?? undefined,
      status: record.status,
      progress: record.progress ?? 0,
      outputPath: record.output_url || record.output_key || undefined,
      errorCode: record.error_code ?? undefined,
      errorMessage: record.error_message ?? undefined,
      spec: record.spec,
      startedAt: record.started_at ?? undefined,
      completedAt: record.completed_at ?? undefined,
    });

    return {
      ...record,
      id: created.id,
      job_id: created.id,
      status: created.status,
      progress: created.progress,
      requested_at: created.createdAt,
    };
  } catch (err: any) {
    console.warn('[Database] SQLite render_job insert exception:', err.message);
    return null;
  }
}

export async function updateRenderJob(
  jobId: string,
  updates: Partial<RenderJobRecord>
): Promise<RenderJobRecord | null> {
  try {
    const db = DatabaseFactory.getProvider();
    const updated = await db.updateRenderJob(jobId, {
      status: updates.status,
      progress: updates.progress,
      outputPath: (updates.output_url || updates.output_key) ?? undefined,
      errorCode: updates.error_code ?? undefined,
      errorMessage: updates.error_message ?? undefined,
      startedAt: updates.started_at ?? undefined,
      completedAt: updates.completed_at ?? undefined,
    });

    if (!updated) return null;

    return {
      job_id: updated.id,
      status: updated.status,
      progress: updated.progress,
      output_url: updated.outputPath,
      download_url: updated.outputPath ? `/api/media/video/${jobId}` : undefined,
      error_code: updated.errorCode,
      error_message: updated.errorMessage,
      started_at: updated.startedAt,
      completed_at: updated.completedAt,
    };
  } catch (err: any) {
    console.warn(`[Database] SQLite render_job update exception for [${jobId}]:`, err.message);
    return null;
  }
}

export async function getRenderJob(jobId: string): Promise<RenderJobRecord | null> {
  try {
    const db = DatabaseFactory.getProvider();
    const record = await db.getRenderJob(jobId);
    if (!record) return null;

    return {
      id: record.id,
      job_id: record.id,
      content_id: record.projectId,
      spec_id: record.episodeId,
      composition_id: record.compositionId,
      status: record.status,
      progress: record.progress,
      output_url: record.outputPath,
      download_url: record.outputPath ? `/api/media/video/${jobId}` : undefined,
      error_code: record.errorCode,
      error_message: record.errorMessage,
      spec: record.spec,
      started_at: record.startedAt,
      completed_at: record.completedAt,
      requested_at: record.createdAt,
    };
  } catch (err: any) {
    console.warn(`[Database] SQLite render_job fetch exception for [${jobId}]:`, err.message);
    return null;
  }
}
