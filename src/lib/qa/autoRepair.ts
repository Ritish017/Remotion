import fs from 'fs';
import path from 'path';
import { VisualCriticAgent, visualCriticAgent, type VisualCritiqueReport, type VisualCritiqueIssue } from '@/lib/ai/claude/agents/VisualCriticAgent';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import type { VideoSpec } from '@/lib/video-spec/types';
import { getBaseStoragePath } from '@/lib/storage/storagePaths';

export interface AutoRepairOptions {
  maxIterations?: number; // default: 3
  targetScore?: number;   // default: 8.5
  projectId?: string;
}

export interface AutoRepairResult {
  finalSpec: VideoSpec;
  iterations: number;
  passed: boolean;
  finalScore: number;
  auditTrail: {
    iteration: number;
    score: number;
    issuesCount: number;
    appliedPatches: number;
    report: VisualCritiqueReport;
  }[];
}

export class AutoRepairController {
  private critic: VisualCriticAgent;

  constructor(criticInstance?: VisualCriticAgent) {
    this.critic = criticInstance || visualCriticAgent;
  }

  /**
   * Applies structured critique patches to a VideoSpec
   */
  public applyCorrectionPatches(spec: VideoSpec, issues: VisualCritiqueIssue[]): VideoSpec {
    const updatedSpec: VideoSpec = JSON.parse(JSON.stringify(spec));

    for (const issue of issues) {
      const patch = issue.correctionPatch;
      if (!patch) continue;

      const sceneIdx = Math.max(0, Math.min(updatedSpec.scenes.length - 1, issue.sceneIndex - 1));
      const targetScene = updatedSpec.scenes[sceneIdx];
      if (!targetScene) continue;

      // 1. Apply Subject Scale & Occupancy
      if (patch.scaleMultiplier) {
        targetScene.composition = {
          ...(targetScene.composition || {}),
          scale: Number(((targetScene.composition?.scale || 1.0) * patch.scaleMultiplier).toFixed(2)),
        };
      }

      // 2. Apply Camera Intensity
      if (patch.cameraIntensity && targetScene.camera) {
        if (typeof targetScene.camera === 'object') {
          targetScene.camera.intensity = patch.cameraIntensity;
        }
      }

      // 3. Apply Typography Scale
      if (patch.typographyScale && targetScene.visualBeats) {
        targetScene.visualBeats.forEach((b) => {
          if (b.typography) {
            b.typography.fontScale = patch.typographyScale;
          }
        });
      }

      // 4. Apply Occupancy Pct to Visual Beats
      if (patch.occupancyPct && targetScene.visualBeats) {
        targetScene.visualBeats.forEach((b) => {
          if (b.composition) {
            b.composition.occupancyPct = patch.occupancyPct;
          }
        });
      }
    }

    const validation = validateVideoSpec(updatedSpec);
    return validation.repairedSpec || updatedSpec;
  }

  /**
   * Executes closed-loop review and automated repair against keyframes
   */
  public async executeRepairLoop(
    initialSpec: VideoSpec,
    framePaths: string[],
    options: AutoRepairOptions = {}
  ): Promise<AutoRepairResult> {
    const maxIterations = options.maxIterations || 3;
    const targetScore = options.targetScore || 8.5;

    let currentSpec: VideoSpec = JSON.parse(JSON.stringify(initialSpec));
    const auditTrail: AutoRepairResult['auditTrail'] = [];

    let passed = false;
    let finalScore = 0;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      // Run Visual Critic on frames
      const report = await this.critic.critiqueFrames(framePaths);
      finalScore = report.overallScore;

      const criticalOrWarningIssues = report.issues.filter(
        (i) => i.severity === 'critical' || i.severity === 'warning'
      );

      const hasPatches = report.issues.some((i) => i.correctionPatch);

      auditTrail.push({
        iteration,
        score: report.overallScore,
        issuesCount: report.issues.length,
        appliedPatches: hasPatches ? report.issues.filter(i => i.correctionPatch).length : 0,
        report,
      });

      if (report.overallScore >= targetScore && criticalOrWarningIssues.length === 0) {
        passed = true;
        break;
      }

      if (!hasPatches) {
        // No actionable machine patches returned, stop repair loop
        break;
      }

      // Apply patches and iterate
      currentSpec = this.applyCorrectionPatches(currentSpec, report.issues);
    }

    return {
      finalSpec: currentSpec,
      iterations: iteration,
      passed,
      finalScore,
      auditTrail,
    };
  }
}

export const autoRepairController = new AutoRepairController();
