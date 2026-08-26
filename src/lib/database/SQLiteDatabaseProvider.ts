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
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
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
  }

  // --- Render Jobs ---

  async createRenderJob(job: Omit<RenderJobRecord, 'createdAt' | 'progress'> & { progress?: number }): Promise<RenderJobRecord> {
    const db = this.getDB();
    const createdAt = new Date().toISOString();
    const progress = job.progress ?? 0;

    const stmt = db.prepare(`
      INSERT INTO render_jobs (
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
      INSERT INTO episodes (id, project_id, episode_number, title, topic, status, scheduled_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(episode.id, episode.projectId, episode.episodeNumber, episode.title, episode.topic, episode.status, episode.scheduledDate ?? null, now, now);

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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listEpisodes(projectId?: string): Promise<EpisodeRecord[]> {
    const db = this.getDB();
    let rows: any[];
    if (projectId) {
      rows = db.prepare(`SELECT * FROM episodes WHERE project_id = ? ORDER BY episode_number ASC`).all(projectId) as any[];
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
      createdAt: r.created_at,
      updatedAt: r.updated_at,
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
