import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
);

export async function GET() {
  try {
    const { data: renderJobs, error } = await supabase
      .from('render_jobs')
      .select('*')
      .order('requested_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ invocations: [], in_progress: 0, total: 0 });
    }

    const invocations = (renderJobs || []).map((j: any) => ({
      arn: j.render_id || j.job_id,
      status: j.status,
      submitTime: j.requested_at,
      endTime: j.completed_at,
    }));

    const inProgress = invocations.filter((i: any) => i.status === 'RENDERING' || i.status === 'QUEUED');
    return NextResponse.json({
      invocations,
      in_progress: inProgress.length,
      total: invocations.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
