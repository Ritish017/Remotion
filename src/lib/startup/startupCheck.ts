import { validateClaudeConfig } from '../providers/ai/claude/config';
import { StorageFactory } from '../storage';
import { DatabaseFactory } from '../database';

export interface StartupCheckResult {
  ready: boolean;
  services: {
    claude: boolean;
    openai: boolean;
    storage: boolean;
    sqlite: boolean;
    remotion: boolean;
  };
  details: {
    claudeStatus: string;
    openaiStatus: string;
    storageStatus: string;
    sqliteStatus: string;
    remotionStatus: string;
  };
  warnings: string[];
}

export async function runStartupCheck(): Promise<StartupCheckResult> {
  const warnings: string[] = [];

  // 1. Claude Check
  const claudeValidation = validateClaudeConfig();
  const claudeReady = claudeValidation.valid;
  const claudeStatus = claudeReady ? 'READY' : 'NOT CONFIGURED';
  if (!claudeReady) {
    warnings.push(`Claude: ${claudeValidation.errors.join('; ')}`);
  }

  // 2. OpenAI Check
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiReady = Boolean(openaiKey && openaiKey.trim().length > 0);
  const openaiStatus = openaiReady ? 'READY' : 'OPTIONAL (NOT CONFIGURED)';

  // 3. Storage Check
  let storageReady = false;
  let storageStatus = 'INITIALIZING';
  try {
    const storage = StorageFactory.getProvider();
    await storage.exists('');
    storageReady = true;
    storageStatus = 'READY';
  } catch (e: any) {
    storageStatus = `ERROR: ${e.message}`;
    warnings.push(`Storage: ${e.message}`);
  }

  // 4. SQLite Database Check
  let sqliteReady = false;
  let sqliteStatus = 'INITIALIZING';
  try {
    const db = DatabaseFactory.getProvider();
    await db.initialize();
    sqliteReady = true;
    sqliteStatus = 'READY';
  } catch (e: any) {
    sqliteStatus = `ERROR: ${e.message}`;
    warnings.push(`SQLite: ${e.message}`);
  }

  // 5. Remotion Check
  let remotionReady = false;
  let remotionStatus = 'CHECKING';
  try {
    require('@remotion/renderer');
    require('@remotion/bundler');
    remotionReady = true;
    remotionStatus = 'READY';
  } catch (e: any) {
    remotionStatus = `ERROR: ${e.message}`;
    warnings.push(`Remotion: ${e.message}`);
  }

  const allReady = storageReady && sqliteReady && remotionReady;

  return {
    ready: allReady,
    services: {
      claude: claudeReady,
      openai: openaiReady,
      storage: storageReady,
      sqlite: sqliteReady,
      remotion: remotionReady,
    },
    details: {
      claudeStatus,
      openaiStatus,
      storageStatus,
      sqliteStatus,
      remotionStatus,
    },
    warnings,
  };
}

export async function printStartupBanner(): Promise<void> {
  const result = await runStartupCheck();

  console.log('========================================================================');
  console.log('🚀 CATALYST CONTENT OS — LOCAL PRODUCTION MODE');
  console.log('========================================================================');
  console.log(`Claude:   ${result.details.claudeStatus}`);
  console.log(`OpenAI:   ${result.details.openaiStatus}`);
  console.log(`Storage:  ${result.details.storageStatus}`);
  console.log(`SQLite:   ${result.details.sqliteStatus}`);
  console.log(`Remotion: ${result.details.remotionStatus}`);
  console.log('========================================================================\n');
}
