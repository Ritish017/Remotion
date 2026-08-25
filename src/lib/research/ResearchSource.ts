import crypto from 'crypto';

export interface IResearchSource {
  id: string;
  url: string;
  title: string;
  publisher: string;
  publishedAt?: string;
  retrievedAt: string;
  content: string;
  sourceType: 'web_article' | 'dataset' | 'academic' | 'press_release';
  hash: string;
}

export class ResearchSource implements IResearchSource {
  public readonly id: string;
  public readonly url: string;
  public readonly title: string;
  public readonly publisher: string;
  public readonly publishedAt?: string;
  public readonly retrievedAt: string;
  public readonly content: string;
  public readonly sourceType: 'web_article' | 'dataset' | 'academic' | 'press_release';
  public readonly hash: string;

  constructor(data: Omit<IResearchSource, 'id' | 'hash'> & { id?: string }) {
    this.url = data.url;
    this.title = data.title;
    this.publisher = data.publisher;
    this.publishedAt = data.publishedAt;
    this.retrievedAt = data.retrievedAt || new Date().toISOString();
    this.content = data.content;
    this.sourceType = data.sourceType || 'web_article';
    this.hash = crypto.createHash('sha256').update(data.content + data.url).digest('hex');
    this.id = data.id || `src_${this.hash.slice(0, 10)}`;
  }
}
