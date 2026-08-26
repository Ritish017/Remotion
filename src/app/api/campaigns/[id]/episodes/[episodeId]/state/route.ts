import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const { episodeId } = await context.params;
    const db = DatabaseFactory.getProvider();

    const state = await db.getUnifiedEpisodeState(episodeId);
    if (!state) {
      return NextResponse.json({ error: `Episode [${episodeId}] not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, state });
  } catch (error: any) {
    console.error('Fetch episode state error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch episode state' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const { id: campaignId, episodeId } = await context.params;
    const body = await req.json();
    const db = DatabaseFactory.getProvider();

    const { status, title, topic, researchJson, scriptJson, storyboardJson, videoSpec, qaReportJson } = body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (title !== undefined) updates.title = title;
    if (topic !== undefined) updates.topic = topic;
    if (researchJson !== undefined) updates.researchJson = typeof researchJson === 'string' ? researchJson : JSON.stringify(researchJson);
    if (scriptJson !== undefined) updates.scriptJson = typeof scriptJson === 'string' ? scriptJson : JSON.stringify(scriptJson);
    if (storyboardJson !== undefined) updates.storyboardJson = typeof storyboardJson === 'string' ? storyboardJson : JSON.stringify(storyboardJson);
    if (qaReportJson !== undefined) updates.qaReportJson = typeof qaReportJson === 'string' ? qaReportJson : JSON.stringify(qaReportJson);

    if (videoSpec) {
      const specRecord = {
        id: videoSpec.id,
        projectId: campaignId,
        episodeId,
        specJson: JSON.stringify(videoSpec),
        versionTag: videoSpec.version || 'user-updated',
      };
      await db.saveVideoSpec(specRecord);
      updates.videoSpecId = videoSpec.id;
    }

    const updatedEpisode = await db.updateEpisode(episodeId, updates);
    const unifiedState = await db.getUnifiedEpisodeState(episodeId);

    return NextResponse.json({ success: true, episode: updatedEpisode, state: unifiedState });
  } catch (error: any) {
    console.error('Update episode state error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update episode state' }, { status: 500 });
  }
}
