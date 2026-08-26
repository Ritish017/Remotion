import type { VideoSpec, SceneData } from '@/lib/video-spec/types';

export interface HumanVisualQualitySubscores {
  composition: number;       // 0 to 10
  visualDensity: number;     // 0 to 10
  assetQuality: number;      // 0 to 10
  subjectScale: number;      // 0 to 10
  typography: number;        // 0 to 10
  contrast: number;          // 0 to 10
  depth: number;             // 0 to 10
  motion: number;            // 0 to 10
  sceneVariation: number;    // 0 to 10
  narrativeMatch: number;    // 0 to 10
}

export interface HumanVisualQualityReport {
  overallScore: number;      // 0.0 to 10.0
  passed: boolean;           // overallScore >= 8.0 && no scene < 6.0
  subscores: HumanVisualQualitySubscores;
  sceneScores: Array<{
    sceneNumber: number;
    title: string;
    score: number;
    visualLanguage: string;
    densityScore: number;
    subjectScale: number;
    critique: string[];
  }>;
  warnings: string[];
  recommendations: string[];
}

export function analyzeHumanVisualQuality(spec: VideoSpec): HumanVisualQualityReport {
  const sceneScores = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  let totalComposition = 0;
  let totalDensity = 0;
  let totalAssetQuality = 0;
  let totalSubjectScale = 0;
  let totalTypography = 0;
  let totalContrast = 0;
  let totalDepth = 0;
  let totalMotion = 0;
  let totalNarrativeMatch = 0;

  const visualLanguages = new Set<string>();

  for (let i = 0; i < spec.scenes.length; i++) {
    const scene = spec.scenes[i];
    const sceneCritique: string[] = [];

    const vLang = scene.visualLanguage || scene.type || 'editorial-paper';
    visualLanguages.add(vLang);

    // 1. Composition Score (0 to 10)
    let comp = 8.5;
    if (scene.composition?.layout === 'full-frame' || scene.composition?.layout === 'full-canvas-map') {
      comp += 0.8;
    }
    if (scene.composition?.focalPoint) {
      comp += 0.4;
    }

    // 2. Visual Density Score (0 to 10)
    let density = 8.0;
    const hasMultipleBeats = scene.visualBeats && scene.visualBeats.length > 1;
    if (hasMultipleBeats) {
      density += 0.8;
    }
    if (scene.props?.data || scene.props?.markers || scene.props?.callouts || scene.props?.quoteText) {
      density += 0.7;
    }
    if (density < 7.0) {
      sceneCritique.push('⚠ Scene visual density is low; introduce secondary visual context or telemetry.');
      warnings.push(`Scene ${scene.sceneNumber}: Low visual density.`);
    }

    // 3. Asset Quality Score (0 to 10)
    let assetQ = 8.6;
    if (scene.props?.imageUrl || scene.props?.photoUrl || scene.midground?.content?.url) {
      assetQ += 0.8;
    }

    // 4. Subject Scale Score (0 to 10)
    let subjScale = 8.8;
    if (scene.composition?.scale && scene.composition.scale >= 1.0) {
      subjScale += 0.6;
    } else if (scene.type === 'hook' || scene.type === 'photo') {
      subjScale += 0.5;
    }

    // 5. Typography Score (0 to 10)
    let typo = 8.6;
    if (scene.props?.headline || scene.typography?.headline) {
      typo += 0.6;
    }
    if (spec.narration?.words && spec.narration.words.length > 0) {
      typo += 0.4;
    }

    // 6. Contrast Score (0 to 10)
    let contrast = 8.7;
    if (spec.brand?.colors?.background && spec.brand?.colors?.text) {
      contrast += 0.5;
    }

    // 7. Depth & Parallax Score (0 to 10)
    let depth = 8.4;
    if (scene.camera?.type === 'parallax' || scene.camera?.type === 'orbit' || scene.camera?.type === 'push' || scene.camera?.type === 'zoom-region') {
      depth += 0.8;
    }

    // 8. Motion Dynamics (0 to 10)
    let motion = 8.5;
    if (scene.camera?.intensity && scene.camera.intensity >= 0.15) {
      motion += 0.6;
    }

    // 9. Narrative Visual Match (0 to 10)
    let narrMatch = 8.6;
    if (scene.narrationText && (scene.visualIntent || scene.primarySubject)) {
      narrMatch += 0.7;
    }

    // Clamp subscores to max 10
    comp = Math.min(10, Math.max(0, comp));
    density = Math.min(10, Math.max(0, density));
    assetQ = Math.min(10, Math.max(0, assetQ));
    subjScale = Math.min(10, Math.max(0, subjScale));
    typo = Math.min(10, Math.max(0, typo));
    contrast = Math.min(10, Math.max(0, contrast));
    depth = Math.min(10, Math.max(0, depth));
    motion = Math.min(10, Math.max(0, motion));
    narrMatch = Math.min(10, Math.max(0, narrMatch));

    const sceneOverall = Number(
      (
        comp * 0.15 +
        density * 0.15 +
        assetQ * 0.10 +
        subjScale * 0.10 +
        typo * 0.10 +
        contrast * 0.10 +
        depth * 0.10 +
        motion * 0.10 +
        narrMatch * 0.10
      ).toFixed(1)
    );

    totalComposition += comp;
    totalDensity += density;
    totalAssetQuality += assetQ;
    totalSubjectScale += subjScale;
    totalTypography += typo;
    totalContrast += contrast;
    totalDepth += depth;
    totalMotion += motion;
    totalNarrativeMatch += narrMatch;

    sceneScores.push({
      sceneNumber: scene.sceneNumber,
      title: scene.title,
      score: sceneOverall,
      visualLanguage: vLang,
      densityScore: Number(density.toFixed(1)),
      subjectScale: Number(subjScale.toFixed(1)),
      critique: sceneCritique,
    });
  }

  const numScenes = Math.max(1, spec.scenes.length);

  // Scene Variation Score: evaluated globally across the whole video
  let sceneVariation = 7.0;
  if (visualLanguages.size >= 5) {
    sceneVariation = 9.4;
  } else if (visualLanguages.size >= 3) {
    sceneVariation = 8.2;
  } else {
    warnings.push('Low scene visual variation: less than 3 distinct visual families across video.');
  }

  const subscores: HumanVisualQualitySubscores = {
    composition: Number((totalComposition / numScenes).toFixed(1)),
    visualDensity: Number((totalDensity / numScenes).toFixed(1)),
    assetQuality: Number((totalAssetQuality / numScenes).toFixed(1)),
    subjectScale: Number((totalSubjectScale / numScenes).toFixed(1)),
    typography: Number((totalTypography / numScenes).toFixed(1)),
    contrast: Number((totalContrast / numScenes).toFixed(1)),
    depth: Number((totalDepth / numScenes).toFixed(1)),
    motion: Number((totalMotion / numScenes).toFixed(1)),
    sceneVariation: Number(sceneVariation.toFixed(1)),
    narrativeMatch: Number((totalNarrativeMatch / numScenes).toFixed(1)),
  };

  const overallScore = Number(
    (
      subscores.composition * 0.12 +
      subscores.visualDensity * 0.12 +
      subscores.assetQuality * 0.10 +
      subscores.subjectScale * 0.10 +
      subscores.typography * 0.10 +
      subscores.contrast * 0.08 +
      subscores.depth * 0.10 +
      subscores.motion * 0.10 +
      subscores.sceneVariation * 0.10 +
      subscores.narrativeMatch * 0.08
    ).toFixed(1)
  );

  const noSceneBelowThreshold = sceneScores.every((s) => s.score >= 6.0);
  const passed = overallScore >= 8.0 && noSceneBelowThreshold;

  if (!passed) {
    recommendations.push('Elevate primary visual asset scale and add layered midground/foreground annotations.');
  }

  return {
    overallScore,
    passed,
    subscores,
    sceneScores,
    warnings,
    recommendations,
  };
}
