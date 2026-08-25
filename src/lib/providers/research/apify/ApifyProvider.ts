import type { ProviderHealth } from '../../ai/types';
import type { IApifyProvider, StructuredResearchQuery, StructuredResearchResult } from '../types';

const ALLOWLISTED_ACTORS = new Set([
  'apify/google-search-scraper',
  'apify/website-content-crawler',
  'apify/web-scraper',
]);

export class ApifyProvider implements IApifyProvider {
  private get apiToken(): string {
    return process.env.APIFY_API_TOKEN || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiToken && this.apiToken.trim().length > 0);
  }

  async runActor(actorId: string, input: Record<string, any>): Promise<any[]> {
    if (!this.isConfigured) {
      throw new Error('Apify is not configured. Set APIFY_API_TOKEN in environment.');
    }

    if (!ALLOWLISTED_ACTORS.has(actorId)) {
      throw new Error(`Apify Actor [${actorId}] is not in the verified allowlist.`);
    }

    const formattedActor = encodeURIComponent(actorId.replace('/', '~'));
    const url = `https://api.apify.com/v2/acts/${formattedActor}/run-sync-get-dataset-items?token=${this.apiToken}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Apify Actor execution error (${res.status}): ${err}`);
    }

    return res.json();
  }

  async search(query: StructuredResearchQuery): Promise<StructuredResearchResult> {
    if (!this.isConfigured) {
      return {
        source: 'Apify',
        items: [],
        totalResults: 0,
        retrievedAt: new Date().toISOString(),
      };
    }

    try {
      const items = await this.runActor('apify/google-search-scraper', {
        queries: query.topic,
        maxPagesPerQuery: 1,
        resultsPerPage: query.maxResults || 5,
      });

      return {
        source: 'Apify Google Search Scraper',
        items,
        totalResults: items.length,
        retrievedAt: new Date().toISOString(),
      };
    } catch (e: any) {
      console.warn('[Apify] Search error:', e.message);
      return {
        source: 'Apify',
        items: [],
        totalResults: 0,
        retrievedAt: new Date().toISOString(),
      };
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'Apify',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'APIFY_API_TOKEN is not configured',
      };
    }

    try {
      const res = await fetch(`https://api.apify.com/v2/users/me?token=${this.apiToken}`);
      return {
        provider: 'Apify',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        provider: 'Apify',
        configured: true,
        reachable: false,
        authenticated: false,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: e.message,
      };
    }
  }
}
