import type { ResearchFact } from './ResearchFact';
import type { ResearchSource } from './ResearchSource';

export interface IResearchEvidence {
  topic: string;
  sources: ResearchSource[];
  facts: ResearchFact[];
  keyMetrics: Array<{ label: string; value: string; context: string }>;
  timelineEvents: Array<{ year: string; event: string }>;
  gatheredAt: string;
}

export class ResearchEvidence implements IResearchEvidence {
  public readonly topic: string;
  public readonly sources: ResearchSource[];
  public readonly facts: ResearchFact[];
  public readonly keyMetrics: Array<{ label: string; value: string; context: string }>;
  public readonly timelineEvents: Array<{ year: string; event: string }>;
  public readonly gatheredAt: string;

  constructor(data: IResearchEvidence) {
    this.topic = data.topic;
    this.sources = data.sources;
    this.facts = data.facts;
    this.keyMetrics = data.keyMetrics;
    this.timelineEvents = data.timelineEvents;
    this.gatheredAt = data.gatheredAt || new Date().toISOString();
  }
}
