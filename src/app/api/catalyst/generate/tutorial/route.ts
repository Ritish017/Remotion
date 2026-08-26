import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { buildTutorialSegments, type VideoJob } from '@/lib/video-generation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, duration = 60, palette = 'tutorial-neon', motion_preset = 'kinetic', content_map } = body;

    const jobId = randomUUID();
    const segmentDefs = buildTutorialSegments(topic, content_map, palette, motion_preset, duration);

    if (segmentDefs.length === 0) {
      return NextResponse.json({ error: 'No segments could be built from the script' }, { status: 400 });
    }

    const job: VideoJob = {
      jobId,
      topic,
      palette,
      motionPreset: motion_preset,
      segments: segmentDefs.map((def, i) => ({
        index: i,
        invocationArn: `remotion_${jobId}_${i}`,
        textOverlay: def.textOverlay,
        prompt: def.prompt,
        s3OutputUri: `s3://${process.env.S3_VIDEO_BUCKET || 'catalyst-videos'}/renders/${jobId}/`,
        durationSeconds: def.durationSeconds,
      })),
      totalDuration: duration,
      createdAt: new Date().toISOString(),
      campaignType: 'ai-teaching',
    };

    await supabase.from('live_event_states').upsert({
      event_key: `video_job:${jobId}`,
      campaign_type: 'ai-teaching',
      event_data: job,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ job_id: jobId, segments: segmentDefs.length });
  } catch (error: any) {
    console.error('Video generate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
