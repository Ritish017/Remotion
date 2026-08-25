import type { ResearchEvidence } from './ResearchEvidence';

export interface IResearchReport {
  id: string;
  topic: string;
  executiveSummary: string;
  narrativeAngles: string[];
  recommendedHook: string;
  visualDirectionIdeas: string[];
  evidence: ResearchEvidence;
  generatedAt: string;
}

export class ResearchReport implements IResearchReport {
  public readonly id: string;
  public readonly topic: string;
  public readonly executiveSummary: string;
  public readonly narrativeAngles: string[];
  public readonly recommendedHook: string;
  public readonly visualDirectionIdeas: string[];
  public readonly evidence: ResearchEvidence;
  public readonly generatedAt: string;

  constructor(data: IResearchReport) {
    this.id = data.id || `rep_${Date.now()}`;
    this.topic = data.topic;
    this.executiveSummary = data.executiveSummary;
    this.narrativeAngles = data.narrativeAngles;
    this.recommendedHook = data.recommendedHook;
    this.visualDirectionIdeas = data.visualDirectionIdeas;
    this.evidence = data.evidence;
    this.generatedAt = data.generatedAt || new Date().toISOString();
  }
}
