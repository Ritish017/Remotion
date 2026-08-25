'use client';

import React from 'react';
import { MasterComposition } from './MasterComposition';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import type { VideoSpec } from '@/lib/video-spec/types';

export interface VerticalExplainerProps {
  spec?: VideoSpec;
}

export const VerticalExplainer: React.FC<VerticalExplainerProps> = ({ spec = SAMPLE_SHOWCASE_SPEC }) => {
  return <MasterComposition spec={spec} />;
};
