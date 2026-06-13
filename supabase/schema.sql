-- Catalyst Content OS — Supabase Schema

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ai-teaching', 'social-branding', 'football')),
  description TEXT,
  target_platforms TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
  brand_voice TEXT,
  target_audience TEXT,
  accent_color TEXT DEFAULT '#6c47ff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Episodes (one per day/content piece)
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT,
  topic TEXT,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'researched', 'scripted', 'video_generated', 'scheduled', 'posted', 'analysed')),
  scheduled_date DATE,
  scheduled_time TIME,
  research JSONB DEFAULT '{}',
  script JSONB DEFAULT '{}',
  video_job_id TEXT,
  video_url TEXT,
  virality_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform posts (per platform per episode)
CREATE TABLE platform_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube', 'x', 'linkedin')),
  caption TEXT,
  hashtags TEXT[],
  title TEXT,
  description TEXT,
  ayrshare_post_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'posted', 'failed')),
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  post_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics (pulled from platforms)
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  ctr DECIMAL(5,2),
  retention_pct DECIMAL(5,2),
  impressions INTEGER DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending research cache
CREATE TABLE research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  platform TEXT,
  hashtags JSONB DEFAULT '[]',
  trending_score INTEGER,
  competing_videos JSONB DEFAULT '[]',
  ai_suggestions JSONB DEFAULT '[]',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;

-- Open policies for single-user app (tighten for multi-user)
CREATE POLICY "Allow all" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow all" ON episodes FOR ALL USING (true);
CREATE POLICY "Allow all" ON platform_posts FOR ALL USING (true);
CREATE POLICY "Allow all" ON analytics FOR ALL USING (true);
CREATE POLICY "Allow all" ON research_cache FOR ALL USING (true);
