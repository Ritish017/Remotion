import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
);

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;

    // First check render_jobs table
    const { data: renderJob } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (renderJob) {
      return NextResponse.json({
        status: renderJob.status.toLowerCase(),
        jobId: renderJob.job_id,
        outputUrl: renderJob.output_url,
        downloadUrl: renderJob.download_url,
        error: renderJob.error_message,
      });
    }

    // Fallback check in live_event_states
    const { data, error } = await supabase
      .from('live_event_states')
      .select('event_data')
      .eq('event_key', `video_job:${jobId}`)
      .single();

    if (error || !data) {
      return NextResponse.json({ status: 'error', message: 'Job not found' }, { status: 404 });
    }

    const job = data.event_data as any;
    return NextResponse.json({
      status: 'completed',
      jobId,
      segments: job.segments?.length || 0,
      total_duration: job.totalDuration || 45,
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
