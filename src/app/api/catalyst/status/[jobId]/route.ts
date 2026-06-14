import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, GetAsyncInvokeCommand } from '@aws-sdk/client-bedrock-runtime'
import { createClient } from '@supabase/supabase-js'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params

    const { data, error } = await supabase
      .from('live_event_states')
      .select('event_data')
      .eq('event_key', `video_job:${jobId}`)
      .single()

    if (error || !data) {
      return NextResponse.json({ status: 'error', message: 'Job not found' }, { status: 404 })
    }

    const job = data.event_data as any

    // Check all segments
    const segmentStatuses = await Promise.all(
      job.segments.map(async (seg: any) => {
        try {
          const res = await bedrock.send(new GetAsyncInvokeCommand({
            invocationArn: seg.invocationArn,
          }))
          return res.status // 'InProgress' | 'Completed' | 'Failed'
        } catch {
          return 'Failed'
        }
      })
    )

    const allDone = segmentStatuses.every(s => s === 'Completed')
    const anyFailed = segmentStatuses.some(s => s === 'Failed')

    if (allDone) {
      return NextResponse.json({
        status: 'done',
        segments: job.segments.length,
        total_duration: job.totalDuration,
      })
    }

    if (anyFailed) {
      return NextResponse.json({ status: 'error', message: 'One or more segments failed' })
    }

    const completed = segmentStatuses.filter(s => s === 'Completed').length
    return NextResponse.json({
      status: 'rendering',
      progress: `${completed}/${segmentStatuses.length} segments complete`,
    })
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
