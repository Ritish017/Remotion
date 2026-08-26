import { AssetCache } from '@/lib/storage/AssetCache';
import { searchAssets } from '@/lib/assets/registry';
import type { VisualPlan, AssetRequest } from '@/lib/video-spec/visual';

export interface AssetDirectorOutput {
  resolvedAssets: Array<{
    id: string;
    type: string;
    url: string;
    description?: string;
  }>;
  totalAssets: number;
}

export async function runAssetDirector(visualPlan: VisualPlan): Promise<AssetDirectorOutput> {
  const allRequests: AssetRequest[] = [];

  for (const scene of visualPlan.scenes) {
    for (const beat of scene.beats) {
      if (beat.assets && beat.assets.length > 0) {
        allRequests.push(...beat.assets);
      } else {
        // Derive semantic search query from topic title, scene intent, and visual metaphor
        const semanticSubject = beat.visualMetaphor || beat.visualIntent || scene.visualIntent || scene.narrativePurpose || visualPlan.title;
        
        allRequests.push({
          id: `asset_${scene.sceneId}_${beat.id}`,
          type: beat.primaryVisual.includes('photo') ? 'photo' : beat.primaryVisual.includes('map') ? 'map' : beat.primaryVisual.includes('cutout') ? 'photo' : 'diagram',
          subject: semanticSubject,
          treatment: beat.primaryVisual.includes('archival') ? 'archival_grain' : 'cinematic_macro',
          aspectRatio: '16:9',
          canvasCoveragePct: 80,
        });
      }
    }
  }

  // Deduplicate and resolve assets with topic-specific intelligence
  const resolvedAssets: Array<{ id: string; type: string; url: string; description?: string }> = [];
  const seen = new Set<string>();

  for (const req of allRequests) {
    const key = `${req.type}:${req.subject}:${req.treatment || 'standard'}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const publicUrl = await AssetCache.getOrResolveAsset(req);
    resolvedAssets.push({
      id: req.id || `asset_${resolvedAssets.length + 1}`,
      type: req.type,
      url: publicUrl,
      description: `${req.subject} (${req.treatment || 'standard'})`,
    });
  }

  return {
    resolvedAssets,
    totalAssets: resolvedAssets.length,
  };
}
