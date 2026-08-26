import { DatabaseFactory } from '../src/lib/database';
import { runCampaignDirector } from '../src/lib/ai/claude/agents/CampaignDirector';
import { AntiGenericEngine, type EpisodeDNA } from '../src/lib/video-spec/dna';
import type { Campaign } from '../src/lib/campaign/types';

async function testCampaignEngine() {
  console.log('🎬 Testing Catalyst Campaign Engine & Anti-Generic Novelty Scorer...\n');

  const db = DatabaseFactory.getProvider();

  // 1. Create a Campaign
  const testCampaign: Campaign = {
    id: `camp_test_${Date.now()}`,
    name: 'Daily AI News',
    niche: 'Artificial Intelligence & Neural Architectures',
    targetAudience: 'Engineers, researchers, and tech leaders',
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels'],
    publishingFrequency: 'daily',
    contentPillars: [
      { id: 'p1', title: 'Frontier Models', description: 'Architecture & benchmark shifts', weight: 0.35 },
      { id: 'p2', title: 'Compute & Silicon', description: 'GPU clusters & chip fabrication', weight: 0.25 },
      { id: 'p3', title: 'Autonomous Agents', description: 'Enterprise workflows & reasoning systems', weight: 0.25 },
      { id: 'p4', title: 'Geopolitics & Policy', description: 'Global export corridors & safety', weight: 0.15 },
    ],
    tone: 'Investigative, empirical, broadcast-grade',
    editorialIdentity: {
      voice: 'Investigative, analytical, authoritative',
      narrativePacing: 'documentary',
      complexityLevel: 'progressive',
      citationStandard: 'industry_empirical',
    },
    visualIdentity: {
      primaryPalette: 'vox_investigation_dark',
      typographyDisplay: 'Inter, system-ui, sans-serif',
      typographyMono: 'JetBrains Mono, monospace',
      textureStyle: 'paper_grain',
      editorialMarksStyle: 'red_marker',
    },
    preferredDurationSeconds: 45,
    aspectRatios: ['9:16'],
    narrationStyle: {
      voice: 'onyx',
      speed: 1.0,
      cadenceWordsPerSec: 2.4,
    },
    ctaStrategy: {
      hookOutro: 'Follow Catalyst Content OS for daily engineering breakdowns.',
      channelHandle: '@CatalystOS',
      actionPrompt: 'Subscribe for the next episode.',
    },
  };

  await db.createCampaign({
    id: testCampaign.id,
    name: testCampaign.name,
    description: 'Testing autonomous monthly campaign generation',
    niche: testCampaign.niche,
    targetAudience: testCampaign.targetAudience,
    platformsJson: JSON.stringify(testCampaign.platforms),
    publishingFrequency: testCampaign.publishingFrequency,
    contentPillarsJson: JSON.stringify(testCampaign.contentPillars),
    tone: testCampaign.tone,
    preferredDurationSeconds: testCampaign.preferredDurationSeconds,
    aspectRatiosJson: JSON.stringify(testCampaign.aspectRatios),
  });
  console.log(`✅ [1/4] Campaign created in SQLite: "${testCampaign.name}" (${testCampaign.id})`);

  // 2. Generate 30-Day Calendar with Campaign Director
  const year = 2026;
  const month = 8;
  console.log(`\n📅 Generating 30-Day Monthly Calendar for ${year}-${month}...`);

  const calendar = await runCampaignDirector({
    campaign: testCampaign,
    year,
    month,
    historicalDNA: [],
  });

  console.log(`✅ [2/4] Generated 30-Day Calendar with ${calendar.days.length} days planned.`);
  console.log(`   Theme: "${calendar.days[0]?.title}"`);

  // 3. Test Episode DNA & Novelty Scorer on consecutive episodes
  console.log('\n🧬 [3/4] Evaluating Episode DNA & Anti-Generic Novelty Scores across 30 days:');
  let minScore = 100;
  let maxScore = 0;
  let allAboveThreshold = true;

  calendar.days.slice(0, 10).forEach((day) => {
    const score = day.visualNoveltyScore || 0;
    if (score < minScore) minScore = score;
    if (score > maxScore) maxScore = score;
    if (score < 75) allAboveThreshold = false;

    console.log(
      `   Day ${String(day.dayIndex).padStart(2, ' ')} | Pillar: ${day.contentPillar.padEnd(20)} | Novelty: ${score}% (${score >= 75 ? 'PASSED >=75' : 'FAILED <75'}) | ${day.topic.slice(0, 45)}...`
    );
  });

  if (allAboveThreshold) {
    console.log(`\n✅ Anti-Generic Gate: ALL EPISODES passed minimum novelty threshold >= 75 (Range: ${minScore}% - ${maxScore}%)`);
  } else {
    throw new Error(`Anti-generic gate failed: some episodes scored below 75.`);
  }

  // 4. Test Auto-Redesign on Identical DNA
  console.log('\n🧪 [4/4] Testing Anti-Generic Redesign Trigger:');
  const baseDNA: EpisodeDNA = {
    episodeId: 'test_ep_dup',
    storyStructure: '7_beat_investigative',
    visualLanguage: 'editorial-paper',
    compositionLanguage: 'monolithic_subject_hero',
    motionLanguage: 'editorial_spring_stagger',
    cameraLanguage: 'aggressive_push',
    typographyLanguage: 'brutalist_display_monolith',
    transitionLanguage: 'match_cut_geometric',
    assetTreatment: 'cinematic_macro',
    colorTreatment: {
      paletteId: 'vox_investigation_dark',
      base: '#0b0d13',
      surface: '#161922',
      accent: '#ffd166',
      secondaryAccent: '#00c9a7',
      highlight: '#f0522a',
      text: '#f8fafc',
      mutedText: '#94a3b8',
    },
    textureTreatment: {
      paperTexture: true,
      grainIntensity: 0.10,
      blueprintGrid: true,
      halftoneDotDensity: 4,
      vignetteIntensity: 0.40,
    },
    captionTreatment: {
      preset: 'vox-editorial',
      highlightColor: '#ffd166',
      fontSizePx: 42,
    },
    soundDesign: {
      musicGenre: 'investigative_synth',
      sfxKit: 'cinematic_whooshes',
      duckingPercentage: 0.25,
    },
    editingRhythm: {
      avgBeatDurationFrames: 75,
      beatCountPerScene: 3,
      microPacingRamp: 'escalating',
    },
    visualMetaphors: [{ sceneIndex: 1, abstractConcept: 'AI', concreteObject: 'Microchip' }],
    endingTreatment: 'signature_brand_monolith',
  };

  const duplicateScore = AntiGenericEngine.calculateNoveltyScore(baseDNA, [{ dna: baseDNA }]);
  console.log(`   Identical Consecutive DNA Score: ${duplicateScore.score}% (Expected < 75)`);
  console.log(`   Passed status: ${duplicateScore.passed}`);
  console.log(`   Recommendations: ${(duplicateScore.redesignRecommendations || []).join(', ')}`);

  if (duplicateScore.passed) {
    throw new Error('Identical DNA should fail the novelty score gate!');
  }

  console.log('\n🎉 ALL CAMPAIGN ENGINE TESTS PASSED SUCCESFULLY!\n');
}

testCampaignEngine().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
