// ─── Existing CATALYST types (preserved) ─────────────────────────────────────

export interface Job {
  job_id: string
  status: 'queued' | 'rendering' | 'done' | 'error'
  model?: string
  narrative?: Narrative
  variation?: Variation
  created_at: string
  error?: string
}

export interface Narrative {
  title?: string
  hook: { headline: string; subtext: string; stat: string }
  problem: { headline: string; bullets: string[]; stat: string }
  solution: { headline: string; key_points: string[]; stat: string }
  cta: { text: string; urgency: string }
}

export interface Variation {
  palette: string
  motion_preset: string
  format: 'landscape' | 'vertical' | 'square'
  seed: number
}

export interface TutorialRequest {
  topic: string
  duration?: number
  palette?: string
  motion_preset?: string
  platform?: string
}

export interface SocialRequest {
  brief: string
  platform: 'reels' | 'tiktok' | 'shorts'
  palette?: string
}

export interface SportsRequest {
  fixture_id?: number
  home?: string
  away?: string
  competition?: string
  palette?: string
}

export interface BatchRequest {
  briefs: string[]
  platform?: string
  duration?: number
}

export interface PipelineItem {
  topic: string
  day: string
  status: number
  model: string
  cost: string
}

export interface Agent {
  name: string
  description: string
  status: 'active' | 'idle' | 'warn'
  lastTriggered?: string
  tag: string
}

export interface NarrativeOutput {
  title: string
  hook: { headline: string; subtext: string; stat: string }
  problem: { headline: string; bullets: string[]; stat: string }
  solution: { headline: string; key_points: string[]; stat: string }
  cta: { text: string; urgency: string }
  hashtags: string[]
  title_variants: string[]
  description: string
  virality_score: number
  virality_label: string
}

// ─── Content OS types ────────────────────────────────────────────────────────

export type CampaignType = 'ai-teaching' | 'social-branding' | 'football'
export type CampaignStatus = 'planning' | 'active' | 'paused' | 'completed'
export type EpisodeStatus = 'idea' | 'researched' | 'scripted' | 'video_generated' | 'scheduled' | 'posted' | 'analysed'
export type PlatformName = 'instagram' | 'youtube' | 'x' | 'linkedin'
export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'posted' | 'failed'

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  description?: string
  target_platforms: string[]
  start_date?: string
  end_date?: string
  status: CampaignStatus
  brand_voice?: string
  target_audience?: string
  accent_color: string
  created_at: string
  updated_at: string
}

export interface Episode {
  id: string
  campaign_id: string
  episode_number: number
  title?: string
  topic?: string
  status: EpisodeStatus
  scheduled_date?: string
  scheduled_time?: string
  research: ResearchBrief | Record<string, never>
  script: ScriptData | Record<string, never>
  video_job_id?: string
  video_url?: string
  virality_score?: number
  created_at: string
  updated_at: string
}

export interface PlatformPost {
  id: string
  episode_id: string
  platform: PlatformName
  caption?: string
  hashtags?: string[]
  title?: string
  description?: string
  ayrshare_post_id?: string
  status: PostStatus
  scheduled_at?: string
  posted_at?: string
  post_url?: string
  created_at: string
}

export interface AnalyticsData {
  id: string
  episode_id: string
  platform: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  ctr?: number
  retention_pct?: number
  impressions: number
  fetched_at: string
}

export interface ResearchBrief {
  topic_summary: string
  trending_score: number
  trend_direction: 'rising' | 'stable' | 'declining'
  hook_angles: { angle: string; why: string; predicted_virality: number }[]
  what_to_avoid: string[]
  hashtags: {
    instagram: string[]
    youtube: string[]
    x: string[]
    linkedin: string[]
  }
  competitor_insights: string
  unique_angle: string
  competing_videos?: CompetitorVideo[]
}

export interface CompetitorVideo {
  title: string
  views: number
  creator: string
  thumbnail?: string
  insight: string
}

export interface ScriptData {
  hook: { text: string; duration_seconds: number; virality_score: number }
  main_content: { text: string; sections: { title: string; text: string }[] }
  cta: {
    text: string
    platform_variants: {
      instagram: string
      youtube: string
      x: string
      linkedin: string
    }
  }
  metadata: {
    word_count: number
    estimated_duration_seconds: number
    youtube_title: string
    youtube_title_variants: string[]
    youtube_description: string
    linkedin_post: string
    x_thread: string[]
  }
}

export interface ViralityScore {
  overall_score: number
  label: 'Weak' | 'Average' | 'Good' | 'Great' | 'Viral'
  breakdown: {
    hook_strength: number
    pacing: number
    emotional_pull: number
    clarity: number
    cta_strength: number
  }
  platform_scores: Record<PlatformName, number>
  improvements: { issue: string; fix: string; impact: 'high' | 'medium' | 'low' }[]
  strengths: string[]
}

export interface AgentStep {
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
}

export interface ResearchCache {
  id: string
  topic: string
  platform?: string
  hashtags: string[]
  trending_score?: number
  competing_videos: CompetitorVideo[]
  ai_suggestions: string[]
  fetched_at: string
}
