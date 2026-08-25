import { runContentDirector, type ContentBrief } from './agents/ContentDirector';
import { runStoryboardDirector } from './agents/StoryboardDirector';
import { runProductionAgent } from './agents/ProductionAgent';
import { runAutomatedQA, type QAReport } from '@/lib/qa';
import type { VideoSpec } from '@/lib/video-spec/types';

export interface FullVideoGenerationResult {
  success: boolean;
  spec: VideoSpec;
  qaReport: QAReport;
  transcript: string;
}

export async function generateFullVideoSpec(brief: ContentBrief): Promise<FullVideoGenerationResult> {
  // Step 1: Content Director generates narrative arc and spoken script
  const content = await runContentDirector(brief);

  // Step 2: Storyboard Director breaks into 7 timed scenes with templates & camera motion
  const scenes = await runStoryboardDirector(content, 30);

  // Step 3: Production Agent assembles validated VideoSpec with word-level captions
  const spec = await runProductionAgent({
    title: content.title,
    transcript: content.fullTranscript,
    scenes,
    brandId: brief.vertical || 'catalyst-editorial',
    format: '9:16',
  });

  // Step 4: QA Agent validates continuity, templates, and safe zones
  const qaReport = runAutomatedQA(spec);

  return {
    success: qaReport.passed,
    spec,
    qaReport,
    transcript: content.fullTranscript,
  };
}
