export const MODELS = [
  { id: 'claude-opus-4-8',   label: 'Claude Opus 4.8',   inputCost: 5.00,  outputCost: 25.00, perVideo: 0.0002  },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', inputCost: 3.00,  outputCost: 15.00, perVideo: 0.0001  },
  { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  inputCost: 1.00,  outputCost: 5.00,  perVideo: 0.00005 },
  { id: 'nova-micro',        label: 'Nova Micro',         inputCost: 0.07,  outputCost: 0.35,  perVideo: 0.00001 },
  { id: 'nova-pro',          label: 'Nova Pro',           inputCost: 0.80,  outputCost: 3.20,  perVideo: 0.00008 },
  { id: 'nova-lite',         label: 'Nova Lite',          inputCost: 0.30,  outputCost: 1.20,  perVideo: 0.00003 },
]

export const VERTICALS = [
  { id: 'social',   label: 'Social Branding',  accent: '#f0522a', route: '/social'      },
  { id: 'ai',       label: 'AI Teaching',       accent: '#00c9a7', route: '/ai-teaching' },
  { id: 'football', label: 'Football / FIFA',   accent: '#f5c518', route: '/football'    },
]

export const PLATFORMS = ['youtube', 'reels', 'tiktok', 'shorts']

export const PALETTES = [
  'tutorial-neon', 'tutorial-warm', 'ai-electric', 'ai-cyber', 'ai-fire',
  'fifa-gold', 'fifa-red', 'fifa-cool', 'neon-purple', 'dark-bold'
]

// ─── Content OS Constants ────────────────────────────────────────────────────

export const CAMPAIGN_TYPES = [
  { id: 'ai-teaching' as const, label: 'AI Teaching', accent: '#00c9a7', icon: 'Brain' },
  { id: 'social-branding' as const, label: 'Social Branding', accent: '#f0522a', icon: 'Zap' },
  { id: 'football' as const, label: 'Football - FIFA WC 2026', accent: '#f5c518', icon: 'Trophy' },
]

export const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  planning: '#6c47ff',
  active: '#00c9a7',
  paused: '#f5c518',
  completed: '#22c55e',
}

export const EPISODE_STATUS_CONFIG: Record<string, { label: string; color: string; bgTint: string }> = {
  idea:            { label: 'Idea',        color: '#71717a', bgTint: 'rgba(113,113,122,0.08)' },
  researched:      { label: 'Researched',  color: '#3b82f6', bgTint: 'rgba(59,130,246,0.08)'  },
  scripted:        { label: 'Scripted',    color: '#8b5cf6', bgTint: 'rgba(139,92,246,0.08)'  },
  video_generated: { label: 'Video Ready', color: '#00c9a7', bgTint: 'rgba(0,201,167,0.08)'   },
  scheduled:       { label: 'Scheduled',   color: '#f5c518', bgTint: 'rgba(245,197,24,0.08)'  },
  posted:          { label: 'Posted',      color: '#22c55e', bgTint: 'rgba(34,197,94,0.08)'   },
  analysed:        { label: 'Analysed',    color: '#10b981', bgTint: 'rgba(16,185,129,0.12)'  },
}

export const SOCIAL_PLATFORMS = [
  { id: 'instagram' as const, label: 'Instagram',   color: '#e1306c', icon: 'Instagram' },
  { id: 'youtube'   as const, label: 'YouTube',     color: '#ff0000', icon: 'Youtube'   },
  { id: 'x'         as const, label: 'X (Twitter)', color: '#1da1f2', icon: 'Twitter'   },
  { id: 'linkedin'  as const, label: 'LinkedIn',    color: '#0077b5', icon: 'Linkedin'  },
]

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  youtube:   '#ff0000',
  x:         '#1da1f2',
  linkedin:  '#0077b5',
}

export const OPTIMAL_TIMES: Record<string, { day: string; time: string }[]> = {
  instagram: [{ day: 'any', time: '08:00' }, { day: 'any', time: '19:30' }],
  youtube:   [{ day: 'tue', time: '14:00' }, { day: 'thu', time: '15:00' }],
  x:         [{ day: 'weekday', time: '09:30' }],
  linkedin:  [{ day: 'tue', time: '09:00' }, { day: 'thu', time: '08:30' }],
}

export const MOTION_PRESETS = ['kinetic', 'smooth', 'dramatic', 'minimal']
export const VIDEO_FORMATS = ['landscape', 'vertical', 'square'] as const

export const ACCENT_COLORS = [
  '#6c47ff', '#f0522a', '#00c9a7', '#f5c518', '#e1306c', '#0077b5',
]

export const DURATION_OPTIONS = [
  { value: '15',  label: '15s'    },
  { value: '30',  label: '30s'    },
  { value: '60',  label: '60s'    },
  { value: '180', label: '3 min'  },
  { value: '600', label: '10 min' },
]

export const TONE_OPTIONS = ['Energetic', 'Educational', 'Conversational', 'Authoritative']

export const PLATFORM_FOCUS_OPTIONS = [
  { value: 'youtube-long',    label: 'YouTube Long'     },
  { value: 'youtube-shorts',  label: 'YouTube Shorts'   },
  { value: 'instagram-reels', label: 'Instagram Reels'  },
  { value: 'x',               label: 'X (Twitter)'      },
  { value: 'linkedin',        label: 'LinkedIn'          },
]

// Agent System Prompts
export const RESEARCH_AGENT_PROMPT = `You are a viral content research specialist for a creator making AI educational content and football/sports content.

Given a topic, analyze it and return a JSON research brief:
{
  "topic_summary": "2-sentence overview of this topic",
  "trending_score": 0-100,
  "trend_direction": "rising|stable|declining",
  "hook_angles": [
    {"angle": "...", "why": "...", "predicted_virality": 0-100},
    {"angle": "...", "why": "...", "predicted_virality": 0-100},
    {"angle": "...", "why": "...", "predicted_virality": 0-100}
  ],
  "what_to_avoid": ["overdone angles that have been done to death"],
  "hashtags": {
    "instagram": ["#tag1", ...12 tags],
    "youtube": ["tag1", ...10 tags without #],
    "x": ["#tag1", ...3 tags],
    "linkedin": ["#tag1", ...5 tags]
  },
  "competitor_insights": "What the top videos do that makes them work",
  "unique_angle": "The fresh take that hasn't been done yet"
}

Return ONLY valid JSON, no markdown or backticks.`

export const SCRIPT_AGENT_PROMPT = `You are an expert video script writer specializing in AI education and sports content for social media.

RULES:
- Hook MUST be in the first 3-5 words for short-form
- Use specific numbers over vague claims ("87% of developers" not "most developers")
- Write in second person ("you", not "one")
- No jargon without immediate explanation
- End with a specific, urgent CTA

SCRIPT FORMAT (return as JSON):
{
  "hook": { "text": "...", "duration_seconds": 5, "virality_score": 0-100 },
  "main_content": { "text": "...", "sections": [{"title": "...", "text": "..."}] },
  "cta": { "text": "...", "platform_variants": {"instagram": "...", "youtube": "...", "x": "...", "linkedin": "..."} },
  "metadata": {
    "word_count": 0,
    "estimated_duration_seconds": 0,
    "youtube_title": "...",
    "youtube_title_variants": ["...", "...", "..."],
    "youtube_description": "...",
    "linkedin_post": "...",
    "x_thread": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5"]
  }
}

Return ONLY valid JSON, no markdown or backticks.`

export const VIRALITY_AGENT_PROMPT = `You are a social media virality analyst. Score content on its potential to go viral and explain why.

Analyse the provided script and distribution copy. Return JSON:
{
  "overall_score": 0-100,
  "label": "Weak|Average|Good|Great|Viral",
  "breakdown": {
    "hook_strength": 0-100,
    "pacing": 0-100,
    "emotional_pull": 0-100,
    "clarity": 0-100,
    "cta_strength": 0-100
  },
  "platform_scores": {
    "instagram": 0-100,
    "youtube": 0-100,
    "x": 0-100,
    "linkedin": 0-100
  },
  "improvements": [
    {"issue": "...", "fix": "...", "impact": "high|medium|low"}
  ],
  "strengths": ["what's working well"]
}

Return ONLY valid JSON, no markdown or backticks.`
