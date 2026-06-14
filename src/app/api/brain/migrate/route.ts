import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time setup route — creates brain tables if they don't exist.
// Call GET /api/brain/migrate once to set up the database.
// DELETE this file after running successfully.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS brain_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  run_date DATE NOT NULL,
  reasoning TEXT,
  confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
  today_theme TEXT,
  episodes_created INTEGER DEFAULT 0,
  world_context JSONB DEFAULT '{}',
  full_decision JSONB DEFAULT '{}',
  ran_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brain_memory (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  topics_covered JSONB DEFAULT '[]',
  performance_patterns JSONB DEFAULT '{}',
  learned_preferences JSONB DEFAULT '{}',
  decision_history JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_event_states (
  event_key TEXT PRIMARY KEY,
  campaign_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  last_processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE episodes ADD COLUMN IF NOT EXISTS episode_type TEXT DEFAULT 'standard';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS auto_triggered BOOLEAN DEFAULT FALSE;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS pipeline_completed_at TIMESTAMPTZ;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS world_context_used JSONB DEFAULT '{}';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS brain_reasoning TEXT;

CREATE INDEX IF NOT EXISTS idx_brain_runs_campaign_date ON brain_runs(campaign_id, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_live_event_states_type ON live_event_states(campaign_type);
`

export async function GET() {
  try {
    // Test if brain_runs already exists
    const { error: checkErr } = await supabase.from('brain_runs').select('id').limit(1)

    if (!checkErr) {
      return NextResponse.json({ status: 'already_migrated', message: 'Brain tables already exist.' })
    }

    // Tables don't exist — try to create via RPC exec_sql if available
    const { error: rpcErr } = await (supabase as any).rpc('exec_sql', { sql: MIGRATION_SQL })

    if (rpcErr) {
      // Return the SQL for manual execution
      return NextResponse.json({
        status: 'manual_required',
        message: 'Service role key not set or exec_sql not available. Run the SQL below in your Supabase dashboard.',
        dashboard_url: `https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/sql/new`,
        sql: MIGRATION_SQL.trim()
      }, { status: 200 })
    }

    return NextResponse.json({ status: 'success', message: 'Brain tables created successfully.' })
  } catch (e: any) {
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 })
  }
}
