import type { VideoSpec } from '@/lib/video-spec/types';

export interface TypographyQualityReport {
  passed: boolean;
  score: number;
  warnings: string[];
}

export function validateTypographyQuality(spec: VideoSpec): TypographyQualityReport {
  const warnings: string[] = [];
  let violations = 0;

  for (const scene of spec.scenes) {
    const headline = scene.props?.headline || scene.title || '';

    // Check maximum headline length to prevent wrapping collisions
    if (headline.length > 50) {
      violations++;
      warnings.push(`Scene ${scene.sceneNumber}: Headline is too long (${headline.length} chars) for broadcast safe zone.`);
    }

    if (scene.visualBeats) {
      for (const beat of scene.visualBeats) {
        if (beat.typography?.headline && beat.typography.headline.length > 60) {
          violations++;
          warnings.push(`Scene ${scene.sceneNumber} Beat "${beat.id}": Typography headline exceeds safe line length.`);
        }
      }
    }
  }

  // Check caption fontSize if configured
  const captionSize = spec.brand?.captionStyle?.fontSize;
  if (captionSize && captionSize < 24) {
    violations++;
    warnings.push(`Caption font size (${captionSize}px) is too small for mobile legibility. Minimum recommended is 32px.`);
  }

  const score = Math.max(0, 100 - violations * 15);

  return {
    passed: score >= 80,
    score,
    warnings,
  };
}
