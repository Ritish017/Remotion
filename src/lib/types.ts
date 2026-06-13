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
