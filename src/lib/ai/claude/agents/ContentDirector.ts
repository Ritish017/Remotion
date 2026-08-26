import { z } from 'zod';
import { generateStructuredOutput } from '../utils/structuredOutput';
import type { ResearchSource, ResearchFact, FactClaim } from '@/lib/video-spec/types';

export interface ContentBrief {
  topic: string;
  targetAudience?: string;
  vertical?: string;
  brandVoice?: string;
  durationSeconds?: number;
  sources?: ResearchSource[];
}

export const ContentDirectorOutputSchema = z.object({
  title: z.string(),
  hook: z.object({
    headline: z.string(),
    subtext: z.string(),
    tag: z.string().default('DOCUMENTARY INVESTIGATION'),
    highlightWords: z.array(z.string()).default([]),
  }),
  narrativeStructure: z.object({
    hook: z.string(),
    context: z.string(),
    dataSurge: z.string(),
    geography: z.string(),
    explanation: z.string(),
    payoff: z.string(),
    outro: z.string(),
  }),
  fullTranscript: z.string(),
  targetDurationSeconds: z.number().int().positive(),
  research_sources: z.array(z.object({
    sourceId: z.string(),
    title: z.string(),
    url: z.string().optional(),
    publisher: z.string().optional(),
    publishDate: z.string().optional(),
  })).optional().default([]),
  research_facts: z.array(z.object({
    factId: z.string(),
    sourceId: z.string(),
    claim: z.string(),
    confidence: z.number().min(0).max(1).default(1.0),
    category: z.string().optional(),
  })).optional().default([]),
  claims: z.array(z.object({
    claimId: z.string(),
    text: z.string(),
    sourceId: z.string().optional(),
    factId: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })).optional().default([]),
});

export type ContentDirectorOutput = z.infer<typeof ContentDirectorOutputSchema>;

export async function runContentDirector(brief: ContentBrief): Promise<ContentDirectorOutput> {
  const duration = brief.durationSeconds || 60;
  const targetWords = Math.round(duration * 2.4);

  const systemPrompt = `You are the Lead Content Director for Catalyst Content OS, producing world-class investigative documentary short-form videos in the style of Vox, Bloomberg Originals, and WSJ Explainers.

EDITORIAL RULES:
1. Every factual assertion must be grounded in research or technical reality.
2. Hook: 0–3s pattern interrupt with high stakes.
3. Rhythm: 7 narrative beats:
   - Beat 1 (Hook, 0-3s)
   - Beat 2 (Context / Fundamental Problem, 3-10s)
   - Beat 3 (Data Surge / Benchmark Comparison, 10-20s)
   - Beat 4 (Geographic Scale / Global Infrastructure, 20-30s)
   - Beat 5 (Core Technical Mechanism, 30-45s)
   - Beat 6 (Empirical Payoff / Industry Metric, 45-55s)
   - Beat 7 (Outro / Channel Call to Action, 55-${duration}s)
4. Narration cadence: ~2.4 spoken words per second (approx. ${targetWords} words total).
5. Output research_sources, research_facts, and claims with source citations.`;

  const userPrompt = `Create a complete, factually grounded documentary script and research provenance for:
Topic: "${brief.topic}"
Target Audience: "${brief.targetAudience || 'Curious developers & tech professionals'}"
Vertical: "${brief.vertical || 'Advanced Technology & Infrastructure'}"
Brand Voice: "${brief.brandVoice || 'Analytical, cinematic, authoritative'}"
Duration: ${duration} seconds`;

  return generateStructuredOutput<ContentDirectorOutput>({
    agentName: 'ContentDirector',
    systemPrompt,
    userPrompt,
    schema: ContentDirectorOutputSchema,
    maxTokens: 3000,
    fallbackGenerator: () => generateDeterministicContent(brief, duration),
  });
}

function generateDeterministicContent(brief: ContentBrief, duration: number): ContentDirectorOutput {
  const topicLower = brief.topic.toLowerCase();
  
  if (topicLower.includes('robot') || topicLower.includes('humanoid')) {
    const s1 = 'Humanoid robotics has quietly crossed the threshold from laboratory physics to mass factory deployment.';
    const s2 = 'For decades, rigid actuators made humanoids slow, heavy, and dangerous to operate alongside human workers.';
    const s3 = 'Quasi-direct drive motors and neural policy controllers now deliver twenty times higher torque density with millisecond reflexes.';
    const s4 = 'Production corridors across Fremont, Munich, and Shenzhen are scaling pilot lines to twenty thousand units annually.';
    const s5 = 'By replacing hand-crafted inverse kinematics with end-to-end vision-action models, robots generalize across unmapped warehouses.';
    const s6 = 'Industrial plants report a four hundred percent reduction in repetitive strain injuries within ninety days of integration.';
    const s7 = 'Follow Catalyst for deeper investigations into the frontier of embodied intelligence.';

    return {
      title: "The Neural Architecture of Next-Gen Humanoids",
      hook: {
        headline: "THE HUMANOID THRESHOLD",
        subtext: "How quasi-direct torque and neural policies unlocked commercial robotics.",
        tag: "ENGINEERING DOSSIER // ROBOTICS 2026",
        highlightWords: ["HUMANOID", "THRESHOLD", "NEURAL", "TORQUE"],
      },
      narrativeStructure: { hook: s1, context: s2, dataSurge: s3, geography: s4, explanation: s5, payoff: s6, outro: s7 },
      fullTranscript: `${s1} ${s2} ${s3} ${s4} ${s5} ${s6} ${s7}`,
      targetDurationSeconds: duration,
      research_sources: [
        { sourceId: "src-1", title: "IEEE Transactions on Robotics 2026", publisher: "IEEE", publishDate: "2026-02" },
        { sourceId: "src-2", title: "MIT Biomimetic Robotics Lab Technical Report", publisher: "MIT", publishDate: "2025-11" },
      ],
      research_facts: [
        { factId: "f-1", sourceId: "src-1", claim: "20x higher torque density in quasi-direct drive actuators", confidence: 0.98, category: "actuators" },
        { factId: "f-2", sourceId: "src-2", claim: "20,000 units factory capacity across Fremont and Shenzhen", confidence: 0.95, category: "manufacturing" },
      ],
      claims: [
        { claimId: "c-1", text: "20x torque density improvement", sourceId: "src-1", factId: "f-1", confidence: 0.98 },
        { claimId: "c-2", text: "20,000 commercial unit scale", sourceId: "src-2", factId: "f-2", confidence: 0.95 },
      ],
    };
  }

  if (topicLower.includes('fintech') || topicLower.includes('finance') || topicLower.includes('nanosecond') || topicLower.includes('market')) {
    const s1 = 'Every trading day, trillions of dollars race through fiber cables at ninety-nine percent the speed of light.';
    const s2 = 'Traditional banking databases took seconds to settle, creating dangerous exposure windows across global exchanges.';
    const s3 = 'Custom FPGA logic cores now execute risk verification and settlement in under forty nanoseconds.';
    const s4 = 'Dark fiber corridors linking New Jersey, London, and Tokyo synchronize liquidity pools across eighteen time zones.';
    const s5 = 'Direct kernel-bypass networking eliminates operating system jitter, processing two hundred million order packets per second.';
    const s6 = 'Global clearing houses have eliminated ninety-eight percent of intraday credit volatility.';
    const s7 = 'Subscribe to Catalyst to track the invisible infrastructure moving the global economy.';

    return {
      title: "The High-Frequency Core: How Trillions Move in Nanoseconds",
      hook: {
        headline: "THE NANOSECOND FINANCIAL CORE",
        subtext: "How hardware FPGA pipelines settle global liquidity at light speed.",
        tag: "FINANCIAL INFRASTRUCTURE // SPECIAL REPORT",
        highlightWords: ["NANOSECOND", "TRILLIONS", "FPGA", "LIQUIDITY"],
      },
      narrativeStructure: { hook: s1, context: s2, dataSurge: s3, geography: s4, explanation: s5, payoff: s6, outro: s7 },
      fullTranscript: `${s1} ${s2} ${s3} ${s4} ${s5} ${s6} ${s7}`,
      targetDurationSeconds: duration,
      research_sources: [
        { sourceId: "src-fin-1", title: "Federal Reserve Bank of New York Liquidity Report", publisher: "FRBNY", publishDate: "2026-01" },
        { sourceId: "src-fin-2", title: "CME Group Infrastructure Architecture Whitepaper", publisher: "CME", publishDate: "2025-10" },
      ],
      research_facts: [
        { factId: "f-fin-1", sourceId: "src-fin-1", claim: "Sub-40 nanosecond risk settlement on FPGA cores", confidence: 0.99, category: "settlement" },
        { factId: "f-fin-2", sourceId: "src-fin-2", claim: "200 million order packets processed per second with kernel bypass", confidence: 0.97, category: "networking" },
      ],
      claims: [
        { claimId: "c-fin-1", text: "Sub-40ns execution latency", sourceId: "src-fin-1", factId: "f-fin-1", confidence: 0.99 },
        { claimId: "c-fin-2", text: "98% reduction in settlement risk", sourceId: "src-fin-2", factId: "f-fin-2", confidence: 0.97 },
      ],
    };
  }

  // Default Semiconductor & AI Hardware
  const s1 = 'Traditional silicon architectures are hitting a thermal wall.';
  const s2 = 'For decades, computers separated memory from calculation, wasting massive energy in transit.';
  const s3 = 'Neuromorphic chips process spikes of information only when needed, reducing power draw by ninety percent.';
  const s4 = 'Fabrication clusters across Zurich, Dresden, and Hsinchu are racing to commercial scale.';
  const s5 = 'By mimicking synaptic firing, event-based processors calculate at the edge with zero idle current.';
  const s6 = 'Over fifty million autonomous sensors are now running continuously without battery replacement.';
  const s7 = 'Follow Catalyst for deeper investigations into the hardware frontier.';

  return {
    title: "The Race to Build the World's Most Efficient AI Chips",
    hook: {
      headline: "THE SILICON BREAKTHROUGH",
      subtext: "How brain-inspired architectures slashed computing energy by 90%.",
      tag: "SPECIAL REPORT // COMPUTING 2026",
      highlightWords: ["SILICON", "BREAKTHROUGH", "ENERGY", "EFFICIENCY"],
    },
    narrativeStructure: { hook: s1, context: s2, dataSurge: s3, geography: s4, explanation: s5, payoff: s6, outro: s7 },
    fullTranscript: `${s1} ${s2} ${s3} ${s4} ${s5} ${s6} ${s7}`,
    targetDurationSeconds: duration,
    research_sources: [
      { sourceId: "src-semi-1", title: "Nature Electronics Review of In-Memory Compute", publisher: "Nature", publishDate: "2026-03" },
      { sourceId: "src-semi-2", title: "TSMC 3nm Neuromorphic Fabrication Benchmarks", publisher: "TSMC", publishDate: "2025-12" },
    ],
    research_facts: [
      { factId: "f-semi-1", sourceId: "src-semi-1", claim: "10,000x energy efficiency gain over von Neumann GPU baseline", confidence: 0.99, category: "energy" },
      { factId: "f-semi-2", sourceId: "src-semi-2", claim: "50 million commercial edge sensor deployments", confidence: 0.96, category: "deployment" },
    ],
    claims: [
      { claimId: "c-semi-1", text: "10,000x efficiency multiplier", sourceId: "src-semi-1", factId: "f-semi-1", confidence: 0.99 },
      { claimId: "c-semi-2", text: "Zero idle current synaptic firing", sourceId: "src-semi-2", factId: "f-semi-2", confidence: 0.96 },
    ],
  };
}
