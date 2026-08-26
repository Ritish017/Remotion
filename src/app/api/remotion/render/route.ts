import { NextRequest, NextResponse } from 'next/server';
import { createLocalRenderJob } from '@/lib/rendering/local';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import { DatabaseFactory } from '@/lib/database';
import type { VideoSpec } from '@/lib/video-spec/types';

export async function POST(req: NextRequest) {
  try {
    const isProduction = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';
    const isPreview = process.env.APP_ENV === 'preview';

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body. A valid VideoSpec or specId is required.' },
        { status: 400 }
      );
    }

    let spec: VideoSpec | null = null;
    const specId = body?.specId;
    const contentId = body?.contentId;
    const db = DatabaseFactory.getProvider();

    // 1. Resolve VideoSpec from DB if specId provided
    if (specId) {
      const jobRecord = await db.getRenderJob(specId);
      if (jobRecord?.spec) {
        spec = jobRecord.spec as VideoSpec;
      }

      if (!spec && !body?.spec) {
        return NextResponse.json(
          { error: `VideoSpec not found for specId [${specId}]` },
          { status: 404 }
        );
      }
    }

    // 2. Resolve inline spec
    if (!spec && body?.spec) {
      spec = body.spec;
    }

    // 3. In production, sample spec fallback is forbidden
    if (!spec) {
      if (isProduction || isPreview) {
        return NextResponse.json(
          {
            error: 'Missing VideoSpec. Production renders require a valid "spec" object or "specId". Sample fallbacks are disabled in production.',
          },
          { status: 400 }
        );
      }
      spec = SAMPLE_SHOWCASE_SPEC;
    }

    // 4. Deep VideoSpec Validation
    const validation = validateVideoSpec(spec);
    if (!validation.valid && !validation.repairedSpec) {
      return NextResponse.json(
        {
          error: 'VideoSpec validation failed. Spec does not adhere to production schema.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const validSpec = validation.repairedSpec || spec;

    // 5. Initiate Local Render Job
    const renderResult = await createLocalRenderJob({
      spec: validSpec,
      projectId: contentId,
      episodeId: specId || validSpec.id,
    });

    const statusCode = renderResult.status === 'FAILED' ? 500 : 202;
    return NextResponse.json(renderResult, { status: statusCode });
  } catch (error: any) {
    console.error('Render API route error:', error);
    return NextResponse.json(
      {
        status: 'FAILED',
        error: error.message || 'Internal server error while processing render request',
      },
      { status: 500 }
    );
  }
}
