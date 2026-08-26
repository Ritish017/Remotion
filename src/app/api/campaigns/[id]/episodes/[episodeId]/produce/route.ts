import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { ResearchOrchestrator } from '@/lib/research/ResearchOrchestrator';
import { runContentDirector } from '@/lib/ai/claude/agents/ContentDirector';
import { runStoryboardDirector } from '@/lib/ai/claude/agents/StoryboardDirector';
import { runVisualDirector } from '@/lib/ai/claude/agents/VisualDirector';
import { runAssetDirector } from '@/lib/ai/claude/agents/AssetDirector';
import { runMotionDirector } from '@/lib/ai/claude/agents/MotionDirector';
import { analyzeNarrativeTiming } from '@/lib/ai/claude/agents/NarrativeTimingAnalyzer';
import { assembleVideoSpecV2 } from '@/lib/ai/claude/agents/ProductionAgent';
import { generateNarration } from '@/lib/audio/narrator';
import { runAutomatedQA } from '@/lib/qa';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import { AntiGenericEngine, type EpisodeDNA } from '@/lib/video-spec/dna';
import type { VideoSpec, ResearchSource } from '@/lib/video-spec/types';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const { id: campaignId, episodeId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const db = DatabaseFactory.getProvider();

    // 1. Fetch Campaign & Episode
    const campaignRec = await db.getCampaign(campaignId);
    if (!campaignRec) {
      return NextResponse.json({ error: `Campaign [${campaignId}] not found` }, { status: 404 });
    }

    const episodeRec = await db.getEpisode(episodeId);
    const topic = body.topic || episodeRec?.topic || campaignRec.name;
    const targetDurationSeconds = body.durationSeconds || campaignRec.preferredDurationSeconds || 45;

    // Update status to RESEARCHING
    await db.updateEpisode(episodeId, { status: 'RESEARCHING' });

    // 2. Research Orchestration
    const researchOrchestrator = new ResearchOrchestrator();
    const researchReport = await researchOrchestrator.conductResearch({
      topic,
      useStructuredData: true,
      targetDurationSeconds,
    });

    const formattedSources: ResearchSource[] = (researchReport.evidence.sources || []).map((s: any, idx: number) => ({
      sourceId: s.sourceId || s.id || `src-${idx + 1}`,
      title: s.title || `Research Source ${idx + 1}`,
      url: s.url,
      publisher: s.publisher,
    }));

    // Persist research sources and facts in SQLite
    for (const src of formattedSources) {
      await db.saveResearchSource({
        id: `src_${episodeId}_${src.sourceId}`,
        projectId: campaignId,
        topic,
        url: src.url,
        title: src.title,
        sourceType: 'web_article',
        content: `Research content for topic: ${topic}`,
      }).catch(() => {});
    }

    if (researchReport.evidence.facts) {
      for (let fi = 0; fi < researchReport.evidence.facts.length; fi++) {
        const f = researchReport.evidence.facts[fi];
        await db.saveResearchFact({
          id: `fact_${episodeId}_${fi + 1}`,
          projectId: campaignId,
          sourceId: formattedSources[0]?.sourceId,
          fact: typeof f === 'string' ? f : f.fact || String(f),
          confidence: 0.95,
        }).catch(() => {});
      }
    }

    // Update status to RESEARCH_COMPLETE and start SCRIPTING
    await db.updateEpisode(episodeId, {
      status: 'RESEARCH_COMPLETE',
      researchJson: JSON.stringify(researchReport),
    });

    await db.updateEpisode(episodeId, { status: 'SCRIPTING' });

    // 3. Content Director (7-Beat Script)
    const content = await runContentDirector({
      topic,
      targetAudience: campaignRec.targetAudience || 'Tech professionals & curious builders',
      vertical: campaignRec.niche || 'Technology & Infrastructure',
      brandVoice: campaignRec.tone || 'Investigative, analytical, authoritative, cinematic',
      durationSeconds: targetDurationSeconds,
      sources: formattedSources,
    });

    // Update status to SCRIPT_COMPLETE and start STORYBOARDING
    await db.updateEpisode(episodeId, {
      status: 'SCRIPT_COMPLETE',
      title: content.title,
      scriptJson: JSON.stringify(content),
    });

    await db.updateEpisode(episodeId, { status: 'STORYBOARDING' });

    // 4. Audio Generation & Whisper Forced Alignment
    const narration = await generateNarration(content.fullTranscript);
    const timingAnalysis = analyzeNarrativeTiming(narration.words, 30);

    await db.updateEpisode(episodeId, { status: 'VOICE_COMPLETE' });

    // 5. Storyboard Director
    const storyboard = await runStoryboardDirector({
      content,
      brandId: campaignRec.visualIdentityJson ? JSON.parse(campaignRec.visualIdentityJson).primaryPalette : 'catalyst-editorial',
      format: '9:16',
    });

    // 6. Visual Director & Anti-Generic DNA Synthesis
    const visualPlan = await runVisualDirector({
      content,
      storyboard: storyboard.scenes,
      words: narration.words,
      format: '9:16',
      durationSeconds: targetDurationSeconds,
    });

    await db.updateEpisode(episodeId, {
      status: 'VISUAL_DIRECTION_COMPLETE',
      storyboardJson: JSON.stringify({ storyboard: storyboard.scenes, visualPlan }),
    });

    const episodeDNA: EpisodeDNA = {
      episodeId,
      storyStructure: '7_beat_investigative',
      visualLanguage: (visualPlan.scenes[0]?.visualLanguage as any) || 'editorial-paper',
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
      visualMetaphors: visualPlan.scenes.map((s, idx) => ({
        sceneIndex: idx + 1,
        abstractConcept: s.narrativePurpose,
        concreteObject: s.visualMetaphor || 'Physical mechanical layout',
      })),
      endingTreatment: 'signature_brand_monolith',
    };

    // Calculate Novelty against historical visual memory
    const visualMemoryRecords = await db.listVisualStyleMemory(campaignId, 20);
    const history = visualMemoryRecords.map(r => ({ dna: JSON.parse(r.dnaJson) }));
    const noveltyResult = AntiGenericEngine.calculateNoveltyScore(episodeDNA, history);

    // 7. Asset & Motion Planning
    const assetPlan = await runAssetDirector(visualPlan);
    const motionPlan = await runMotionDirector(visualPlan, timingAnalysis);

    // 8. VideoSpec Assembly
    const assembledSpec = assembleVideoSpecV2({
      content,
      storyboard: storyboard.scenes,
      visualPlan,
      motionPlan,
      resolvedAssets: assetPlan,
      words: narration.words,
      audioUrl: narration.audioUrl,
      durationSeconds: targetDurationSeconds,
      brandId: 'catalyst-editorial',
    });

    assembledSpec.episodeDNA = episodeDNA;
    assembledSpec.noveltyScore = noveltyResult.score;

    // Validate spec
    const validation = validateVideoSpec(assembledSpec);
    const validSpec = validation.repairedSpec || assembledSpec;

    // Run Automated QA Gate
    const qaReport = runAutomatedQA(validSpec);

    // Save VideoSpec and DNA to SQLite
    await db.saveVideoSpec({
      id: validSpec.id,
      projectId: campaignId,
      episodeId,
      specJson: JSON.stringify(validSpec),
      versionTag: '2.1.0',
    });

    await db.saveEpisodeDNA({
      id: `dna_${episodeId}`,
      episodeId,
      campaignId,
      dnaJson: JSON.stringify(episodeDNA),
      visualNoveltyScore: noveltyResult.score,
      noveltyBreakdownJson: JSON.stringify(noveltyResult.breakdown),
    });

    await db.saveVisualStyleMemory({
      id: `vsm_${episodeId}`,
      campaignId,
      episodeId,
      visualLanguage: episodeDNA.visualLanguage,
      compositionLanguage: episodeDNA.compositionLanguage,
      motionLanguage: episodeDNA.motionLanguage,
      cameraLanguage: episodeDNA.cameraLanguage,
      paletteId: episodeDNA.colorTreatment.paletteId,
      metaphorsJson: JSON.stringify(episodeDNA.visualMetaphors),
      dnaJson: JSON.stringify(episodeDNA),
    });

    // Update status to PREVIEW_READY
    await db.updateEpisode(episodeId, {
      status: 'PREVIEW_READY',
      title: validSpec.title,
      videoSpecId: validSpec.id,
      qaReportJson: JSON.stringify(qaReport),
    });

    return NextResponse.json({
      success: true,
      spec: validSpec,
      novelty: noveltyResult,
      qaReport,
    });
  } catch (error: any) {
    console.error('Episode production error:', error);
    return NextResponse.json({ error: error.message || 'Episode production failed' }, { status: 500 });
  }
}
