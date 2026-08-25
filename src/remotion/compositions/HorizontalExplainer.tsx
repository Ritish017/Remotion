'use client';

import React from 'react';
import { MasterComposition } from './MasterComposition';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import type { VideoSpec } from '@/lib/video-spec/types';

export interface HorizontalExplainerProps {
  spec?: VideoSpec;
}

export const HorizontalExplainer: React.FC<HorizontalExplainerProps> = ({ spec = SAMPLE_SHOWCASE_SPEC }) => {
  const horizontalSpec: VideoSpec = {
    ...spec,
    composition: {
      ...spec.composition,
      format: '16:9',
      width: 1920,
      height: 1080,
    },
  };
  return <MasterComposition spec={horizontalSpec} />;
};
