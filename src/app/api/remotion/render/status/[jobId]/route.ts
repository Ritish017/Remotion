import { NextRequest, NextResponse } from 'next/server';
import { getLocalRenderJobStatus } from '@/lib/rendering/local';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId route parameter is required' }, { status: 400 });
    }

    const statusResult = await getLocalRenderJobStatus(jobId);
    const statusCode = statusResult.status === 'FAILED' ? 500 : 200;

    return NextResponse.json(statusResult, { status: statusCode });
  } catch (error: any) {
    console.error('Render status check error:', error);
    return NextResponse.json(
      {
        status: 'FAILED',
        error: error.message || 'Failed to check render status',
      },
      { status: 500 }
    );
  }
}
