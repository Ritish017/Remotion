import { NextResponse } from 'next/server';
import { ProviderRegistry } from '@/lib/providers';
import { TaskRouter } from '@/lib/router/TaskRouter';
import { getCatalystConfig } from '@/lib/config/providerConfig';
import { runStartupCheck } from '@/lib/startup/startupCheck';

export async function GET() {
  const providerChecks = await ProviderRegistry.runAllHealthChecks();
  const routing = TaskRouter.getRoutingManifest();
  const catalystConfig = getCatalystConfig();
  const startupCheck = await runStartupCheck();

  return NextResponse.json({
    platform: 'Catalyst Content OS (Remotion AI Video Platform)',
    mode: catalystConfig.isLocalFirst ? 'LOCAL_PRODUCTION_MODE' : 'CLOUD_MODE',
    version: '3.0.0-local-production',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    startup: startupCheck,
    subsystems: {
      database: {
        provider: catalystConfig.databaseMode === 'sqlite' ? 'Local SQLite (catalyst.db)' : 'Supabase PostgreSQL',
        configured: startupCheck.services.sqlite,
        status: startupCheck.details.sqliteStatus,
      },
      storage: {
        provider: catalystConfig.storageMode === 'local' ? 'Local Storage Provider' : 'AWS S3',
        path: catalystConfig.storagePath,
        status: startupCheck.details.storageStatus,
      },
      rendering: {
        engine: catalystConfig.renderMode === 'local' ? 'Remotion Local Renderer (@remotion/renderer)' : 'Remotion Lambda',
        status: startupCheck.details.remotionStatus,
      },
      aiCreativeDirector: {
        primary: `Anthropic Claude (${process.env.ANTHROPIC_MODEL_PRIMARY || 'claude-sonnet-4-5-20250929'})`,
        status: startupCheck.details.claudeStatus,
      },
      audioNarration: {
        primary: 'OpenAI TTS (tts-1 / Onyx) + Real Whisper Alignment',
        status: startupCheck.details.openaiStatus,
      },
      webResearch: {
        engine: 'Firecrawl + Apify Datasets (Local SQLite Persistence)',
        status: ProviderRegistry.research.firecrawl.isConfigured ? 'Active' : 'Optional',
      },
      transactionalEmail: {
        provider: 'Resend',
        status: ProviderRegistry.email.resend.isConfigured ? 'Active' : 'Optional',
      },
    },
    taskRouting: routing,
    providers: providerChecks,
  });
}
