'use client';

import React from 'react';
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, useVideoConfig } from 'remotion';
import { getTemplateById } from '../registry/TemplateRegistry';
import { DocumentaryCaptions } from '../components/captions/DocumentaryCaptions';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import type { VideoSpec } from '@/lib/video-spec/types';

import { VisualBeatRenderer } from '../composition/VisualBeatRenderer';

export interface MasterCompositionProps {
  spec?: VideoSpec;
}

export const MasterComposition: React.FC<MasterCompositionProps> = ({ spec = SAMPLE_SHOWCASE_SPEC }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scenes, brand, narration, audio, motionSeed = 42 } = spec;

  // Calculate current audio ducking factor (reduce music volume during speech)
  const isSpeaking = narration?.words?.some((w) => {
    const startFrame = Math.round(w.start * fps);
    const endFrame = Math.round(w.end * fps);
    return frame >= startFrame && frame <= endFrame;
  });

  const musicVolume = isSpeaking
    ? (audio?.musicVolume ?? 0.25) * (1 - (audio?.duckingPercentage ?? 0.3))
    : (audio?.musicVolume ?? 0.25);

  return (
    <AbsoluteFill className="bg-[#0b0d13] select-none">
      {/* 1. Scene Sequences */}
      {scenes.map((scene) => {
        const hasBeats = Array.isArray(scene.visualBeats) && scene.visualBeats.length > 0;

        return (
          <Sequence
            key={scene.id}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={`Scene ${scene.sceneNumber} (${scene.visualLanguage || scene.type})`}
          >
            {hasBeats ? (
              <VisualBeatRenderer scene={scene} brand={brand} motionSeed={motionSeed} />
            ) : (
              (() => {
                const template = getTemplateById(scene.templateId);
                const SceneComponent = template.component;
                return <SceneComponent scene={scene} brand={brand} />;
              })()
            )}
          </Sequence>
        );
      })}

      {/* 2. Word-Level Captions Overlay */}
      {narration?.words && narration.words.length > 0 && (
        <DocumentaryCaptions
          words={narration.words}
          preset={(brand?.captionStyle?.preset as any) || 'vox-editorial'}
          brand={brand}
        />
      )}

      {/* 3. Audio Layers */}
      {/* Voiceover Track */}
      {audio?.voiceoverUrl && typeof audio.voiceoverUrl === 'string' && audio.voiceoverUrl.trim().length > 0 && (
        <Audio
          src={audio.voiceoverUrl}
          volume={audio.voiceoverVolume ?? 1.0}
        />
      )}

      {/* Background Music Track */}
      {audio?.musicUrl && typeof audio.musicUrl === 'string' && audio.musicUrl.trim().length > 0 && (
        <Audio
          src={audio.musicUrl}
          volume={musicVolume}
          loop
        />
      )}

      {/* SFX Triggers */}
      {audio?.sfx && audio.sfx.map((trigger, idx) => (
        trigger.url && typeof trigger.url === 'string' && trigger.url.trim().length > 0 ? (
          <Sequence
            key={`sfx-${trigger.sfxId}-${idx}`}
            from={trigger.frame}
            durationInFrames={30}
          >
            <Audio
              src={trigger.url}
              volume={trigger.volume ?? 0.8}
            />
          </Sequence>
        ) : null
      ))}
    </AbsoluteFill>
  );
};
