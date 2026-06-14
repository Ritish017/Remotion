import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, StartAsyncInvokeCommand, GetAsyncInvokeCommand } from '@aws-sdk/client-bedrock-runtime'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { buildTutorialSegments, type VideoJob } from '@/lib/video-generation'

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
    } catch { /* ignore transient errors */ }
  }
  return 'TimedOut'
}

// Fire all segments sequentially in the background.
// Returns the jobId immediately so the client can start polling status.
async function runSegmentsInBackground(
  jobId: string,
  topic: string,
  palette: string,
  motionPreset: string,
  duration: number,
  segmentDefs: Array<{ prompt: string; textOverlay: any; durationSeconds: number }>
) {
  const segments: any[] = []

  for (let i = 0; i < segmentDefs.length; i++) {
    const def = segmentDefs[i]
    const s3OutputUri = `s3://${S3_BUCKET}/videos/${jobId}/segment_${i}/`

    try {
      const response = await bedrock.send(new StartAsyncInvokeCommand({
        modelId: 'amazon.nova-reel-v1:1',
        modelInput: {
          taskType: 'TEXT_VIDEO',
          textToVideoParams: { text: def.prompt },
          videoGenerationConfig: {
            durationSeconds: def.durationSeconds,
            fps: 24,
            dimension: '1280x720',
            seed: Math.floor(Math.random() * 2147483648),
          },
        },
        outputDataConfig: { s3OutputDataConfig: { s3Uri: s3OutputUri } },
      }))

      segments.push({
        index: i,
        invocationArn: response.invocationArn!,
        textOverlay: def.textOverlay,
        prompt: def.prompt,
        s3OutputUri,
        durationSeconds: def.durationSeconds,
      })

      // Persist progress after each successful segment start
      const partialJob: VideoJob = {
        jobId, topic, palette, motionPreset,
        segments: [...segments],
        totalDuration: duration,
        createdAt: new Date().toISOString(),
        campaignType: 'ai-teaching',
      }
      await supabase.from('live_event_states').upsert({
        event_key: `video_job:${jobId}`,
        campaign_type: 'ai-teaching',
        event_data: partialJob,
        updated_at: new Date().toISOString(),
      })

      // Wait for this segment to finish before starting next (concurrent limit = 1)
      if (i < segmentDefs.length - 1) {
        await pollUntilDone(response.invocationArn!)
      }
    } catch (err: any) {
      console.error(`[generate/tutorial] Segment ${i} failed:`, err.message)
      // If rate limited on segment > 0, the completed segments are already saved —
      // the status route will show partial progress
      break
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, duration = 60, palette = 'tutorial-neon', motion_preset = 'kinetic', content_map } = body

    const jobId = randomUUID()
    const segmentDefs = buildTutorialSegments(topic, content_map, palette, motion_preset, duration)

    if (segmentDefs.length === 0) {
      return NextResponse.json({ error: 'No segments could be built from the script' }, { status: 400 })
    }

    // Create a placeholder job record immediately so status polling works right away
    const placeholderJob: VideoJob = {
      jobId, topic, palette, motionPreset: motion_preset,
      segments: [],
      totalDuration: duration,
      createdAt: new Date().toISOString(),
      campaignType: 'ai-teaching',
    }
    await supabase.from('live_event_states').upsert({
      event_key: `video_job:${jobId}`,
      campaign_type: 'ai-teaching',
      event_data: placeholderJob,
      updated_at: new Date().toISOString(),
    })

    // Fire segments in background — returns immediately, does not block the response
    runSegmentsInBackground(jobId, topic, palette, motion_preset, duration, segmentDefs)
      .catch(err => console.error('[generate/tutorial] Background task error:', err))

    return NextResponse.json({ job_id: jobId, segments: segmentDefs.length })
  } catch (error: any) {
    console.error('Video generate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
