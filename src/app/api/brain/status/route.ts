import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaign')
  if (!campaignId) return NextResponse.json({ error: 'campaign param required' }, { status: 400 })

  const [latestRun, memory] = await Promise.all([
    supabase
      .from('brain_runs')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('ran_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('brain_memory')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()
  ])

  return NextResponse.json({
    latest_run: latestRun.data || null,
    memory: memory.data || null
  })
}
