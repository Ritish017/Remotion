import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, StartAsyncInvokeCommand, GetAsyncInvokeCommand } from '@aws-sdk/client-bedrock-runtime'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { buildSocialSegments, type VideoJob } from '@/lib/video-generation'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const S3_BUCKET = process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function pollUntilDone(invocationArn: string, timeoutMs = 200_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await sleep(12_000)
    try {
      const res = await bedrock.send(new GetAsyncInvokeCommand({ invocationArn }))
      if (res.status === 'Completed' || res.status === 'Failed') return res.status
    } catch { /* ignore */ }
  }
  return 'TimedOut'
}

async function runSegmentsInBackground(
  jobId: string, brief: string, palette: string, motionPreset: string,
  segmentDefs: Array<{ prompt: string; textOverlay: any; durationSeconds: number }>
) {
  const segments: any[] = []
  for (let i = 0; i < segmentDefs.length; i++) {
    const def = segmentDefs[i]
    try {
      const response = await bedrock.send(new StartAsyncInvokeCommand({
        modelId: 'amazon.nova-reel-v1:1',
        modelInput: {
          taskType: 'TEXT_VIDEO',
          textToVideoParams: { text: def.prompt },
          videoGenerationConfig: { durationSeconds: def.durationSeconds, fps: 24, dimension: '1280x720', seed: Math.floor(Math.random() * 2147483648) },
        },
        outputDataConfig: { s3OutputDataConfig: { s3Uri: `s3://${S3_BUCKET}/videos/${jobId}/segment_${i}/` } },
      }))
      segments.push({ index: i, invocationArn: response.invocationArn!, textOverlay: def.textOverlay, prompt: def.prompt, s3OutputUri: `s3://${S3_BUCKET}/videos/${jobId}/segment_${i}/`, durationSeconds: def.durationSeconds })
      await supabase.from('live_event_states').upsert({ event_key: `video_job:${jobId}`, campaign_type: 'social-branding', event_data: { jobId, topic: brief, palette, motionPreset, segments: [...segments], totalDuration: 18, createdAt: new Date().toISOString(), campaignType: 'social-branding' } as VideoJob, updated_at: new Date().toISOString() })
      if (i < segmentDefs.length - 1) await pollUntilDone(response.invocationArn!)
    } catch (err: any) { console.error(`[social] Segment ${i} failed:`, err.message); break }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brief, palette = 'neon-purple', motion_preset = 'kinetic', content_map } = body
    const jobId = randomUUID()
    const segmentDefs = buildSocialSegments(brief, content_map, palette, motion_preset)
    await supabase.from('live_event_states').upsert({ event_key: `video_job:${jobId}`, campaign_type: 'social-branding', event_data: { jobId, topic: brief, palette, motionPreset: motion_preset, segments: [], totalDuration: 18, createdAt: new Date().toISOString(), campaignType: 'social-branding' } as VideoJob, updated_at: new Date().toISOString() })
    runSegmentsInBackground(jobId, brief, palette, motion_preset, segmentDefs).catch(console.error)
    return NextResponse.json({ job_id: jobId, segments: segmentDefs.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
