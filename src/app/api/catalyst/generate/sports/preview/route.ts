import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, StartAsyncInvokeCommand, GetAsyncInvokeCommand } from '@aws-sdk/client-bedrock-runtime'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { buildSportsSegments, type VideoJob } from '@/lib/video-generation'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const S3_BUCKET = process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function waitForCompletion(invocationArn: string, timeoutMs = 180_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await sleep(12_000)
    const res = await bedrock.send(new GetAsyncInvokeCommand({ invocationArn }))
    if (res.status === 'Completed' || res.status === 'Failed') return
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { home = 'Team A', away = 'Team B', competition = 'FIFA World Cup 2026', palette = 'ai-fire' } = body

    const jobId = randomUUID()
    const segmentDefs = buildSportsSegments(home, away, competition, palette)

    const segments = []
    for (let i = 0; i < segmentDefs.length; i++) {
      const def = segmentDefs[i]
      const s3OutputUri = `s3://${S3_BUCKET}/videos/${jobId}/segment_${i}/`

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

      const invocationArn = response.invocationArn!
      segments.push({
        index: i,
        invocationArn,
        textOverlay: def.textOverlay,
        prompt: def.prompt,
        s3OutputUri,
        durationSeconds: def.durationSeconds,
      })

      const partialJob: VideoJob = {
        jobId, topic: `${home} vs ${away}`, palette, motionPreset: 'dramatic',
        segments: [...segments], totalDuration: 18,
        createdAt: new Date().toISOString(), campaignType: 'football',
      }
      await supabase.from('live_event_states').upsert({
        event_key: `video_job:${jobId}`,
        campaign_type: 'football',
        event_data: partialJob,
        updated_at: new Date().toISOString(),
      })

      if (i < segmentDefs.length - 1) await waitForCompletion(invocationArn)
    }

    return NextResponse.json({ job_id: jobId, segments: segments.length })
  } catch (error: any) {
    console.error('Sports video generate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
