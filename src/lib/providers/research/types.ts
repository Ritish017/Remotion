import type { ProviderHealth } from '../ai/types';

export interface ScrapedEvidence {
  id: string;
  url: string;
  title: string;
  publisher?: string;
  publishedAt?: string;
  retrievedAt: string;
  content: string;
  markdown?: string;
  summary?: string;
  metadata?: Record<string, any>;
}

export interface CrawlOptions {
  limit?: number;
  maxDepth?: number;
  includePaths?: string[];
  excludePaths?: string[];
}

export interface StructuredResearchQuery {
  topic: string;
  keywords?: string[];
  maxResults?: number;
  actorId?: string; // Allowlisted Apify Actor
}

export interface StructuredResearchResult {
  source: string;
  items: any[];
  totalResults: number;
  retrievedAt: string;
}

export interface IFirecrawlProvider {
  readonly isConfigured: boolean;
  scrape(url: string): Promise<ScrapedEvidence>;
  crawl(url: string, options?: CrawlOptions): Promise<ScrapedEvidence[]>;
  search(query: string, limit?: number): Promise<ScrapedEvidence[]>;
  healthCheck(): Promise<ProviderHealth>;
}

export interface IApifyProvider {
  readonly isConfigured: boolean;
  runActor(actorId: string, input: Record<string, any>): Promise<any[]>;
  search(query: StructuredResearchQuery): Promise<StructuredResearchResult>;
  healthCheck(): Promise<ProviderHealth>;
}
