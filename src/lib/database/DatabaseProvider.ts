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
  researchJson?: string;
  scriptJson?: string;
  storyboardJson?: string;
  videoSpecId?: string;
  qaReportJson?: string;
  renderJobId?: string;
  approvedAt?: string;
  renderedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedEpisodeState {
  episode: EpisodeRecord;
  videoSpec?: any;
  dna?: any;
  renderJob?: any;
  sources?: ResearchSourceRecord[];
  facts?: ResearchFactRecord[];
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

export interface CampaignRecord {
  id: string;
  name: string;
  description?: string;
  niche?: string;
  targetAudience?: string;
  platformsJson: string;
  publishingFrequency?: string;
  contentPillarsJson: string;
  tone?: string;
  editorialIdentityJson?: string;
  visualIdentityJson?: string;
  preferredDurationSeconds?: number;
  aspectRatiosJson?: string;
  narrationStyleJson?: string;
  ctaStrategyJson?: string;
  monthlyStrategyJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeDNARecord {
  id: string;
  episodeId: string;
  campaignId?: string;
  dnaJson: string;
  visualNoveltyScore?: number;
  noveltyBreakdownJson?: string;
  createdAt: string;
}

export interface CampaignMemoryRecord {
  id: string;
  campaignId: string;
  memoryType: string;
  content: string;
  metadataJson?: string;
  createdAt: string;
}

export interface VisualStyleMemoryRecord {
  id: string;
  campaignId?: string;
  episodeId: string;
  visualLanguage: string;
  compositionLanguage?: string;
  motionLanguage?: string;
  cameraLanguage?: string;
  paletteId?: string;
  metaphorsJson?: string;
  dnaJson: string;
  createdAt: string;
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
  updateEpisode(id: string, updates: Partial<EpisodeRecord>): Promise<EpisodeRecord | null>;
  listEpisodes(projectIdOrCampaignId?: string): Promise<EpisodeRecord[]>;
  getUnifiedEpisodeState(episodeId: string): Promise<UnifiedEpisodeState | null>;

  // Campaigns & Editorial Calendars
  createCampaign(campaign: Omit<CampaignRecord, 'createdAt' | 'updatedAt'>): Promise<CampaignRecord>;
  getCampaign(id: string): Promise<CampaignRecord | null>;
  listCampaigns(): Promise<CampaignRecord[]>;
  updateCampaign(id: string, updates: Partial<CampaignRecord>): Promise<CampaignRecord | null>;

  // Episode DNA & Anti-Generic Memory
  saveEpisodeDNA(record: Omit<EpisodeDNARecord, 'createdAt'>): Promise<EpisodeDNARecord>;
  getEpisodeDNA(episodeId: string): Promise<EpisodeDNARecord | null>;

  saveCampaignMemory(memory: Omit<CampaignMemoryRecord, 'createdAt'>): Promise<CampaignMemoryRecord>;
  listCampaignMemory(campaignId: string, memoryType?: string): Promise<CampaignMemoryRecord[]>;

  saveVisualStyleMemory(record: Omit<VisualStyleMemoryRecord, 'createdAt'>): Promise<VisualStyleMemoryRecord>;
  listVisualStyleMemory(campaignId?: string, limit?: number): Promise<VisualStyleMemoryRecord[]>;

  // Video Specs
  saveVideoSpec(spec: Omit<VideoSpecRecord, 'createdAt' | 'updatedAt'>): Promise<VideoSpecRecord>;
  getVideoSpec(id: string): Promise<VideoSpecRecord | null>;
  getVideoSpecByEpisode(episodeId: string): Promise<VideoSpecRecord | null>;
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

