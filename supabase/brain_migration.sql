-- Catalyst Campaign Brain — Migration
-- Run this in Supabase SQL editor after the base schema.sql

-- Brain runs: log every morning decision
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

-- Brain memory: persistent per-campaign learning
CREATE TABLE IF NOT EXISTS brain_memory (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  topics_covered JSONB DEFAULT '[]',
  performance_patterns JSONB DEFAULT '{}',
  learned_preferences JSONB DEFAULT '{}',
  decision_history JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live event tracker: for sports live scores + breaking news
CREATE TABLE IF NOT EXISTS live_event_states (
  event_key TEXT PRIMARY KEY,
  campaign_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  last_processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add brain columns to existing episodes table
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS episode_type TEXT DEFAULT 'standard';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal'
  CHECK (urgency IN ('breaking', 'high', 'normal', 'low'));
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS auto_triggered BOOLEAN DEFAULT FALSE;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS pipeline_completed_at TIMESTAMPTZ;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS world_context_used JSONB DEFAULT '{}';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS brain_reasoning TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brain_runs_campaign_date ON brain_runs(campaign_id, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_live_event_states_type ON live_event_states(campaign_type);
