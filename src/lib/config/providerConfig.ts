/**
 * Provider & Platform Configuration for Catalyst Local-First Architecture.
 */

export interface CatalystConfig {
  storageMode: 'local' | 's3';
  databaseMode: 'sqlite' | 'supabase';
  renderMode: 'local' | 'lambda';
  storagePath: string;
  isLocalFirst: boolean;
}

export function getCatalystConfig(): CatalystConfig {
  const storageMode = (process.env.CATALYST_STORAGE_MODE as 'local' | 's3') || 'local';
  const databaseMode = (process.env.CATALYST_DATABASE_MODE as 'sqlite' | 'supabase') || 'sqlite';
  const renderMode = (process.env.CATALYST_RENDER_MODE as 'local' | 'lambda') || 'local';
  const storagePath = process.env.CATALYST_STORAGE_PATH || './storage';

  return {
    storageMode,
    databaseMode,
    renderMode,
    storagePath,
    isLocalFirst: storageMode === 'local' && databaseMode === 'sqlite' && renderMode === 'local',
  };
}

export const PROVIDER_REQUIREMENTS = {
  CLAUDE: 'REQUIRED',
  OPENAI: 'REQUIRED FOR NARRATION',
  STORAGE: 'LOCAL_DEFAULT',
  SQLITE: 'LOCAL_DEFAULT',
  REMOTION: 'LOCAL_DEFAULT',
  AWS: 'DISABLED',
  SUPABASE: 'DISABLED',
  FIRECRAWL: 'OPTIONAL',
  APIFY: 'OPTIONAL',
  GEMINI: 'OPTIONAL',
  HEYGEN: 'OPTIONAL',
  VAPI: 'OPTIONAL',
  N8N: 'OPTIONAL',
  RESEND: 'OPTIONAL',
} as const;
