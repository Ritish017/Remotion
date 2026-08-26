import crypto from 'crypto';
import type { ProviderHealth } from '../../ai/types';
import type { CrawlOptions, IFirecrawlProvider, ScrapedEvidence } from '../types';

export class FirecrawlProvider implements IFirecrawlProvider {
  private get apiKey(): string {
    return process.env.FIRECRAWL_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async scrape(url: string): Promise<ScrapedEvidence> {
    if (!this.isConfigured) {
      throw new Error('Firecrawl is not configured. Set FIRECRAWL_API_KEY in environment.');
    }

    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Firecrawl scrape error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const result = data.data || {};
    const markdown = result.markdown || '';
    const title = result.metadata?.title || 'Web Research Source';
    const publisher = result.metadata?.siteName || new URL(url).hostname;
    const id = `fc_${crypto.createHash('md5').update(url).digest('hex').slice(0, 12)}`;

    return {
      id,
      url,
      title,
      publisher,
      publishedAt: result.metadata?.publishedTime,
      retrievedAt: new Date().toISOString(),
      content: markdown.slice(0, 8000),
      markdown,
      metadata: result.metadata || {},
    };
  }

  async crawl(url: string, options?: CrawlOptions): Promise<ScrapedEvidence[]> {
    if (!this.isConfigured) return [];
    try {
      const single = await this.scrape(url);
      return [single];
    } catch (e: any) {
      console.warn(`[Firecrawl] Crawl notice for ${url}:`, e.message);
      return [];
    }
  }

  async search(query: string, limit: number = 3): Promise<ScrapedEvidence[]> {
    if (!this.isConfigured) return [];

    try {
      const res = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit }),
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      const items = data.data || [];
      return items.map((item: any) => ({
        id: `fc_${crypto.createHash('md5').update(item.url || query).digest('hex').slice(0, 12)}`,
        url: item.url || '',
        title: item.title || query,
        publisher: item.metadata?.siteName || 'Web',
        publishedAt: item.metadata?.publishedTime,
        retrievedAt: new Date().toISOString(),
        content: (item.markdown || item.description || '').slice(0, 6000),
        markdown: item.markdown || item.description || '',
        metadata: item.metadata || {},
      }));
    } catch (e: any) {
      console.warn('[Firecrawl] Search notice:', e.message);
      return [];
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'Firecrawl',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'FIRECRAWL_API_KEY is not configured',
      };
    }

    try {
      // Lightweight authenticated health check
      const res = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'ping', limit: 1 }),
      });

      return {
        provider: 'Firecrawl',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        provider: 'Firecrawl',
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
