import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { buildSportsSegments, type VideoJob } from '@/lib/video-generation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { home = 'Team A', away = 'Team B', competition = 'FIFA World Cup 2026', palette = 'ai-fire' } = body;

    const jobId = randomUUID();
    const segmentDefs = buildSportsSegments(home, away, competition, palette);

    const job: VideoJob = {
      jobId,
      topic: `${home} vs ${away}`,
      palette,
      motionPreset: 'dramatic',
      segments: segmentDefs.map((def, i) => ({
        index: i,
        invocationArn: `remotion_sports_${jobId}_${i}`,
        textOverlay: def.textOverlay,
        prompt: def.prompt,
        s3OutputUri: `s3://${process.env.S3_VIDEO_BUCKET || 'catalyst-videos'}/renders/${jobId}/`,
        durationSeconds: def.durationSeconds,
      })),
      totalDuration: 18,
      createdAt: new Date().toISOString(),
      campaignType: 'football',
    };

    await supabase.from('live_event_states').upsert({
      event_key: `video_job:${jobId}`,
      campaign_type: 'football',
      event_data: job,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ job_id: jobId, segments: segmentDefs.length });
  } catch (error: any) {
    console.error('Sports video generate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
