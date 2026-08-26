import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { createLocalRenderJob } from '@/lib/rendering/local';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const { id: campaignId, episodeId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const db = DatabaseFactory.getProvider();

    const episode = await db.getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json({ error: `Episode [${episodeId}] not found` }, { status: 404 });
    }

    // Retrieve canonical VideoSpec
    let spec = body.spec;
    if (!spec) {
      const specRecord = await db.getVideoSpecByEpisode(episodeId);
      if (specRecord?.specJson) {
        try {
          spec = JSON.parse(specRecord.specJson);
        } catch {}
      }
    }

    if (!spec) {
      return NextResponse.json(
        { error: `Cannot approve episode [${episodeId}] without a valid VideoSpec. Produce the episode first.` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Human Approval Gate Transition
    await db.updateEpisode(episodeId, {
      status: 'APPROVED',
      approvedAt: now,
    });

    // Launch Production Render
    const renderJob = await createLocalRenderJob({
      spec,
      compositionId: 'MasterVideo',
      episodeId,
      concurrency: 4,
    });

    // Transition to RENDERING
    await db.updateEpisode(episodeId, {
      status: 'RENDERING',
      renderJobId: renderJob.jobId,
    });

    const updatedEpisode = await db.getEpisode(episodeId);

    return NextResponse.json({
      success: true,
      jobId: renderJob.jobId,
      episode: updatedEpisode,
    });
  } catch (error: any) {
    console.error('Episode approval error:', error);
    return NextResponse.json({ error: error.message || 'Episode approval failed' }, { status: 500 });
  }
}
