import { S3Client, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { VideoSpec } from '@/lib/video-spec/types';
import { insertRenderJob, updateRenderJob, getRenderJob } from '@/lib/database/renderJobs';

const s3 = new S3Client({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1',
});

const S3_BUCKET = process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913';

export interface RenderJobRequest {
  spec: VideoSpec;
  compositionId?: string;
  contentId?: string;
  specId?: string;
}

export interface RenderJobResponse {
  jobId: string;
  status: 'QUEUED' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  outputUrl?: string;
  downloadUrl?: string;
  error?: string;
  errorCode?: string;
  renderId?: string;
  progress?: number;
}

export interface S3ObjectVerification {
  verified: boolean;
  contentLength: number;
  contentType?: string;
  error?: string;
}

/**
 * Verifies that a rendered video actually exists in S3 and has non-zero size.
 * Prevents issuing false download URLs for non-existent objects.
 */
export async function verifyS3Object(bucket: string, key: string): Promise<S3ObjectVerification> {
  try {
    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const contentLength = head.ContentLength ?? 0;
    if (contentLength <= 0) {
      return {
        verified: false,
        contentLength: 0,
        error: 'S3 object exists but has 0 bytes length.',
      };
    }

    return {
      verified: true,
      contentLength,
      contentType: head.ContentType,
    };
  } catch (err: any) {
    return {
      verified: false,
      contentLength: 0,
      error: `S3 HeadObject verification failed: ${err.message}`,
    };
  }
}

/**
 * Creates and initiates a real Remotion Lambda render job.
 * Strictly avoids fake success paths or fallback simulation in production.
 */
export async function createRenderJob(request: RenderJobRequest): Promise<RenderJobResponse> {
  const jobId = `render-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const key = `renders/${jobId}/output.mp4`;
  const compositionId = request.compositionId || (request.spec.composition.format === '16:9' ? 'HorizontalExplainer' : 'VerticalExplainer');

  const isProduction = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';
  const lambdaFunction = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_SERVE_URL;
  const region = process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || 'us-east-1';

  // 1. Initial job record inserted to Supabase
  await insertRenderJob({
    job_id: jobId,
    content_id: request.contentId,
    spec_id: request.specId || request.spec.id,
    composition_id: compositionId,
    status: 'QUEUED',
    bucket: S3_BUCKET,
    output_key: key,
    spec: request.spec,
    requested_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
  });

  // 2. Validate Lambda configuration
  if (!lambdaFunction || !serveUrl) {
    const errorMsg = 'Remotion Lambda is not configured. Missing REMOTION_LAMBDA_FUNCTION_NAME or REMOTION_SERVE_URL.';
    console.error(`❌ [RenderService] ${errorMsg}`);

    await updateRenderJob(jobId, {
      status: 'FAILED',
      error_code: 'LAMBDA_NOT_CONFIGURED',
      error_message: errorMsg,
      completed_at: new Date().toISOString(),
    });

    return {
      jobId,
      status: 'FAILED',
      errorCode: 'LAMBDA_NOT_CONFIGURED',
      error: errorMsg,
    };
  }

  // 3. Initiate Lambda Render
  try {
    const { renderMediaOnLambda } = await import('@remotion/lambda/client');
    const { renderId, bucketName } = await renderMediaOnLambda({
      region: region as any,
      functionName: lambdaFunction,
      serveUrl,
      composition: compositionId,
      inputProps: {
        spec: request.spec,
      },
      codec: 'h264',
      outName: key,
    });

    const outputUrl = `s3://${bucketName}/${key}`;

    await updateRenderJob(jobId, {
      status: 'RENDERING',
      render_id: renderId,
      bucket: bucketName,
      output_key: key,
      output_url: outputUrl,
    });

    return {
      jobId,
      renderId,
      status: 'RENDERING',
      outputUrl,
    };
  } catch (err: any) {
    const errorMsg = `Remotion Lambda invocation failed: ${err.message}`;
    console.error(`❌ [RenderService] ${errorMsg}`);

    await updateRenderJob(jobId, {
      status: 'FAILED',
      error_code: 'LAMBDA_INVOCATION_ERROR',
      error_message: errorMsg,
      completed_at: new Date().toISOString(),
    });

    return {
      jobId,
      status: 'FAILED',
      errorCode: 'LAMBDA_INVOCATION_ERROR',
      error: errorMsg,
    };
  }
}

/**
 * Polls the real render progress from Remotion Lambda, verifies the output in S3,
 * and updates Supabase state accordingly.
 */
export async function getRenderJobStatus(jobId: string): Promise<RenderJobResponse> {
  const job = await getRenderJob(jobId);
  if (!job) {
    return {
      jobId,
      status: 'FAILED',
      errorCode: 'JOB_NOT_FOUND',
      error: `Render job [${jobId}] was not found in persistence records.`,
    };
  }

  // If already in terminal state, return existing record
  if (job.status === 'COMPLETED' || job.status === 'FAILED') {
    return {
      jobId: job.job_id,
      status: job.status,
      outputUrl: job.output_url || undefined,
      downloadUrl: job.download_url || undefined,
      error: job.error_message || undefined,
      errorCode: job.error_code || undefined,
      renderId: job.render_id || undefined,
      progress: job.status === 'COMPLETED' ? 1.0 : undefined,
    };
  }

  // Check progress with Remotion Lambda
  const lambdaFunction = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
  const region = process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
  const bucket = job.bucket || S3_BUCKET;

  if (!job.render_id || !lambdaFunction) {
    const errorMsg = 'Cannot check progress: missing render_id or Lambda configuration.';
    await updateRenderJob(jobId, {
      status: 'FAILED',
      error_code: 'POLL_CONFIG_ERROR',
      error_message: errorMsg,
      completed_at: new Date().toISOString(),
    });

    return {
      jobId,
      status: 'FAILED',
      errorCode: 'POLL_CONFIG_ERROR',
      error: errorMsg,
    };
  }

  try {
    const { getRenderProgress } = await import('@remotion/lambda/client');
    const progress = await getRenderProgress({
      renderId: job.render_id,
      bucketName: bucket,
      functionName: lambdaFunction,
      region: region as any,
    });

    if (progress.fatalErrorEncountered || (progress.errors && progress.errors.length > 0)) {
      const errorDetail = progress.errors?.map((e) => e.message).join('; ') || 'Fatal error during Lambda render.';
      const errorMsg = `Render failed on Lambda: ${errorDetail}`;

      await updateRenderJob(jobId, {
        status: 'FAILED',
        error_code: 'LAMBDA_RENDER_ERROR',
        error_message: errorMsg,
        completed_at: new Date().toISOString(),
      });

      return {
        jobId,
        renderId: job.render_id,
        status: 'FAILED',
        errorCode: 'LAMBDA_RENDER_ERROR',
        error: errorMsg,
      };
    }

    if (progress.done) {
      const outputKey = job.output_key || `renders/${jobId}/output.mp4`;

      // Verify the object exists in S3 with size > 0
      const verification = await verifyS3Object(bucket, outputKey);
      if (!verification.verified) {
        const errorMsg = `Lambda reported completion, but S3 verification failed: ${verification.error}`;
        await updateRenderJob(jobId, {
          status: 'FAILED',
          error_code: 'S3_VERIFICATION_FAILED',
          error_message: errorMsg,
          completed_at: new Date().toISOString(),
        });

        return {
          jobId,
          renderId: job.render_id,
          status: 'FAILED',
          errorCode: 'S3_VERIFICATION_FAILED',
          error: errorMsg,
        };
      }

      // Generate signed download URL for verified S3 object
      const downloadUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: bucket, Key: outputKey }),
        { expiresIn: 3600 * 24 } // 24 hours
      );

      const outputUrl = `s3://${bucket}/${outputKey}`;

      await updateRenderJob(jobId, {
        status: 'COMPLETED',
        output_url: outputUrl,
        download_url: downloadUrl,
        completed_at: new Date().toISOString(),
      });

      return {
        jobId,
        renderId: job.render_id,
        status: 'COMPLETED',
        outputUrl,
        downloadUrl,
        progress: 1.0,
      };
    }

    // Still in progress
    return {
      jobId,
      renderId: job.render_id,
      status: 'RENDERING',
      outputUrl: job.output_url || undefined,
      progress: progress.overallProgress ?? 0,
    };
  } catch (err: any) {
    console.warn(`[RenderService] Lambda progress check warning: ${err.message}`);
    return {
      jobId,
      renderId: job.render_id,
      status: 'RENDERING',
      error: err.message,
    };
  }
}
