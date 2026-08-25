import { NextRequest, NextResponse } from 'next/server';
import { runAutomatedQA } from '@/lib/qa';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const spec = body?.spec || SAMPLE_SHOWCASE_SPEC;
    const qaReport = runAutomatedQA(spec);
    return NextResponse.json(qaReport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'QA run failed' }, { status: 500 });
  }
}
