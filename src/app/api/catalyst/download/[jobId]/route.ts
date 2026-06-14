import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({ region: 'us-east-1' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const S3_BUCKET = process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params
  const segmentIndex = parseInt(new URL(req.url).searchParams.get('segment') || '0')

  // Load job to get invocationArn for this segment
  const { data } = await supabase
    .from('live_event_states')
    .select('event_data')
    .eq('event_key', `video_job:${jobId}`)
    .single()

  let key: string
  if (data?.event_data?.segments?.[segmentIndex]?.invocationArn) {
    const invocationId = data.event_data.segments[segmentIndex].invocationArn.split('/').pop()
    key = `videos/${jobId}/segment_${segmentIndex}/${invocationId}/output.mp4`
  } else {
    return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
  }

  try {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ResponseContentDisposition: `attachment; filename="catalyst-${jobId}-seg${segmentIndex}.mp4"`,
      }),
      { expiresIn: 300 }
    )
    return NextResponse.redirect(url)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
}
