import { NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({ region: 'us-east-1' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const S3_BUCKET = process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913'

export async function GET() {
  // 1. Scan S3 for all output.mp4 files
  const listRes = await s3.send(new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: 'videos/',
  }))

  // videos/{jobId}/segment_{i}/{invocationId}/output.mp4
  const videoFiles = (listRes.Contents || []).filter(obj => obj.Key?.endsWith('/output.mp4'))

  // Group by jobId
  const jobMap = new Map<string, {
    jobId: string
    segments: Array<{ index: number; invocationId: string; key: string; size: number; lastModified: Date }>
  }>()

  for (const obj of videoFiles) {
    const parts = obj.Key!.split('/')
    // parts: ['videos', jobId, 'segment_N', invocationId, 'output.mp4']
    if (parts.length !== 5) continue
    const jobId = parts[1]
    const segmentPart = parts[2]
    const invocationId = parts[3]
    const segIndex = parseInt(segmentPart.replace('segment_', ''))

    if (!jobMap.has(jobId)) jobMap.set(jobId, { jobId, segments: [] })
    jobMap.get(jobId)!.segments.push({
      index: segIndex,
      invocationId,
      key: obj.Key!,
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
    })
  }

  // 2. Load tracked job metadata from Supabase
  const { data: dbJobs } = await supabase
    .from('live_event_states')
    .select('event_key, event_data')
    .like('event_key', 'video_job:%')

  const dbJobMap = new Map<string, any>()
  for (const row of dbJobs || []) {
    const jobId = (row.event_key as string).replace('video_job:', '')
    dbJobMap.set(jobId, row.event_data)
  }

  // 3. Build library entries with presigned download URLs
  const entries = await Promise.all(
    Array.from(jobMap.values()).map(async ({ jobId, segments }) => {
      const meta = dbJobMap.get(jobId)
      const sortedSegs = segments.sort((a, b) => a.index - b.index)
      const latest = sortedSegs.reduce((a, b) => a.lastModified > b.lastModified ? a : b)

      const segmentUrls = await Promise.all(
        sortedSegs.map(async (seg) => {
          const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: S3_BUCKET,
              Key: seg.key,
              ResponseContentDisposition: `attachment; filename="${jobId}-seg${seg.index}.mp4"`,
            }),
            { expiresIn: 3600 }
          )
          return { index: seg.index, url, size: seg.size }
        })
      )

      return {
        job_id: jobId,
        topic: meta?.topic || null,
        palette: meta?.palette || null,
        campaign_type: meta?.campaignType || null,
        total_duration: meta?.totalDuration || null,
        segment_count: sortedSegs.length,
        total_size_mb: Math.round(sortedSegs.reduce((s, x) => s + x.size, 0) / 1024 / 1024 * 10) / 10,
        created_at: latest.lastModified.toISOString(),
        tracked: dbJobMap.has(jobId),
        segments: segmentUrls,
        preview_url: `/api/catalyst/preview/${jobId}`,
      }
    })
  )

  // Sort by newest first
  entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json({ videos: entries, total: entries.length })
}
