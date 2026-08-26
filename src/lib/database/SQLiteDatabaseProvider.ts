import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import type {
  DatabaseProvider,
  RenderJobRecord,
  NarrationArtifactRecord,
  ProjectRecord,
  ChannelRecord,
  EpisodeRecord,
  VideoSpecRecord,
  ResearchSourceRecord,
  ResearchFactRecord,
  ProviderUsageRecord,
  CampaignRecord,
  EpisodeDNARecord,
  CampaignMemoryRecord,
  VisualStyleMemoryRecord,
} from './DatabaseProvider';
import { getBaseStoragePath } from '../storage/storagePaths';

export class SQLiteDatabaseProvider implements DatabaseProvider {
  private db: DatabaseSync | null = null;
  private readonly dbPath: string;

  constructor(customPath?: string) {
    if (customPath) {
      this.dbPath = path.resolve(customPath);
    } else {
      const storageDir = getBaseStoragePath();
      this.dbPath = path.join(storageDir, 'catalyst.db');
    }
  }

  private getDB(): DatabaseSync {
    if (!this.db) {
      const parentDir = path.dirname(this.dbPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      this.db = new DatabaseSync(this.dbPath);
      this.initSchema();
    }
    return this.db;
  }

  async initialize(): Promise<void> {
    this.getDB();
  }

  private initSchema(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS render_jobs (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        episode_id TEXT,
        composition_id TEXT,
        status TEXT NOT NULL,
        progress REAL DEFAULT 0,
        output_path TEXT,
        duration REAL,
        error_code TEXT,
        error_message TEXT,
        spec_json TEXT,
        started_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS narration_artifacts (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        episode_id TEXT,
        audio_path TEXT NOT NULL,
        transcript TEXT NOT NULL,
        duration_seconds REAL NOT NULL,
        words_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        target_audience TEXT,
        brand_voice TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        handle TEXT,
        target_audience TEXT,
        brand_voice TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS episodes (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        episode_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        topic TEXT NOT NULL,
        status TEXT NOT NULL,
        scheduled_date TEXT,
        research_json TEXT,
        script_json TEXT,
        storyboard_json TEXT,
        video_spec_id TEXT,
        qa_report_json TEXT,
        render_job_id TEXT,
        approved_at TEXT,
        rendered_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        niche TEXT,
        target_audience TEXT,
        platforms_json TEXT NOT NULL,
        publishing_frequency TEXT,
        content_pillars_json TEXT NOT NULL,
        tone TEXT,
        editorial_identity_json TEXT,
        visual_identity_json TEXT,
        preferred_duration_seconds REAL DEFAULT 45,
        aspect_ratios_json TEXT,
        narration_style_json TEXT,
        cta_strategy_json TEXT,
        monthly_strategy_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS episode_dna (
        id TEXT PRIMARY KEY,
        episode_id TEXT NOT NULL,
        campaign_id TEXT,
        dna_json TEXT NOT NULL,
        visual_novelty_score REAL,
        novelty_breakdown_json TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS campaign_memory (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        memory_type TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS visual_style_memory (
        id TEXT PRIMARY KEY,
        campaign_id TEXT,
        episode_id TEXT NOT NULL,
        visual_language TEXT NOT NULL,
        composition_language TEXT,
        motion_language TEXT,
        camera_language TEXT,
        palette_id TEXT,
        metaphors_json TEXT,
        dna_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS video_specs (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        episode_id TEXT,
        spec_json TEXT NOT NULL,
        version_tag TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS research_sources (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        topic TEXT NOT NULL,
        url TEXT,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL,
        content TEXT NOT NULL,
        extracted_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS research_facts (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        source_id TEXT,
        fact TEXT NOT NULL,
        category TEXT,
        confidence REAL NOT NULL,
        extracted_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS provider_usage (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        task TEXT NOT NULL,
        input_tokens INTEGER,
        output_tokens INTEGER,
        latency_ms INTEGER,
        cost_estimate REAL,
        timestamp TEXT NOT NULL
      );
    `);

    // Safe column migrations for existing databases
    const migrations = [
      'ALTER TABLE episodes ADD COLUMN research_json TEXT',
      'ALTER TABLE episodes ADD COLUMN script_json TEXT',
      'ALTER TABLE episodes ADD COLUMN storyboard_json TEXT',
      'ALTER TABLE episodes ADD COLUMN video_spec_id TEXT',
      'ALTER TABLE episodes ADD COLUMN qa_report_json TEXT',
      'ALTER TABLE episodes ADD COLUMN render_job_id TEXT',
      'ALTER TABLE episodes ADD COLUMN approved_at TEXT',
      'ALTER TABLE episodes ADD COLUMN rendered_at TEXT',
    ];

    for (const sql of migrations) {
      try {
        this.db.exec(sql);
      } catch {
        // Column already exists
      }
    }
  }

  // --- Render Jobs ---

  async createRenderJob(job: Omit<RenderJobRecord, 'createdAt' | 'progress'> & { progress?: number }): Promise<RenderJobRecord> {
    const db = this.getDB();
    const createdAt = new Date().toISOString();
    const progress = job.progress ?? 0;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO render_jobs (
        id, project_id, episode_id, composition_id, status, progress,
        output_path, duration, error_code, error_message, spec_json,
        started_at, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      job.id,
      job.projectId ?? null,
      job.episodeId ?? null,
      job.compositionId ?? null,
      job.status,
      progress,
      job.outputPath ?? null,
      job.duration ?? null,
      job.errorCode ?? null,
      job.errorMessage ?? null,
      job.spec ? JSON.stringify(job.spec) : null,
      job.startedAt ?? null,
      job.completedAt ?? null,
      createdAt
    );

    return {
      ...job,
      progress,
      createdAt,
    };
  }

  async updateRenderJob(id: string, updates: Partial<RenderJobRecord>): Promise<RenderJobRecord | null> {
    const db = this.getDB();
    const current = await this.getRenderJob(id);
    if (!current) return null;

    const merged = { ...current, ...updates };

    const stmt = db.prepare(`
      UPDATE render_jobs SET
        status = ?, progress = ?, output_path = ?, duration = ?,
        error_code = ?, error_message = ?, started_at = ?, completed_at = ?
      WHERE id = ?
    `);

    stmt.run(
      merged.status,
      merged.progress,
      merged.outputPath ?? null,
      merged.duration ?? null,
      merged.errorCode ?? null,
      merged.errorMessage ?? null,
      merged.startedAt ?? null,
      merged.completedAt ?? null,
      id
    );

    return merged;
  }

  async getRenderJob(id: string): Promise<RenderJobRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM render_jobs WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      projectId: row.project_id,
      episodeId: row.episode_id,
      compositionId: row.composition_id,
      status: row.status,
      progress: row.progress,
      outputPath: row.output_path,
      duration: row.duration,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      spec: row.spec_json ? JSON.parse(row.spec_json) : undefined,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
    };
  }

  async listRenderJobs(limit: number = 20): Promise<RenderJobRecord[]> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM render_jobs ORDER BY created_at DESC LIMIT ?`);
    const rows = stmt.all(limit) as any[];

    return rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      episodeId: row.episode_id,
      compositionId: row.composition_id,
      status: row.status,
      progress: row.progress,
      outputPath: row.output_path,
      duration: row.duration,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      spec: row.spec_json ? JSON.parse(row.spec_json) : undefined,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
    }));
  }

  // --- Narration Artifacts ---

  async saveNarrationArtifact(artifact: Omit<NarrationArtifactRecord, 'createdAt'>): Promise<NarrationArtifactRecord> {
    const db = this.getDB();
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO narration_artifacts (
        id, project_id, episode_id, audio_path, transcript,
        duration_seconds, words_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      artifact.id,
      artifact.projectId ?? null,
      artifact.episodeId ?? null,
      artifact.audioPath,
      artifact.transcript,
      artifact.durationSeconds,
      artifact.wordsJson,
      createdAt
    );

    return {
      ...artifact,
      createdAt,
    };
  }

  async getNarrationArtifact(id: string): Promise<NarrationArtifactRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM narration_artifacts WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      projectId: row.project_id,
      episodeId: row.episode_id,
      audioPath: row.audio_path,
      transcript: row.transcript,
      durationSeconds: row.duration_seconds,
      wordsJson: row.words_json,
      createdAt: row.created_at,
    };
  }

  // --- Projects & Channels & Episodes ---

  async createProject(project: Omit<ProjectRecord, 'createdAt' | 'updatedAt'>): Promise<ProjectRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO projects (id, name, type, target_audience, brand_voice, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(project.id, project.name, project.type, project.targetAudience ?? null, project.brandVoice ?? null, now, now);

    return { ...project, createdAt: now, updatedAt: now };
  }

  async getProject(id: string): Promise<ProjectRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM projects WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      targetAudience: row.target_audience,
      brandVoice: row.brand_voice,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listProjects(): Promise<ProjectRecord[]> {
    const db = this.getDB();
    const rows = db.prepare(`SELECT * FROM projects ORDER BY created_at DESC`).all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      targetAudience: r.target_audience,
      brandVoice: r.brand_voice,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async createChannel(channel: Omit<ChannelRecord, 'createdAt' | 'updatedAt'>): Promise<ChannelRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO channels (id, name, platform, handle, target_audience, brand_voice, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(channel.id, channel.name, channel.platform, channel.handle ?? null, channel.targetAudience ?? null, channel.brandVoice ?? null, now, now);

    return { ...channel, createdAt: now, updatedAt: now };
  }

  async getChannel(id: string): Promise<ChannelRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM channels WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      platform: row.platform,
      handle: row.handle,
      targetAudience: row.target_audience,
      brandVoice: row.brand_voice,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listChannels(): Promise<ChannelRecord[]> {
    const db = this.getDB();
    const rows = db.prepare(`SELECT * FROM channels ORDER BY created_at DESC`).all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      platform: r.platform,
      handle: r.handle,
      targetAudience: r.target_audience,
      brandVoice: r.brand_voice,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async createEpisode(episode: Omit<EpisodeRecord, 'createdAt' | 'updatedAt'>): Promise<EpisodeRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO episodes (
        id, project_id, episode_number, title, topic, status, scheduled_date,
        research_json, script_json, storyboard_json, video_spec_id,
        qa_report_json, render_job_id, approved_at, rendered_at,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      episode.id,
      episode.projectId,
      episode.episodeNumber,
      episode.title,
      episode.topic,
      episode.status,
      episode.scheduledDate ?? null,
      episode.researchJson ?? null,
      episode.scriptJson ?? null,
      episode.storyboardJson ?? null,
      episode.videoSpecId ?? null,
      episode.qaReportJson ?? null,
      episode.renderJobId ?? null,
      episode.approvedAt ?? null,
      episode.renderedAt ?? null,
      now,
      now
    );

    return { ...episode, createdAt: now, updatedAt: now };
  }

  async getEpisode(id: string): Promise<EpisodeRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM episodes WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      projectId: row.project_id,
      episodeNumber: row.episode_number,
      title: row.title,
      topic: row.topic,
      status: row.status,
      scheduledDate: row.scheduled_date,
      researchJson: row.research_json,
      scriptJson: row.script_json,
      storyboardJson: row.storyboard_json,
      videoSpecId: row.video_spec_id,
      qaReportJson: row.qa_report_json,
      renderJobId: row.render_job_id,
      approvedAt: row.approved_at,
      renderedAt: row.rendered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async updateEpisode(id: string, updates: Partial<EpisodeRecord>): Promise<EpisodeRecord | null> {
    const db = this.getDB();
    const existing = await this.getEpisode(id);
    if (!existing) return null;

    const updated: EpisodeRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      UPDATE episodes
      SET project_id = ?, episode_number = ?, title = ?, topic = ?, status = ?, scheduled_date = ?,
          research_json = ?, script_json = ?, storyboard_json = ?, video_spec_id = ?,
          qa_report_json = ?, render_job_id = ?, approved_at = ?, rendered_at = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.projectId,
      updated.episodeNumber,
      updated.title,
      updated.topic,
      updated.status,
      updated.scheduledDate ?? null,
      updated.researchJson ?? null,
      updated.scriptJson ?? null,
      updated.storyboardJson ?? null,
      updated.videoSpecId ?? null,
      updated.qaReportJson ?? null,
      updated.renderJobId ?? null,
      updated.approvedAt ?? null,
      updated.renderedAt ?? null,
      updated.updatedAt,
      id
    );

    return updated;
  }

  async listEpisodes(projectIdOrCampaignId?: string): Promise<EpisodeRecord[]> {
    const db = this.getDB();
    let rows: any[];
    if (projectIdOrCampaignId) {
      rows = db.prepare(`SELECT * FROM episodes WHERE project_id = ? ORDER BY episode_number ASC`).all(projectIdOrCampaignId) as any[];
    } else {
      rows = db.prepare(`SELECT * FROM episodes ORDER BY created_at DESC`).all() as any[];
    }
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      episodeNumber: r.episode_number,
      title: r.title,
      topic: r.topic,
      status: r.status,
      scheduledDate: r.scheduled_date,
      researchJson: r.research_json,
      scriptJson: r.script_json,
      storyboardJson: r.storyboard_json,
      videoSpecId: r.video_spec_id,
      qaReportJson: r.qa_report_json,
      renderJobId: r.render_job_id,
      approvedAt: r.approved_at,
      renderedAt: r.rendered_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async getUnifiedEpisodeState(episodeId: string): Promise<UnifiedEpisodeState | null> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return null;

    let videoSpec: any = null;
    let specRecord = await this.getVideoSpecByEpisode(episodeId);
    if (!specRecord && episode.videoSpecId) {
      specRecord = await this.getVideoSpec(episode.videoSpecId);
    }
    if (specRecord?.specJson) {
      try {
        videoSpec = JSON.parse(specRecord.specJson);
      } catch {}
    }

    let dna: any = null;
    const dnaRecord = await this.getEpisodeDNA(episodeId);
    if (dnaRecord?.dnaJson) {
      try {
        dna = JSON.parse(dnaRecord.dnaJson);
      } catch {}
    }

    let renderJob: any = null;
    if (episode.renderJobId) {
      renderJob = await this.getRenderJob(episode.renderJobId);
    }

    const sources = await this.listResearchSources(episode.projectId);
    const facts = await this.listResearchFacts(episode.projectId);

    return {
      episode,
      videoSpec,
      dna,
      renderJob,
      sources,
      facts,
    };
  }

  // --- Campaigns ---

  async createCampaign(campaign: Omit<CampaignRecord, 'createdAt' | 'updatedAt'>): Promise<CampaignRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO campaigns (
        id, name, description, niche, target_audience, platforms_json,
        publishing_frequency, content_pillars_json, tone, editorial_identity_json,
        visual_identity_json, preferred_duration_seconds, aspect_ratios_json,
        narration_style_json, cta_strategy_json, monthly_strategy_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      campaign.id,
      campaign.name,
      campaign.description ?? null,
      campaign.niche ?? null,
      campaign.targetAudience ?? null,
      campaign.platformsJson,
      campaign.publishingFrequency ?? 'daily',
      campaign.contentPillarsJson,
      campaign.tone ?? null,
      campaign.editorialIdentityJson ?? null,
      campaign.visualIdentityJson ?? null,
      campaign.preferredDurationSeconds ?? 45,
      campaign.aspectRatiosJson ?? JSON.stringify(['9:16']),
      campaign.narrationStyleJson ?? null,
      campaign.ctaStrategyJson ?? null,
      campaign.monthlyStrategyJson ?? null,
      now,
      now
    );

    return { ...campaign, createdAt: now, updatedAt: now };
  }

  async getCampaign(id: string): Promise<CampaignRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM campaigns WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      niche: row.niche,
      targetAudience: row.target_audience,
      platformsJson: row.platforms_json,
      publishingFrequency: row.publishing_frequency,
      contentPillarsJson: row.content_pillars_json,
      tone: row.tone,
      editorialIdentityJson: row.editorial_identity_json,
      visualIdentityJson: row.visual_identity_json,
      preferredDurationSeconds: row.preferred_duration_seconds,
      aspectRatiosJson: row.aspect_ratios_json,
      narrationStyleJson: row.narration_style_json,
      ctaStrategyJson: row.cta_strategy_json,
      monthlyStrategyJson: row.monthly_strategy_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listCampaigns(): Promise<CampaignRecord[]> {
    const db = this.getDB();
    const rows = db.prepare(`SELECT * FROM campaigns ORDER BY created_at DESC`).all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      niche: row.niche,
      targetAudience: row.target_audience,
      platformsJson: row.platforms_json,
      publishingFrequency: row.publishing_frequency,
      contentPillarsJson: row.content_pillars_json,
      tone: row.tone,
      editorialIdentityJson: row.editorial_identity_json,
      visualIdentityJson: row.visual_identity_json,
      preferredDurationSeconds: row.preferred_duration_seconds,
      aspectRatiosJson: row.aspect_ratios_json,
      narrationStyleJson: row.narration_style_json,
      ctaStrategyJson: row.cta_strategy_json,
      monthlyStrategyJson: row.monthly_strategy_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async updateCampaign(id: string, updates: Partial<CampaignRecord>): Promise<CampaignRecord | null> {
    const db = this.getDB();
    const existing = await this.getCampaign(id);
    if (!existing) return null;

    const updated: CampaignRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      UPDATE campaigns
      SET name = ?, description = ?, niche = ?, target_audience = ?, platforms_json = ?,
          publishing_frequency = ?, content_pillars_json = ?, tone = ?, editorial_identity_json = ?,
          visual_identity_json = ?, preferred_duration_seconds = ?, aspect_ratios_json = ?,
          narration_style_json = ?, cta_strategy_json = ?, monthly_strategy_json = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.description ?? null,
      updated.niche ?? null,
      updated.targetAudience ?? null,
      updated.platformsJson,
      updated.publishingFrequency ?? 'daily',
      updated.contentPillarsJson,
      updated.tone ?? null,
      updated.editorialIdentityJson ?? null,
      updated.visualIdentityJson ?? null,
      updated.preferredDurationSeconds ?? 45,
      updated.aspectRatiosJson ?? JSON.stringify(['9:16']),
      updated.narrationStyleJson ?? null,
      updated.ctaStrategyJson ?? null,
      updated.monthlyStrategyJson ?? null,
      updated.updatedAt,
      id
    );

    return updated;
  }

  // --- Episode DNA ---

  async saveEpisodeDNA(record: Omit<EpisodeDNARecord, 'createdAt'>): Promise<EpisodeDNARecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO episode_dna (id, episode_id, campaign_id, dna_json, visual_novelty_score, novelty_breakdown_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.episodeId,
      record.campaignId ?? null,
      record.dnaJson,
      record.visualNoveltyScore ?? null,
      record.noveltyBreakdownJson ?? null,
      now
    );

    return { ...record, createdAt: now };
  }

  async getEpisodeDNA(episodeId: string): Promise<EpisodeDNARecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM episode_dna WHERE episode_id = ?`);
    const row = stmt.get(episodeId) as any;
    if (!row) return null;
    return {
      id: row.id,
      episodeId: row.episode_id,
      campaignId: row.campaign_id,
      dnaJson: row.dna_json,
      visualNoveltyScore: row.visual_novelty_score,
      noveltyBreakdownJson: row.novelty_breakdown_json,
      createdAt: row.created_at,
    };
  }

  // --- Campaign Memory ---

  async saveCampaignMemory(memory: Omit<CampaignMemoryRecord, 'createdAt'>): Promise<CampaignMemoryRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO campaign_memory (id, campaign_id, memory_type, content, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(memory.id, memory.campaignId, memory.memoryType, memory.content, memory.metadataJson ?? null, now);

    return { ...memory, createdAt: now };
  }

  async listCampaignMemory(campaignId: string, memoryType?: string): Promise<CampaignMemoryRecord[]> {
    const db = this.getDB();
    let rows: any[];
    if (memoryType) {
      rows = db.prepare(`SELECT * FROM campaign_memory WHERE campaign_id = ? AND memory_type = ? ORDER BY created_at DESC`).all(campaignId, memoryType) as any[];
    } else {
      rows = db.prepare(`SELECT * FROM campaign_memory WHERE campaign_id = ? ORDER BY created_at DESC`).all(campaignId) as any[];
    }
    return rows.map((r) => ({
      id: r.id,
      campaignId: r.campaign_id,
      memoryType: r.memory_type,
      content: r.content,
      metadataJson: r.metadata_json,
      createdAt: r.created_at,
    }));
  }

  // --- Visual Style Memory ---

  async saveVisualStyleMemory(record: Omit<VisualStyleMemoryRecord, 'createdAt'>): Promise<VisualStyleMemoryRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO visual_style_memory (
        id, campaign_id, episode_id, visual_language, composition_language,
        motion_language, camera_language, palette_id, metaphors_json, dna_json, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.campaignId ?? null,
      record.episodeId,
      record.visualLanguage,
      record.compositionLanguage ?? null,
      record.motionLanguage ?? null,
      record.cameraLanguage ?? null,
      record.paletteId ?? null,
      record.metaphorsJson ?? null,
      record.dnaJson,
      now
    );

    return { ...record, createdAt: now };
  }

  async listVisualStyleMemory(campaignId?: string, limit: number = 30): Promise<VisualStyleMemoryRecord[]> {
    const db = this.getDB();
    let rows: any[];
    if (campaignId) {
      rows = db.prepare(`SELECT * FROM visual_style_memory WHERE campaign_id = ? ORDER BY created_at DESC LIMIT ?`).all(campaignId, limit) as any[];
    } else {
      rows = db.prepare(`SELECT * FROM visual_style_memory ORDER BY created_at DESC LIMIT ?`).all(limit) as any[];
    }
    return rows.map((r) => ({
      id: r.id,
      campaignId: r.campaign_id,
      episodeId: r.episode_id,
      visualLanguage: r.visual_language,
      compositionLanguage: r.composition_language,
      motionLanguage: r.motion_language,
      cameraLanguage: r.camera_language,
      paletteId: r.palette_id,
      metaphorsJson: r.metaphors_json,
      dnaJson: r.dna_json,
      createdAt: r.created_at,
    }));
  }

  // --- Video Specs ---

  async saveVideoSpec(spec: Omit<VideoSpecRecord, 'createdAt' | 'updatedAt'>): Promise<VideoSpecRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO video_specs (id, project_id, episode_id, spec_json, version_tag, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(spec.id, spec.projectId ?? null, spec.episodeId ?? null, spec.specJson, spec.versionTag ?? null, now, now);

    return { ...spec, createdAt: now, updatedAt: now };
  }

  async getVideoSpec(id: string): Promise<VideoSpecRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM video_specs WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      projectId: row.project_id,
      episodeId: row.episode_id,
      specJson: row.spec_json,
      versionTag: row.version_tag,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getVideoSpecByEpisode(episodeId: string): Promise<VideoSpecRecord | null> {
    const db = this.getDB();
    const stmt = db.prepare(`SELECT * FROM video_specs WHERE episode_id = ? ORDER BY created_at DESC LIMIT 1`);
    const row = stmt.get(episodeId) as any;
    if (!row) return null;
    return {
      id: row.id,
      projectId: row.project_id,
      episodeId: row.episode_id,
      specJson: row.spec_json,
      versionTag: row.version_tag,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listVideoSpecs(projectId?: string): Promise<VideoSpecRecord[]> {
    const db = this.getDB();
    let rows: any[];
    if (projectId) {
      rows = db.prepare(`SELECT * FROM video_specs WHERE project_id = ? ORDER BY created_at DESC`).all(projectId) as any[];
    } else {
      rows = db.prepare(`SELECT * FROM video_specs ORDER BY created_at DESC`).all() as any[];
    }
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      episodeId: r.episode_id,
      specJson: r.spec_json,
      versionTag: r.version_tag,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  // --- Research Sources & Facts ---

  async saveResearchSource(source: Omit<ResearchSourceRecord, 'extractedAt'>): Promise<ResearchSourceRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO research_sources (id, project_id, topic, url, title, source_type, content, extracted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(source.id, source.projectId ?? null, source.topic, source.url ?? null, source.title, source.sourceType, source.content, now);

    return { ...source, extractedAt: now };
  }

  async listResearchSources(topicOrProjectId?: string): Promise<ResearchSourceRecord[]> {
    const db = this.getDB();
    let rows: any[];
    if (topicOrProjectId) {
      rows = db.prepare(`SELECT * FROM research_sources WHERE project_id = ? OR topic = ? ORDER BY extracted_at DESC`).all(topicOrProjectId, topicOrProjectId) as any[];
    } else {
      rows = db.prepare(`SELECT * FROM research_sources ORDER BY extracted_at DESC`).all() as any[];
    }
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      topic: r.topic,
      url: r.url,
      title: r.title,
      sourceType: r.source_type,
      content: r.content,
      extractedAt: r.extracted_at,
    }));
  }

  async saveResearchFact(fact: Omit<ResearchFactRecord, 'extractedAt'>): Promise<ResearchFactRecord> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO research_facts (id, project_id, source_id, fact, category, confidence, extracted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(fact.id, fact.projectId ?? null, fact.sourceId ?? null, fact.fact, fact.category ?? null, fact.confidence, now);

    return { ...fact, extractedAt: now };
  }

  async listResearchFacts(projectId?: string): Promise<ResearchFactRecord[]> {
    const db = this.getDB();
    let rows: any[];
    if (projectId) {
      rows = db.prepare(`SELECT * FROM research_facts WHERE project_id = ? ORDER BY extracted_at DESC`).all(projectId) as any[];
    } else {
      rows = db.prepare(`SELECT * FROM research_facts ORDER BY extracted_at DESC`).all() as any[];
    }
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      sourceId: r.source_id,
      fact: r.fact,
      category: r.category,
      confidence: r.confidence,
      extractedAt: r.extracted_at,
    }));
  }

  // --- Provider Usage Tracking ---

  async recordProviderUsage(usage: Omit<ProviderUsageRecord, 'id' | 'timestamp'>): Promise<ProviderUsageRecord> {
    const db = this.getDB();
    const id = `usage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO provider_usage (id, provider, model, task, input_tokens, output_tokens, latency_ms, cost_estimate, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      usage.provider,
      usage.model,
      usage.task,
      usage.inputTokens ?? null,
      usage.outputTokens ?? null,
      usage.latencyMs ?? null,
      usage.costEstimate ?? null,
      now
    );

    return { ...usage, id, timestamp: now };
  }

  async getProviderUsageStats(): Promise<ProviderUsageRecord[]> {
    const db = this.getDB();
    const rows = db.prepare(`SELECT * FROM provider_usage ORDER BY timestamp DESC LIMIT 50`).all() as any[];
    return rows.map((r) => ({
      id: r.id,
      provider: r.provider,
      model: r.model,
      task: r.task,
      inputTokens: r.input_tokens,
      outputTokens: r.output_tokens,
      latencyMs: r.latency_ms,
      costEstimate: r.cost_estimate,
      timestamp: r.timestamp,
    }));
  }
}
