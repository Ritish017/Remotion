import { validateVideoSpec } from '../lib/video-spec/validator';
import { SAMPLE_SHOWCASE_SPEC } from '../lib/video-spec/sampleSpec';
import { SAMPLE_SHOWCASE_SPEC_2 } from '../lib/video-spec/sampleSpec2';
import { TEMPLATE_REGISTRY } from '../remotion/registry/TemplateRegistry';
import { runAutomatedQA } from '../lib/qa';
import { validateNarrationTimeline } from '../lib/audio/validation';
import { repairJsonString } from '../lib/providers/ai/claude/ClaudeProvider';
import { StorageFactory } from '../lib/storage';
import { DatabaseFactory } from '../lib/database';
import { runStartupCheck } from '../lib/startup/startupCheck';

export async function runRemotionTestSuite() {
  const results: { test: string; passed: boolean; message?: string }[] = [];

  // Test 1: VideoSpec 1 Validation
  const spec1Val = validateVideoSpec(SAMPLE_SHOWCASE_SPEC);
  results.push({
    test: 'VideoSpec 1 Zod Validation',
    passed: spec1Val.valid,
    message: spec1Val.errors.join(', ') || 'Showcase spec 1 is 100% valid',
  });

  // Test 2: VideoSpec 2 Validation
  const spec2Val = validateVideoSpec(SAMPLE_SHOWCASE_SPEC_2);
  results.push({
    test: 'VideoSpec 2 Zod Validation',
    passed: spec2Val.valid,
    message: spec2Val.errors.join(', ') || 'Showcase spec 2 is 100% valid',
  });

  // Test 3: Template Registry Completeness
  const requiredTemplates = [
    'hook-primary',
    'editorial-quote',
    'chart-bar',
    'map-geo',
    'cutout-explainer',
    'statistic-big',
    'photo-archive',
    'timeline-flow',
    'comparison-grid',
    'ui-code',
    'outro-cta',
  ];
  const missingTemplates = requiredTemplates.filter((id) => !TEMPLATE_REGISTRY[id]);
  results.push({
    test: 'Template Registry Coverage',
    passed: missingTemplates.length === 0,
    message: missingTemplates.length === 0 ? 'All 11 scene templates registered' : `Missing: ${missingTemplates.join(', ')}`,
  });

  // Test 4: Automated QA on Showcase 1
  const qa1 = runAutomatedQA(SAMPLE_SHOWCASE_SPEC);
  results.push({
    test: 'Showcase 1 Automated QA Report',
    passed: qa1.passed && qa1.score >= 90,
    message: `QA Score: ${qa1.score}/100 — ${qa1.summary}`,
  });

  // Test 5: Automated QA on Showcase 2
  const qa2 = runAutomatedQA(SAMPLE_SHOWCASE_SPEC_2);
  results.push({
    test: 'Showcase 2 Automated QA Report',
    passed: qa2.passed && qa2.score >= 90,
    message: `QA Score: ${qa2.score}/100 — ${qa2.summary}`,
  });

  // Test 6: Narration Timeline Validation - Valid Timeline
  const validWords = [
    { word: 'Silicon', start: 0.1, end: 0.5 },
    { word: 'breakthrough', start: 0.55, end: 1.1 },
    { word: 'unveiled', start: 1.15, end: 1.8 },
  ];
  const validTimeRes = validateNarrationTimeline(validWords, 2.0, 'Silicon breakthrough unveiled');
  results.push({
    test: 'Narration Timeline Validator (Valid Scenario)',
    passed: validTimeRes.valid,
    message: validTimeRes.valid ? 'Valid word timestamps passed check' : validTimeRes.errors.join('; '),
  });

  // Test 7: Narration Timeline Validation - Catches Inverted Durations
  const invalidWordsInverted = [
    { word: 'Bad', start: 1.5, end: 1.0 },
  ];
  const invalidTimeRes = validateNarrationTimeline(invalidWordsInverted, 2.0);
  results.push({
    test: 'Narration Timeline Validator (Catches Inverted Times)',
    passed: !invalidTimeRes.valid && invalidTimeRes.errors.some((e) => e.includes('end <= start')),
    message: 'Correctly caught invalid duration: start > end',
  });

  // Test 8: Narration Timeline Validation - Catches Negative Timestamps
  const invalidWordsNegative = [
    { word: 'Negative', start: -0.5, end: 0.5 },
  ];
  const negativeTimeRes = validateNarrationTimeline(invalidWordsNegative, 2.0);
  results.push({
    test: 'Narration Timeline Validator (Catches Negative Timestamps)',
    passed: !negativeTimeRes.valid && negativeTimeRes.errors.some((e) => e.includes('negative')),
    message: 'Correctly caught negative timestamp start=-0.5s',
  });

  // Test 9: Claude Structured Output JSON Repair
  const rawMalformedJson = `\`\`\`json
  {
    "title": "Cleaned Title",
    "score": 95,
    "items": ["one", "two",],
  }
  \`\`\``;
  const repaired = repairJsonString(rawMalformedJson);
  let jsonParsedCleanly = false;
  try {
    const parsed = JSON.parse(repaired);
    jsonParsedCleanly = parsed.title === 'Cleaned Title' && parsed.items.length === 2;
  } catch {}
  results.push({
    test: 'Claude Structured Output JSON Repair Engine',
    passed: jsonParsedCleanly,
    message: jsonParsedCleanly ? 'Successfully cleaned markdown fences and trailing commas' : 'Repair failed',
  });

  // Test 10: Local Storage Provider CRUD & Path Traversal Guard
  const storage = StorageFactory.getProvider();
  const testFileRel = 'scripts/test_artifact.json';
  await storage.save(testFileRel, JSON.stringify({ test: 'local_storage_ok' }));
  const fileExists = await storage.exists(testFileRel);
  const readContent = await storage.read(testFileRel);

  let traversalBlocked = false;
  try {
    storage.getAbsolutePath('../../etc/passwd');
  } catch (e: any) {
    traversalBlocked = true;
  }

  results.push({
    test: 'Local Storage Provider Security & CRUD',
    passed: fileExists && readContent.includes('local_storage_ok') && traversalBlocked,
    message: 'LocalStorageProvider created files, read verified content, and blocked path traversal',
  });

  // Test 11: SQLite Database Provider
  const db = DatabaseFactory.getProvider();
  const testJobId = `test_job_${Date.now()}`;
  await db.createRenderJob({
    id: testJobId,
    status: 'QUEUED',
    progress: 0,
  });
  await db.updateRenderJob(testJobId, {
    status: 'COMPLETED',
    progress: 1.0,
    outputPath: 'renders/test_job/output.mp4',
    duration: 30,
  });
  const fetchedJob = await db.getRenderJob(testJobId);
  const dbPassed = fetchedJob?.status === 'COMPLETED' && fetchedJob?.progress === 1.0;

  results.push({
    test: 'Local SQLite Database Provider Persistence',
    passed: Boolean(dbPassed),
    message: dbPassed ? 'SQLite accurately transitioned render_job to COMPLETED' : 'SQLite operation failed',
  });

  // Test 12: Startup Diagnostic Checks
  const startup = await runStartupCheck();
  results.push({
    test: 'Local-First Startup Diagnostics',
    passed: startup.services.storage && startup.services.sqlite && startup.services.remotion,
    message: `Storage: ${startup.details.storageStatus}, SQLite: ${startup.details.sqliteStatus}, Remotion: ${startup.details.remotionStatus}`,
  });

  return results;
}
