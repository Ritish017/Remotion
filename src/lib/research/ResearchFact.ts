export interface IResearchFact {
  id: string;
  claim: string;
  category: 'metric' | 'event' | 'breakthrough' | 'quote' | 'limitation';
  sourceIds: string[];
  confidence: number; // 0.0 to 1.0
  verified: boolean;
}

export class ResearchFact implements IResearchFact {
  public readonly id: string;
  public readonly claim: string;
  public readonly category: 'metric' | 'event' | 'breakthrough' | 'quote' | 'limitation';
  public readonly sourceIds: string[];
  public readonly confidence: number;
  public readonly verified: boolean;

  constructor(data: IResearchFact) {
    this.id = data.id;
    this.claim = data.claim;
    this.category = data.category;
    this.sourceIds = data.sourceIds;
    this.confidence = data.confidence;
    this.verified = data.verified;
  }
}
