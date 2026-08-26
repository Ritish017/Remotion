import { z } from 'zod';
import type { VisualLanguageId } from '../video-spec/visual';

export const ContentPillarSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  weight: z.number().min(0).max(1).default(0.25),
});

export type ContentPillar = z.infer<typeof ContentPillarSchema>;

export const PlatformTargetSchema = z.enum([
  'youtube-shorts',
  'tiktok',
  'instagram-reels',
  'x-video',
  'linkedin'
]);

export type PlatformTarget = z.infer<typeof PlatformTargetSchema>;

export const EditorialIdentitySchema = z.object({
  voice: z.string().default('Investigative, analytical, authoritative, cinematic'),
  narrativePacing: z.enum(['fast', 'documentary', 'deep-dive']).default('documentary'),
  complexityLevel: z.enum(['beginner', 'intermediate', 'expert', 'progressive']).default('progressive'),
  citationStandard: z.enum(['rigorous_academic', 'newsroom_verified', 'industry_empirical']).default('industry_empirical'),
});

export type EditorialIdentity = z.infer<typeof EditorialIdentitySchema>;

export const VisualIdentitySchema = z.object({
  primaryPalette: z.string().default('vox_investigation_dark'),
  typographyDisplay: z.string().default('Inter, system-ui, sans-serif'),
  typographyMono: z.string().default('JetBrains Mono, monospace'),
  textureStyle: z.enum(['paper_grain', 'blueprint_grid', 'film_grain', 'clean_vector']).default('paper_grain'),
  editorialMarksStyle: z.enum(['red_marker', 'patent_cyan', 'declassified_amber']).default('red_marker'),
});

export type VisualIdentity = z.infer<typeof VisualIdentitySchema>;

export const NarrationStyleSchema = z.object({
  voice: z.enum(['onyx', 'echo', 'alloy', 'fable', 'nova', 'shimmer']).default('onyx'),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  cadenceWordsPerSec: z.number().default(2.4),
});

export type NarrationStyle = z.infer<typeof NarrationStyleSchema>;

export const CTAStrategySchema = z.object({
  hookOutro: z.string().default('Follow for daily deep dives'),
  channelHandle: z.string().default('@CatalystOS'),
  actionPrompt: z.string().default('Subscribe for full analysis'),
});

export type CTAStrategy = z.infer<typeof CTAStrategySchema>;

export const MonthlyStrategySchema = z.object({
  theme: z.string(),
  learningProgressionEnabled: z.boolean().default(true),
  weeklyFocus: z.array(z.object({
    week: z.number(),
    focus: stringOrEmpty(),
  })).default([]),
});

function stringOrEmpty() {
  return z.string().default('');
}

export type MonthlyStrategy = z.infer<typeof MonthlyStrategySchema>;

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  niche: z.string().default('Future Technology & AI'),
  targetAudience: z.string().default('Curious builders, developers, and tech professionals'),
  platforms: z.array(PlatformTargetSchema).default(['youtube-shorts', 'tiktok', 'instagram-reels']),
  publishingFrequency: z.enum(['daily', 'weekdays', 'tri-weekly']).default('daily'),
  contentPillars: z.array(ContentPillarSchema).default([]),
  tone: z.string().default('Investigative, high stakes, empirical, cinematic'),
  editorialIdentity: EditorialIdentitySchema.optional().default({
    voice: 'Investigative, analytical, authoritative',
    narrativePacing: 'documentary',
    complexityLevel: 'progressive',
    citationStandard: 'industry_empirical',
  }),
  visualIdentity: VisualIdentitySchema.optional().default({
    primaryPalette: 'vox_investigation_dark',
    typographyDisplay: 'Inter, system-ui, sans-serif',
    typographyMono: 'JetBrains Mono, monospace',
    textureStyle: 'paper_grain',
    editorialMarksStyle: 'red_marker',
  }),
  preferredDurationSeconds: z.number().positive().default(45),
  aspectRatios: z.array(z.enum(['9:16', '16:9', '1:1'])).default(['9:16']),
  narrationStyle: NarrationStyleSchema.optional().default({
    voice: 'onyx',
    speed: 1.0,
    cadenceWordsPerSec: 2.4,
  }),
  ctaStrategy: CTAStrategySchema.optional().default({
    hookOutro: 'Follow Catalyst Content OS for daily engineering breakdowns.',
    channelHandle: '@CatalystOS',
    actionPrompt: 'Subscribe for the next episode.',
  }),
  monthlyStrategy: MonthlyStrategySchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const EpisodeProductionStatusSchema = z.enum([
  'PLANNED',
  'RESEARCHING',
  'RESEARCH_COMPLETE',
  'SCRIPTING',
  'SCRIPT_COMPLETE',
  'STORYBOARDING',
  'VISUAL_DIRECTION_COMPLETE',
  'VOICE_COMPLETE',
  'PREVIEW_READY',
  'NEEDS_REVISION',
  'APPROVED',
  'RENDERING',
  'QA',
  'COMPLETED',
  'FAILED'
]);

export type EpisodeProductionStatus = z.infer<typeof EpisodeProductionStatusSchema>;

export const CalendarEpisodeDaySchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  date: z.string(), // YYYY-MM-DD
  dayIndex: z.number().int().min(1).max(31),
  topic: z.string(),
  title: z.string(),
  contentPillar: z.string(),
  narrativeAngle: z.string(),
  hook: z.string(),
  estimatedDurationSeconds: z.number().positive().default(45),
  priority: z.enum(['high', 'standard', 'breaking']).default('standard'),
  
  // Pipeline Lifecycle States
  researchStatus: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  scriptStatus: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  visualStatus: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  renderStatus: z.enum(['pending', 'queued', 'rendering', 'completed', 'failed']).default('pending'),
  publishingStatus: z.enum(['draft', 'scheduled', 'published']).default('draft'),
  overallStatus: EpisodeProductionStatusSchema.default('PLANNED'),
  
  // Anti-Generic Intelligence
  visualNoveltyScore: z.number().min(0).max(100).optional(),
  noveltyBreakdown: z.object({
    visualLanguageNovelty: z.number(),
    compositionNovelty: z.number(),
    motionNovelty: z.number(),
    cameraNovelty: z.number(),
    metaphorNovelty: z.number(),
  }).optional(),
  renderJobId: z.string().optional(),
  outputMp4Path: z.string().optional(),
});

export type CalendarEpisodeDay = z.infer<typeof CalendarEpisodeDaySchema>;

export const MonthlyContentCalendarSchema = z.object({
  campaignId: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  days: z.array(CalendarEpisodeDaySchema),
  generatedAt: z.string(),
});

export type MonthlyContentCalendar = z.infer<typeof MonthlyContentCalendarSchema>;
