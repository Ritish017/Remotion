import { NextRequest, NextResponse } from 'next/server';
import { createRenderJob } from '@/lib/rendering/lambda';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import { validateVideoSpec } from '@/lib/video-spec/validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const spec = body?.spec || SAMPLE_SHOWCASE_SPEC;

    const validation = validateVideoSpec(spec);
    if (!validation.valid && !validation.repairedSpec) {
      return NextResponse.json({ error: 'Invalid VideoSpec', errors: validation.errors }, { status: 400 });
    }

    const validSpec = validation.repairedSpec || spec;
    const renderResult = await createRenderJob({
      spec: validSpec,
      compositionId: body?.compositionId || (validSpec.composition.format === '16:9' ? 'HorizontalExplainer' : 'VerticalExplainer'),
    });

    return NextResponse.json(renderResult);
  } catch (error: any) {
    console.error('Render API error:', error);
    return NextResponse.json({ error: error.message || 'Render failed' }, { status: 500 });
  }
}
