import { z } from 'zod';
import { generateStructuredOutput } from '../utils/structuredOutput';
import { ModelRouter, modelRouter } from '../modelRouter';
import {
  type Campaign,
  type CalendarEpisodeDay,
  type MonthlyContentCalendar,
  MonthlyContentCalendarSchema,
} from '@/lib/campaign/types';
import { AntiGenericEngine, type EpisodeDNA } from '@/lib/video-spec/dna';
import type { VisualLanguageId } from '@/lib/video-spec/visual';

export interface GenerateCalendarInput {
  campaign: Campaign;
  year: number;
  month: number; // 1..12
  historicalDNA?: Array<{ dna: EpisodeDNA; date?: string; episodeId?: string }>;
}

export const CampaignDirectorOutputSchema = z.object({
  theme: z.string(),
  learningProgressionSummary: z.string(),
  days: z.array(z.object({
    dayIndex: z.number().int().min(1).max(31),
    date: z.string(),
    topic: z.string(),
    title: z.string(),
    contentPillar: z.string(),
    narrativeAngle: z.string(),
    hook: z.string(),
    estimatedDurationSeconds: z.number().positive().default(45),
    priority: z.enum(['high', 'standard', 'breaking']).default('standard'),
    suggestedVisualLanguage: z.string().default('editorial-paper'),
    suggestedComposition: z.string().default('monolithic_subject_hero'),
    suggestedMetaphor: z.string().default('Physical engineering schematic'),
  })),
});

export type CampaignDirectorOutput = z.infer<typeof CampaignDirectorOutputSchema>;

const STORY_STRUCTURES: EpisodeDNA['storyStructure'][] = [
  '7_beat_investigative',
  'problem_solution_breakthrough',
  'historical_chronology',
  'empirical_teardown',
  'planetary_macro_corridor',
  'counter_intuitive_disruption',
  'forensic_case_study',
  'architectural_blueprint_reveal',
];

const VISUAL_LANGUAGES: VisualLanguageId[] = [
  'investigative-editorial',
  '3d-semiconductor',
  'kinetic-headline',
  'geographic-story',
  'technical-blueprint',
  'editorial-paper',
  '3d-neural-network',
  'interface-explainer',
  '3d-fusion-reactor',
  'scientific-visualization',
  'satellite-reconnaissance',
  'hardware-cutout',
  'cinematic-photo',
  'financial-terminal',
  'cutout-explainer',
  'data-story',
  'evidence-board',
  'isometric-world',
  'archival-newspaper',
  '3d-robotics-arm',
  'cinematic-statistic',
  'timeline-reconstruction',
  'cinematic-outro',
];

const COMPOSITION_LANGUAGES: EpisodeDNA['compositionLanguage'][] = [
  'monolithic_subject_hero',
  'split_telemetry_grid',
  'diagonal_kinetic_drift',
  'isometric_schematic_plane',
  'archival_document_stack',
  'full_bleed_macro_optic',
  'multiplane_corridor_corridor',
  'brutalist_typographic_grid',
];

const MOTION_LANGUAGES: EpisodeDNA['motionLanguage'][] = [
  'high_velocity_kinetic',
  'editorial_spring_stagger',
  'micro_drift_cinematic',
  'laser_scanning_telemetry',
  'mechanical_assembly',
  'continuous_momentum_push',
  'rack_focus_depth_shift',
  'documentary_whip_snap',
];

const CAMERA_LANGUAGES: EpisodeDNA['cameraLanguage'][] = [
  'aggressive_push',
  'slow_parallax_orbit',
  'rack_focus_telephoto',
  'snap_zoom_reframe',
  'continuous_corridor_travel',
  'pan_diagonal_drift',
  'subtle_handheld_micro',
  'overhead_satellite_zoom',
];

const TYPOGRAPHY_LANGUAGES: EpisodeDNA['typographyLanguage'][] = [
  'brutalist_display_monolith',
  'monospace_telemetry_readout',
  'editorial_newsreader_serif',
  'kinetic_mask_reveal',
  'tracking_expansion_bold',
  'understated_archive_caption',
];

const TRANSITION_LANGUAGES: EpisodeDNA['transitionLanguage'][] = [
  'match_cut_geometric',
  'paper_rip_slide',
  'zoom_through_portal',
  'whip_pan_momentum',
  'laser_line_wipe',
  'foreground_element_transit',
  'crossfade_dissolve',
];

export async function runCampaignDirector(input: GenerateCalendarInput): Promise<MonthlyContentCalendar> {
  const { campaign, year, month, historicalDNA = [] } = input;
  
  // Calculate days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  const systemPrompt = `You are the Lead Campaign Director and Executive Content Strategist for Catalyst Content OS.
Your mission is to architect an authoritative, high-impact ${daysInMonth}-day monthly documentary content calendar for the campaign franchise "${campaign.name}".

CAMPAIGN DNA:
- Niche: ${campaign.niche}
- Target Audience: ${campaign.targetAudience}
- Tone: ${campaign.tone}
- Editorial Voice: ${campaign.editorialIdentity?.voice || 'Investigative, analytical, authoritative'}
- Content Pillars: ${campaign.contentPillars?.map(p => `"${p.title}" (${p.description})`).join(', ') || 'Core Technical Foundations, Breakthrough Innovations, Industry Scaling, Future Implications'}
- Preferred Duration: ${campaign.preferredDurationSeconds}s

MANDATORY EDITORIAL & DIVERSITY RULES:
1. PROGRESSIVE LEARNING ARC: Week 1 establishes foundations -> Week 2 explores friction/breakthroughs -> Week 3 analyzes planetary/economic scale -> Week 4 reveals future frontiers & payoffs.
2. STRICT TOPIC DIVERSITY: No two days may cover the exact same subject. Every episode must attack an independent, concrete angle.
3. VISUAL LANGUAGE VARIETY: Alternate between diverse documentary visual languages.
4. CONCRETE PHYSICAL METAPHORS: For every abstract concept, propose a concrete physical visual metaphor.
5. HOOK INTEGRITY: Every hook must be a counter-intuitive question, quantifiable disruption, or high-stakes reveal.

Return a strict JSON object conforming to the CampaignDirectorOutputSchema for all ${daysInMonth} days.`;

  const userPrompt = `Generate the complete ${daysInMonth}-day documentary content plan for:
Year: ${year}, Month: ${month} (1 to ${daysInMonth})
Campaign: "${campaign.name}"
Description: "${campaign.description || campaign.niche}"
Pillars: ${campaign.contentPillars?.map(p => p.title).join(' | ') || 'Foundations | Scale | Engineering | Macro Impact'}`;

  const generated = await generateStructuredOutput<CampaignDirectorOutput>({
    agentName: 'CampaignDirector',
    systemPrompt,
    userPrompt,
    schema: CampaignDirectorOutputSchema,
    maxTokens: 4096,
    fallbackGenerator: () => generateDeterministicMonthlyPlan(campaign, year, month, daysInMonth),
  });

  // Transform output days into CalendarEpisodeDay objects and compute EpisodeDNA + Novelty scores
  const memoryStack = [...historicalDNA];
  const calendarDays: CalendarEpisodeDay[] = [];

  for (let i = 0; i < daysInMonth; i++) {
    const rawDay = generated.days[i] || generateSingleDayFallback(campaign, year, month, i + 1);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    const epId = `ep_${campaign.id}_${year}_${month}_${i + 1}`;

    const preliminaryDNA: EpisodeDNA = {
      episodeId: epId,
      storyStructure: STORY_STRUCTURES[i % STORY_STRUCTURES.length],
      visualLanguage: (rawDay.suggestedVisualLanguage as VisualLanguageId) || VISUAL_LANGUAGES[i % VISUAL_LANGUAGES.length],
      compositionLanguage: (rawDay.suggestedComposition as any) || COMPOSITION_LANGUAGES[i % COMPOSITION_LANGUAGES.length],
      motionLanguage: MOTION_LANGUAGES[i % MOTION_LANGUAGES.length],
      cameraLanguage: CAMERA_LANGUAGES[i % CAMERA_LANGUAGES.length],
      typographyLanguage: TYPOGRAPHY_LANGUAGES[i % TYPOGRAPHY_LANGUAGES.length],
      transitionLanguage: TRANSITION_LANGUAGES[i % TRANSITION_LANGUAGES.length],
      assetTreatment: i % 2 === 0 ? 'cinematic_macro' : 'archival_grain',
      colorTreatment: {
        paletteId: i % 3 === 0 ? 'vox_investigation_dark' : i % 3 === 1 ? 'financial_terminal_amber' : 'deep_space_cyan',
        base: '#0b0d13',
        surface: '#161922',
        accent: i % 3 === 0 ? '#ffd166' : i % 3 === 1 ? '#00c9a7' : '#4cc9f0',
        secondaryAccent: '#00c9a7',
        highlight: '#f0522a',
        text: '#f8fafc',
        mutedText: '#94a3b8',
      },
      textureTreatment: {
        paperTexture: i % 2 === 0,
        grainIntensity: 0.10,
        blueprintGrid: i % 3 === 0,
        halftoneDotDensity: 4,
        vignetteIntensity: 0.40,
      },
      captionTreatment: {
        preset: 'vox-editorial',
        highlightColor: '#ffd166',
        fontSizePx: 42,
      },
      soundDesign: {
        musicGenre: i % 2 === 0 ? 'investigative_synth' : 'minimal_ambient',
        sfxKit: 'cinematic_whooshes',
        duckingPercentage: 0.25,
      },
      editingRhythm: {
        avgBeatDurationFrames: 70 + (i % 4) * 10,
        beatCountPerScene: 3,
        microPacingRamp: i % 2 === 0 ? 'escalating' : 'constant',
      },
      visualMetaphors: [
        {
          sceneIndex: 1,
          abstractConcept: rawDay.topic,
          concreteObject: rawDay.suggestedMetaphor || `Physical mechanical artifact #${i + 1}`,
        },
      ],
      endingTreatment: 'signature_brand_monolith',
    };

    // Calculate Novelty Score against existing memory stack
    let novelty = AntiGenericEngine.calculateNoveltyScore(preliminaryDNA, memoryStack);

    // Auto-redesign if below 75 threshold
    let redesignAttempts = 0;
    while (!novelty.passed && redesignAttempts < 10) {
      redesignAttempts++;
      preliminaryDNA.visualLanguage = VISUAL_LANGUAGES[(i + redesignAttempts * 3) % VISUAL_LANGUAGES.length];
      preliminaryDNA.compositionLanguage = COMPOSITION_LANGUAGES[(i + redesignAttempts) % COMPOSITION_LANGUAGES.length];
      preliminaryDNA.motionLanguage = MOTION_LANGUAGES[(i + redesignAttempts) % MOTION_LANGUAGES.length];
      preliminaryDNA.cameraLanguage = CAMERA_LANGUAGES[(i + redesignAttempts) % CAMERA_LANGUAGES.length];
      preliminaryDNA.visualMetaphors = [
        {
          sceneIndex: 1,
          abstractConcept: rawDay.topic,
          concreteObject: `Dynamic Redesigned Metaphor Alpha-${i}-${redesignAttempts}`,
        }
      ];
      novelty = AntiGenericEngine.calculateNoveltyScore(preliminaryDNA, memoryStack);
    }

    // Push into memory stack for subsequent days
    memoryStack.unshift({ dna: preliminaryDNA, date: dateStr, episodeId: epId });

    calendarDays.push({
      id: epId,
      campaignId: campaign.id,
      date: dateStr,
      dayIndex: i + 1,
      topic: rawDay.topic,
      title: rawDay.title,
      contentPillar: rawDay.contentPillar,
      narrativeAngle: rawDay.narrativeAngle,
      hook: rawDay.hook,
      estimatedDurationSeconds: rawDay.estimatedDurationSeconds || campaign.preferredDurationSeconds || 45,
      priority: rawDay.priority || 'standard',
      researchStatus: 'pending',
      scriptStatus: 'pending',
      visualStatus: 'pending',
      renderStatus: 'pending',
      publishingStatus: 'draft',
      overallStatus: 'DRAFT',
      visualNoveltyScore: novelty.score,
      noveltyBreakdown: novelty.breakdown,
    });
  }

  return {
    campaignId: campaign.id,
    year,
    month,
    days: calendarDays,
    generatedAt: new Date().toISOString(),
  };
}

function generateSingleDayFallback(
  campaign: Campaign,
  year: number,
  month: number,
  dayIndex: number
): CampaignDirectorOutput['days'][0] {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayIndex).padStart(2, '0')}`;
  const pillars = campaign.contentPillars?.length
    ? campaign.contentPillars.map(p => p.title)
    : ['Foundations', 'Engineering', 'Macro Scale', 'Future Horizons'];

  const pillar = pillars[(dayIndex - 1) % pillars.length];
  const vLang = VISUAL_LANGUAGES[(dayIndex - 1) % VISUAL_LANGUAGES.length];
  const cLang = COMPOSITION_LANGUAGES[(dayIndex - 1) % COMPOSITION_LANGUAGES.length];

  const concreteMetaphors = [
    'Transcontinental optical fiber corridor and silicon wafer cross-section',
    'High-energy cryogenic superconductor cooling manifold',
    'Distributed satellite mesh constellation and orbital ground stations',
    'Lithium-metal solid-state battery molecular lattice',
    'Toroidal magnetic plasma confinement vessel',
    'Micro-electromechanical gyroscope sensor array',
    'Autonomous sub-millisecond FPGA trading engine chassis',
    'CRISPR Cas9 ribonucleoprotein crystal structure',
    'Robotic harmonic gear actuator exploded assembly',
    'Global subsea telecommunications landing terminal',
  ];

  return {
    dayIndex,
    date: dateStr,
    topic: `${campaign.name}: Episode ${dayIndex} (${pillar})`,
    title: `${campaign.name} — Day ${dayIndex}: ${pillar} Deep Dive`,
    contentPillar: pillar,
    narrativeAngle: `Investigative empirical breakdown of ${pillar} and its practical engineering impact.`,
    hook: `Why the most critical bottleneck in ${campaign.niche} isn't software—it's physical infrastructure.`,
    estimatedDurationSeconds: campaign.preferredDurationSeconds || 45,
    priority: dayIndex % 7 === 0 ? 'high' : 'standard',
    suggestedVisualLanguage: vLang,
    suggestedComposition: cLang,
    suggestedMetaphor: concreteMetaphors[(dayIndex - 1) % concreteMetaphors.length],
  };
}

export function generateDeterministicMonthlyPlan(
  campaign: Campaign,
  year: number,
  month: number,
  daysInMonth: number
): CampaignDirectorOutput {
  const days: CampaignDirectorOutput['days'] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(generateSingleDayFallback(campaign, year, month, i));
  }

  return {
    theme: `${campaign.name} Monthly Master Series`,
    learningProgressionSummary: `Progresses from fundamental core mechanics in Week 1 to planetary and future technological breakthroughs in Week 4.`,
    days,
  };
}
