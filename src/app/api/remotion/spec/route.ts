import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import { ALLOWLISTED_TOOLS } from '@/lib/ai/claude/tools';

export async function GET() {
  return NextResponse.json({ spec: SAMPLE_SHOWCASE_SPEC });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, spec, sceneNumber, modifications } = body;

    if (action === 'update_scene') {
      const result = ALLOWLISTED_TOOLS.scene_update.execute({
        spec,
        sceneNumber,
        modifications,
      });
      return NextResponse.json(result);
    }

    if (action === 'validate') {
      const result = validateVideoSpec(spec);
      return NextResponse.json(result);
    }

    // Default: validate given spec
    const validation = validateVideoSpec(spec || body);
    return NextResponse.json(validation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Spec operation failed' }, { status: 500 });
  }
}
