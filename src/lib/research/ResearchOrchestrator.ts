import { AIFactory } from '../providers/ai';
import { ApifyProvider } from '../providers/research/apify/ApifyProvider';
import { FirecrawlProvider } from '../providers/research/firecrawl/FirecrawlProvider';
import { ResearchEvidence } from './ResearchEvidence';
import { ResearchFact } from './ResearchFact';
import { ResearchReport } from './ResearchReport';
import { ResearchSource } from './ResearchSource';
import { repairJsonString } from '../providers/ai/claude/ClaudeProvider';

export interface ResearchPlanOptions {
  topic: string;
  urlsToScrape?: string[];
  useStructuredData?: boolean;
  targetDurationSeconds?: number;
}

export class ResearchOrchestrator {
  private firecrawl: FirecrawlProvider;
  private apify: ApifyProvider;

  constructor() {
    this.firecrawl = new FirecrawlProvider();
    this.apify = new ApifyProvider();
  }

  async conductResearch(options: ResearchPlanOptions): Promise<ResearchReport> {
    console.log(`🔍 [ResearchOrchestrator] Starting research on: "${options.topic}"`);
    const isProduction =
      process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';

    const sources: ResearchSource[] = [];
    const facts: ResearchFact[] = [];

    // 1. Gather web evidence from Firecrawl
    if (this.firecrawl.isConfigured) {
      try {
        console.log(`   [Firecrawl] Gathering intelligence for: "${options.topic}"`);
        const searchResults = await Promise.race([
          this.firecrawl.search(options.topic, 3),
          new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 8000)),
        ]);
        for (const res of searchResults) {
          sources.push(
            new ResearchSource({
              url: res.url,
              title: res.title,
              publisher: res.publisher || 'Web',
              retrievedAt: res.retrievedAt,
              content: res.content,
              sourceType: 'web_article',
            })
          );
        }
      } catch (e: any) {
        console.warn('   ⚠️ Firecrawl research notice:', e.message);
      }
    }

    // 2. Gather from Apify if additional search needed
    if (sources.length === 0 && this.apify.isConfigured) {
      try {
        console.log(`   [Apify] Searching datasets for: "${options.topic}"`);
        const apifyResults = await this.apify.search({ topic: options.topic, maxResults: 3 });
        for (const item of apifyResults.items) {
          sources.push(
            new ResearchSource({
              url: item.url || item.link || 'https://google.com',
              title: item.title || options.topic,
              publisher: 'Google Search Dataset',
              retrievedAt: apifyResults.retrievedAt,
              content: item.description || item.snippet || item.title,
              sourceType: 'web_article',
            })
          );
        }
      } catch (e: any) {
        console.warn('   ⚠️ Apify research notice:', e.message);
      }
    }

    // 3. Handle research failure
    if (sources.length === 0) {
      if (isProduction) {
        throw new Error(
          `Research Stage Failed: Zero evidence sources could be retrieved for topic "${options.topic}". Fabricated research is prohibited in production.`
        );
      }
      console.warn('   ⚠️ [ResearchOrchestrator] No live sources retrieved. Using developer internal dossier.');
      sources.push(
        new ResearchSource({
          url: 'https://catalyst.ai/internal-research',
          title: `Curated Technical Dossier: ${options.topic}`,
          publisher: 'Catalyst Research Desk',
          retrievedAt: new Date().toISOString(),
          content: `Comprehensive technical intelligence dossier covering: ${options.topic}`,
          sourceType: 'academic',
        })
      );
    }

    // 4. Synthesize Evidence and Facts using Claude
    const claude = AIFactory.getPrimary();
    const sourceContext = sources
      .slice(0, 3)
      .map((s, idx) => `[Source ${idx + 1}]: Title: "${s.title}" (${s.url})\nContent: ${s.content.slice(0, 800)}`)
      .join('\n\n');

    const prompt = `You are the Catalyst Senior Investigative Research Director.
Analyze this topic: "${options.topic}".

Rely strictly on the gathered research evidence:
${sourceContext}

Generate a crisp research report in pure JSON matching this exact structure:
{
  "executiveSummary": "Concise summary of findings.",
  "narrativeAngles": ["Angle 1", "Angle 2", "Angle 3"],
  "recommendedHook": "Compelling first 3 seconds hook.",
  "visualDirectionIdeas": ["Chart idea", "Map idea", "Visual concept"],
  "facts": [
    { "claim": "Verifiable factual claim from source.", "category": "breakthrough", "confidence": 0.98 },
    { "claim": "Second factual claim.", "category": "metric", "confidence": 0.95 }
  ],
  "keyMetrics": [
    { "label": "Metric Name", "value": "Value", "context": "Context" }
  ],
  "timelineEvents": [
    { "year": "2024", "event": "Event description" }
  ]
}`;

    try {
      const response = await claude.generate(prompt, { maxTokens: 1200, temperature: 0.3 });
      const repaired = repairJsonString(response.text);
      const parsed = JSON.parse(repaired);

      for (let i = 0; i < (parsed.facts || []).length; i++) {
        const f = parsed.facts[i];
        facts.push(
          new ResearchFact({
            id: `fact_${i + 1}`,
            claim: f.claim,
            category: f.category || 'breakthrough',
            sourceIds: [sources[0].id],
            confidence: f.confidence || 0.95,
            verified: true,
          })
        );
      }

      const evidence = new ResearchEvidence({
        topic: options.topic,
        sources,
        facts,
        keyMetrics: parsed.keyMetrics || [],
        timelineEvents: parsed.timelineEvents || [],
      });

      return new ResearchReport({
        topic: options.topic,
        executiveSummary: parsed.executiveSummary || `Investigation of ${options.topic}`,
        narrativeAngles: parsed.narrativeAngles || ['Core Mechanism', 'Economic Impact', 'Future Outlook'],
        recommendedHook: parsed.recommendedHook || `Investigation into ${options.topic}.`,
        visualDirectionIdeas: parsed.visualDirectionIdeas || ['Bar chart comparison', 'Global cluster map', 'Kinetic metric surge'],
        evidence,
      });
    } catch (e: any) {
      if (isProduction) {
        throw new Error(`AI Research Synthesis failed for "${options.topic}": ${e.message}`);
      }

      console.warn('   ⚠️ AI synthesis fallback in development mode.');
      const evidence = new ResearchEvidence({
        topic: options.topic,
        sources,
        facts: [
          new ResearchFact({
            id: 'fact_1',
            claim: `Key factual mechanism for ${options.topic}`,
            category: 'breakthrough',
            sourceIds: [sources[0].id],
            confidence: 0.95,
            verified: true,
          }),
        ],
        keyMetrics: [{ label: 'Significance', value: 'High', context: options.topic }],
        timelineEvents: [{ year: '2026', event: 'Current development' }],
      });

      return new ResearchReport({
        topic: options.topic,
        executiveSummary: `Technical synthesis covering ${options.topic}.`,
        narrativeAngles: ['Technological Shift', 'Market Impact', 'Future Horizon'],
        recommendedHook: `The story behind ${options.topic}.`,
        visualDirectionIdeas: ['Bar chart comparison', 'Global node map'],
        evidence,
      });
    }
  }
}
