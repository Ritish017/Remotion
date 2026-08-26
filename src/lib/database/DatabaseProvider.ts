/**
 * DatabaseProvider interface for Catalyst Content OS.
 * Decouples entity persistence from specific database drivers (SQLite now, Supabase/Postgres in future).
 */

export interface RenderJobRecord {
  id: string;
  projectId?: string;
  episodeId?: string;
  compositionId?: string;
  status: 'QUEUED' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  progress: number;
  outputPath?: string;
  duration?: number;
  errorCode?: string;
  errorMessage?: string;
  spec?: any;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface NarrationArtifactRecord {
  id: string;
  projectId?: string;
  episodeId?: string;
  audioPath: string;
  transcript: string;
  durationSeconds: number;
  wordsJson: string;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  type: string;
  targetAudience?: string;
  brandVoice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelRecord {
  id: string;
  name: string;
  platform: string;
  handle?: string;
  targetAudience?: string;
  brandVoice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeRecord {
  id: string;
  projectId: string;
  episodeNumber: number;
  title: string;
  topic: string;
  status: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoSpecRecord {
  id: string;
  projectId?: string;
  episodeId?: string;
  specJson: string;
  versionTag?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSourceRecord {
  id: string;
  projectId?: string;
  topic: string;
  url?: string;
  title: string;
  sourceType: string;
  content: string;
  extractedAt: string;
}

export interface ResearchFactRecord {
  id: string;
  projectId?: string;
  sourceId?: string;
  fact: string;
  category?: string;
  confidence: number;
  extractedAt: string;
}

export interface ProviderUsageRecord {
  id: string;
  provider: string;
  model: string;
  task: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  costEstimate?: number;
  timestamp: string;
}

export interface DatabaseProvider {
  initialize(): Promise<void>;

  // Render Jobs
  createRenderJob(job: Omit<RenderJobRecord, 'createdAt' | 'progress'> & { progress?: number }): Promise<RenderJobRecord>;
  updateRenderJob(id: string, updates: Partial<RenderJobRecord>): Promise<RenderJobRecord | null>;
  getRenderJob(id: string): Promise<RenderJobRecord | null>;
  listRenderJobs(limit?: number): Promise<RenderJobRecord[]>;

  // Narration Artifacts
  saveNarrationArtifact(artifact: Omit<NarrationArtifactRecord, 'createdAt'>): Promise<NarrationArtifactRecord>;
  getNarrationArtifact(id: string): Promise<NarrationArtifactRecord | null>;

  // Projects & Channels & Episodes
  createProject(project: Omit<ProjectRecord, 'createdAt' | 'updatedAt'>): Promise<ProjectRecord>;
  getProject(id: string): Promise<ProjectRecord | null>;
  listProjects(): Promise<ProjectRecord[]>;

  createChannel(channel: Omit<ChannelRecord, 'createdAt' | 'updatedAt'>): Promise<ChannelRecord>;
  getChannel(id: string): Promise<ChannelRecord | null>;
  listChannels(): Promise<ChannelRecord[]>;

  createEpisode(episode: Omit<EpisodeRecord, 'createdAt' | 'updatedAt'>): Promise<EpisodeRecord>;
  getEpisode(id: string): Promise<EpisodeRecord | null>;
  listEpisodes(projectId?: string): Promise<EpisodeRecord[]>;

  // Video Specs
  saveVideoSpec(spec: Omit<VideoSpecRecord, 'createdAt' | 'updatedAt'>): Promise<VideoSpecRecord>;
  getVideoSpec(id: string): Promise<VideoSpecRecord | null>;
  listVideoSpecs(projectId?: string): Promise<VideoSpecRecord[]>;

  // Research Sources & Facts
  saveResearchSource(source: Omit<ResearchSourceRecord, 'extractedAt'>): Promise<ResearchSourceRecord>;
  listResearchSources(topicOrProjectId?: string): Promise<ResearchSourceRecord[]>;

  saveResearchFact(fact: Omit<ResearchFactRecord, 'extractedAt'>): Promise<ResearchFactRecord>;
  listResearchFacts(projectId?: string): Promise<ResearchFactRecord[]>;

  // Provider Usage Tracking
  recordProviderUsage(usage: Omit<ProviderUsageRecord, 'id' | 'timestamp'>): Promise<ProviderUsageRecord>;
  getProviderUsageStats(): Promise<ProviderUsageRecord[]>;
}
