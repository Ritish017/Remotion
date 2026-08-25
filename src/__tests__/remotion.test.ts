import { validateVideoSpec } from '../lib/video-spec/validator';
import { SAMPLE_SHOWCASE_SPEC } from '../lib/video-spec/sampleSpec';
import { SAMPLE_SHOWCASE_SPEC_2 } from '../lib/video-spec/sampleSpec2';
import { TEMPLATE_REGISTRY, getTemplateById } from '../remotion/registry/TemplateRegistry';
import { runAutomatedQA } from '../lib/qa';

export function runRemotionTestSuite() {
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

  return results;
}
