import { VideoSpecSchema } from './schema';
import type { VideoSpec } from './types';
import type { VisualBeat } from './visual';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  repairedSpec?: VideoSpec;
}

function preNormalizeFrameNumbers(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(clone)) {
    if (typeof clone[key] === 'number') {
      if (['durationInFrames', 'durationFrames', 'startFrame', 'fps', 'width', 'height', 'beatIndex'].includes(key)) {
        clone[key] = Math.round(clone[key]);
      }
    } else if (typeof clone[key] === 'object') {
      clone[key] = preNormalizeFrameNumbers(clone[key]);
    }
  }
  return clone;
}

export function validateVideoSpec(data: unknown): ValidationResult {
  const normalizedData = preNormalizeFrameNumbers(data);
  const result = VideoSpecSchema.safeParse(normalizedData);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      warnings: [],
    };
  }

  const spec = result.data as VideoSpec;
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check scene sequence & timing continuity
  let currentFrame = 0;
  for (let i = 0; i < spec.scenes.length; i++) {
    const scene = spec.scenes[i];
    if (scene.startFrame !== currentFrame) {
      warnings.push(`Scene ${scene.sceneNumber} starts at frame ${scene.startFrame}, but expected frame ${currentFrame}. Timing will be normalized.`);
    }
    if (scene.durationFrames <= 0) {
      errors.push(`Scene ${scene.sceneNumber} has non-positive durationFrames (${scene.durationFrames}).`);
    }
    currentFrame += scene.durationFrames;
  }

  if (spec.composition.durationInFrames !== currentFrame) {
    warnings.push(`Composition duration (${spec.composition.durationInFrames}f) does not match total scene duration (${currentFrame}f). Adjusting composition duration.`);
  }

  // Auto-repair spec and visual beats to guarantee flawless rendering
  const repairedScenes = spec.scenes.map((scene, idx) => {
    const prevDuration = spec.scenes.slice(0, idx).reduce((sum, s) => sum + s.durationFrames, 0);
    
    // Ensure and normalize visual beats for production rendering
    let repairedBeats = scene.visualBeats;
    if (!repairedBeats || repairedBeats.length === 0) {
      const vLang = scene.visualLanguage || scene.type || 'cinematic-photo';
      const halfDur = Math.floor(scene.durationFrames / 2);
      const restDur = scene.durationFrames - halfDur;
      repairedBeats = [
        {
          id: `${scene.id}-b1`,
          beatIndex: 0,
          startFrame: 0,
          durationInFrames: halfDur,
          narrativePurpose: scene.title,
          visualIntent: `Establish primary subject for ${scene.title}`,
          primaryVisual: vLang,
          secondaryVisuals: ['editorial-paper'],
          composition: {
            anchor: 'full-bleed',
            focalPoint: { x: 50, y: 50 },
            occupancyPct: 80,
            safeZoneRespect: true,
            negativeSpaceOrientation: 'top',
          },
          assets: scene.props?.imageUrl ? [{ type: 'photo', url: scene.props.imageUrl, subject: scene.title, treatment: 'cinematic_macro', aspectRatio: '16:9' }] : [],
          layers: ['background', 'midground', 'subject', 'typography', 'editorialMarks'],
          layerSpecs: [
            { id: `${scene.id}-b1-bg`, role: 'background', depth: 0.15, transform: { x: 0, y: 0, scale: 1.25, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `${scene.id}-b1-sub`, role: 'subject', depth: 1.0, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `${scene.id}-b1-typ`, role: 'typography', depth: 1.5, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `${scene.id}-b1-marks`, role: 'editorialMarks', depth: 1.65, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
          ],
          camera: { movement: 'push', intensity: 0.22, easing: 'ease-out', focalPoint: { x: 50, y: 50 } },
          motion: ['spring_in', 'slow_drift'],
          typography: {
            treatment: 'brutalist_display',
            eyebrow: `0${idx + 1} // ${scene.type.toUpperCase()}`,
            headline: (scene.props?.headline || scene.title).toUpperCase(),
            emphasisWords: scene.title.split(' ').slice(0, 2),
            position: 'top',
            fontScale: 'display_giant',
          },
          transition: { type: 'fade', durationFrames: 10, sharedGeometry: 'none', direction: 'right' },
          props: scene.props || {},
        },
        {
          id: `${scene.id}-b2`,
          beatIndex: 1,
          startFrame: halfDur,
          durationInFrames: restDur,
          narrativePurpose: `Secondary proof and context for ${scene.title}`,
          visualIntent: 'Layered documentary depth and active metric progression',
          primaryVisual: vLang === 'cinematic-photo' ? 'editorial-paper' : vLang,
          secondaryVisuals: ['technical-diagram'],
          composition: {
            anchor: 'full-bleed',
            focalPoint: { x: 50, y: 50 },
            occupancyPct: 85,
            safeZoneRespect: true,
            negativeSpaceOrientation: 'top',
          },
          assets: [],
          layers: ['background', 'midground', 'subject', 'foreground', 'typography', 'editorialMarks'],
          layerSpecs: [
            { id: `${scene.id}-b2-bg`, role: 'background', depth: 0.15, transform: { x: 0, y: 0, scale: 1.25, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `${scene.id}-b2-sub`, role: 'subject', depth: 1.0, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `${scene.id}-b2-typ`, role: 'typography', depth: 1.5, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `${scene.id}-b2-marks`, role: 'editorialMarks', depth: 1.65, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
          ],
          camera: { movement: 'push', intensity: 0.24, easing: 'ease-out', focalPoint: { x: 50, y: 50 } },
          motion: ['counter_start', 'diagram_pulse'],
          typography: {
            treatment: 'keyword_spotlight',
            eyebrow: `0${idx + 1} // EVIDENCE & PROOF`,
            headline: (scene.props?.headline || scene.title).toUpperCase(),
            emphasisWords: [scene.title.split(' ')[0] || 'KEY'],
            position: 'top',
            fontScale: 'display_giant',
          },
          transition: { type: 'fade', durationFrames: 10, sharedGeometry: 'none', direction: 'right' },
          props: scene.props || {},
        },
      ];
    } else {
      let beatCurrentFrame = 0;
      repairedBeats = repairedBeats.map((beat, bIdx) => {
        const beatDur = Math.max(1, beat.durationInFrames);
        const layers = beat.layers && beat.layers.length > 0 ? beat.layers : ['background', 'midground', 'subject', 'typography', 'editorialMarks'];
        
        // Ensure layerSpecs exist
        const layerSpecs = (beat.layerSpecs && beat.layerSpecs.length > 0)
          ? beat.layerSpecs
          : [
              { id: `${beat.id}-bg`, role: 'background' as const, depth: 0.15, transform: { x: 0, y: 0, scale: 1.25, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
              { id: `${beat.id}-sub`, role: 'subject' as const, depth: 1.0, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
              { id: `${beat.id}-typ`, role: 'typography' as const, depth: 1.5, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
              { id: `${beat.id}-marks`, role: 'editorialMarks' as const, depth: 1.65, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            ];

        const composition = beat.composition || {
          anchor: 'full-bleed' as const,
          focalPoint: { x: 50, y: 50 },
          occupancyPct: 80,
          safeZoneRespect: true,
          negativeSpaceOrientation: 'top' as const,
        };

        const beatObj: VisualBeat = {
          ...beat,
          beatIndex: bIdx,
          startFrame: beatCurrentFrame,
          durationInFrames: beatDur,
          layers,
          layerSpecs,
          composition,
        };
        beatCurrentFrame += beatDur;
        return beatObj;
      });

      // If total beat duration differs from scene duration, normalize
      if (beatCurrentFrame !== scene.durationFrames && beatCurrentFrame > 0) {
        const ratio = scene.durationFrames / beatCurrentFrame;
        let cumulative = 0;
        repairedBeats = repairedBeats.map((beat, bIdx) => {
          const isLast = bIdx === repairedBeats!.length - 1;
          const adjustedDur = isLast
            ? Math.max(1, scene.durationFrames - cumulative)
            : Math.max(1, Math.round(beat.durationInFrames * ratio));
          const adjustedBeat: VisualBeat = {
            ...beat,
            startFrame: cumulative,
            durationInFrames: adjustedDur,
          };
          cumulative += adjustedDur;
          return adjustedBeat;
        });
      }
    }

    return {
      ...scene,
      startFrame: prevDuration,
      sceneNumber: idx + 1,
      visualLanguage: scene.visualLanguage || scene.type || 'cinematic-photo',
      visualBeats: repairedBeats,
    };
  });

  const totalFrames = repairedScenes.reduce((sum, s) => sum + s.durationFrames, 0);

  const repairedSpec: VideoSpec = {
    ...spec,
    version: spec.version || '2.1.0',
    motionSeed: spec.motionSeed ?? 42,
    scenes: repairedScenes,
    composition: {
      ...spec.composition,
      durationInFrames: totalFrames,
    },
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    repairedSpec,
  };
}
