import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaign')
  if (!campaignId) return NextResponse.json({ error: 'campaign param required' }, { status: 400 })

  const { data, error } = await supabase
    .from('brain_runs')
    .select('id, run_date, reasoning, confidence, today_theme, episodes_created, ran_at')
    .eq('campaign_id', campaignId)
    .order('ran_at', { ascending: false })
    .limit(30)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data || [])
}
