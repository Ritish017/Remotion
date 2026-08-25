-- Remotion & AI Video Engine Migration
-- Adds tables for VideoSpec storage, Storyboards, Render Jobs, Brand DNA, and Automated QA

-- 1. Channel Brand DNA
CREATE TABLE IF NOT EXISTS channel_brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '{}',
  typography JSONB NOT NULL DEFAULT '{}',
  motion_style TEXT NOT NULL DEFAULT 'editorial',
  textures JSONB DEFAULT '{}',
  caption_style JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Video Specs (Zod-validated JSON specifications)
CREATE TABLE IF NOT EXISTS video_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_id TEXT NOT NULL UNIQUE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT '9:16',
  duration_frames INTEGER NOT NULL,
  fps INTEGER NOT NULL DEFAULT 30,
  spec_data JSONB NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Video Storyboards
CREATE TABLE IF NOT EXISTS video_storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_id TEXT REFERENCES video_specs(spec_id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  narrative_structure JSONB DEFAULT '{}',
  scenes JSONB NOT NULL DEFAULT '[]',
  full_transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Render Jobs (Remotion Lambda / S3)
CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL UNIQUE,
  spec_id TEXT,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  composition_id TEXT NOT NULL DEFAULT 'VerticalExplainer',
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PREPARING', 'RENDERING', 'UPLOADING', 'COMPLETED', 'FAILED')),
  progress INTEGER DEFAULT 0,
  output_url TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Video Assets Registry
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'icon', 'logo', 'map', 'music', 'voice', 'sfx', 'font', 'texture')),
  url TEXT NOT NULL,
  source TEXT,
  license TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  visual_meaning TEXT,
  usage_rights TEXT DEFAULT 'commercial_allowed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Production QA Logs
CREATE TABLE IF NOT EXISTS production_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_id TEXT,
  passed BOOLEAN NOT NULL DEFAULT TRUE,
  score INTEGER NOT NULL DEFAULT 100,
  report JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Configuration
ALTER TABLE channel_brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on channel_brand_dna" ON channel_brand_dna FOR ALL USING (true);
CREATE POLICY "Allow all on video_specs" ON video_specs FOR ALL USING (true);
CREATE POLICY "Allow all on video_storyboards" ON video_storyboards FOR ALL USING (true);
CREATE POLICY "Allow all on render_jobs" ON render_jobs FOR ALL USING (true);
CREATE POLICY "Allow all on video_assets" ON video_assets FOR ALL USING (true);
CREATE POLICY "Allow all on production_qa" ON production_qa FOR ALL USING (true);
