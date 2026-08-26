'use client';

import React from 'react';
import { Composition } from 'remotion';
import { MasterComposition } from './compositions/MasterComposition';
import { Phase6RevisedShowcase } from './compositions/Phase6RevisedShowcase';
import { VerticalExplainer } from './compositions/VerticalExplainer';
import { HorizontalExplainer } from './compositions/HorizontalExplainer';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import { SAMPLE_SHOWCASE_SPEC_2 } from '@/lib/video-spec/sampleSpec2';
import { VideoSpecSchema } from '@/lib/video-spec/schema';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Primary Vertical 9:16 Editorial Explainer */}
      <Composition
        id="VerticalExplainer"
        component={VerticalExplainer}
        durationInFrames={SAMPLE_SHOWCASE_SPEC.composition.durationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          spec: SAMPLE_SHOWCASE_SPEC,
        }}
        schema={VideoSpecSchema as any}
      />

      {/* 2. Horizontal 16:9 Landscape Explainer */}
      <Composition
        id="HorizontalExplainer"
        component={HorizontalExplainer}
        durationInFrames={SAMPLE_SHOWCASE_SPEC.composition.durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          spec: SAMPLE_SHOWCASE_SPEC,
        }}
        schema={VideoSpecSchema as any}
      />

      {/* 3. Parameterized Master Composition */}
      <Composition
        id="MasterComposition"
        component={MasterComposition}
        durationInFrames={SAMPLE_SHOWCASE_SPEC.composition.durationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          spec: SAMPLE_SHOWCASE_SPEC,
        }}
        schema={VideoSpecSchema as any}
      />

      <Composition
        id="Phase6RevisedShowcase"
        component={Phase6RevisedShowcase}
        durationInFrames={1350}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 4. Showcase Video 2 (Robotics Inflection) */}
      <Composition
        id="ShowcaseVideo2"
        component={VerticalExplainer}
        durationInFrames={1350}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          spec: SAMPLE_SHOWCASE_SPEC_2,
        }}
        schema={VideoSpecSchema as any}
      />
    </>
  );
};
