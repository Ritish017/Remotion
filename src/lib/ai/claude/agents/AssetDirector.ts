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
        // Synthesize intelligent multi-layer asset requests based on narrative and visual language
        allRequests.push({
          id: `asset_${scene.sceneId}_primary`,
          type: beat.primaryVisual.includes('photo') ? 'photo' : beat.primaryVisual.includes('map') ? 'map' : beat.primaryVisual.includes('cutout') ? 'photo' : 'diagram',
          subject: beat.visualIntent || scene.visualIntent || 'Documentary Subject',
          treatment: beat.primaryVisual.includes('archival') ? 'archival_grain' : 'cinematic_macro',
          aspectRatio: '16:9',
        });
      }
    }
  }

  // Deduplicate and resolve assets
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
