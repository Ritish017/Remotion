import { AIFactory } from '../providers/ai';
import { ProviderRegistry } from '../providers';

export type TaskType =
  | 'CREATIVE_WRITING'
  | 'STORYBOARD'
  | 'VIDEO_SPEC'
  | 'VISUAL_ANALYSIS'
  | 'IMAGE_ANALYSIS'
  | 'RESEARCH_EXTRACTION'
  | 'STRUCTURED_WEB_RESEARCH'
  | 'VOICEOVER'
  | 'TRANSCRIPTION'
  | 'PRESENTER_VIDEO'
  | 'VOICE_CONTROL'
  | 'AUTOMATION'
  | 'EMAIL'
  | 'VIDEO_RENDER';

export interface TaskRouteDecision {
  task: TaskType;
  provider: string;
  isAvailable: boolean;
  fallbackProvider?: string;
  notes: string;
}

export class TaskRouter {
  public static route(task: TaskType): TaskRouteDecision {
    switch (task) {
      case 'CREATIVE_WRITING':
      case 'STORYBOARD':
      case 'VIDEO_SPEC':
        return {
          task,
          provider: 'Anthropic Claude (Primary Creative AI)',
          isAvailable: ProviderRegistry.ai.claude.isConfigured,
          fallbackProvider: 'Google Gemini',
          notes: 'Claude handles scriptwriting, editorial timing, and Zod VideoSpec generation.',
        };

      case 'VISUAL_ANALYSIS':
      case 'IMAGE_ANALYSIS':
        return {
          task,
          provider: 'Google Gemini (Multimodal Intelligence)',
          isAvailable: ProviderRegistry.ai.gemini.isConfigured,
          fallbackProvider: 'Anthropic Claude',
          notes: 'Gemini analyzes visual screenshots, reference moodboards, and graphic assets.',
        };

      case 'RESEARCH_EXTRACTION':
        return {
          task,
          provider: 'Firecrawl',
          isAvailable: ProviderRegistry.research.firecrawl.isConfigured,
          notes: 'Firecrawl cleans and scrapes web articles into markdown evidence.',
        };

      case 'STRUCTURED_WEB_RESEARCH':
        return {
          task,
          provider: 'Apify',
          isAvailable: ProviderRegistry.research.apify.isConfigured,
          notes: 'Apify runs allowlisted scrapers for trend and dataset collection.',
        };

      case 'VOICEOVER':
        return {
          task,
          provider: 'OpenAI TTS (tts-1 / Onyx)',
          isAvailable: ProviderRegistry.audio.openai.isConfigured,
          notes: 'OpenAI TTS provides production editorial narration audio.',
        };

      case 'TRANSCRIPTION':
        return {
          task,
          provider: 'OpenAI Whisper (whisper-1)',
          isAvailable: ProviderRegistry.audio.openai.isConfigured,
          notes: 'Whisper extracts frame-accurate word start/end timestamps from generated audio.',
        };

      case 'PRESENTER_VIDEO':
        return {
          task,
          provider: 'HeyGen (Optional Presenter Mode)',
          isAvailable: ProviderRegistry.presenter.heygen.isConfigured,
          notes: 'HeyGen creates avatar talking-head videos when presenter mode is active.',
        };

      case 'VOICE_CONTROL':
        return {
          task,
          provider: 'Vapi Voice AI',
          isAvailable: ProviderRegistry.voice.vapi.isConfigured,
          notes: 'Vapi routes conversational voice commands to the Catalyst agent.',
        };

      case 'AUTOMATION':
        return {
          task,
          provider: 'n8n Workflow Engine',
          isAvailable: ProviderRegistry.automation.n8n.isConfigured,
          notes: 'n8n executes post-production distribution and publishing webhooks.',
        };

      case 'EMAIL':
        return {
          task,
          provider: 'Resend',
          isAvailable: ProviderRegistry.email.resend.isConfigured,
          notes: 'Resend delivers render status alerts and daily reports.',
        };

      case 'VIDEO_RENDER':
        return {
          task,
          provider: 'Remotion Local Renderer (@remotion/renderer) / Local Storage',
          isAvailable: true,
          notes: 'High-performance local rendering engine on GPU/CPU with disk storage and SQLite job tracking.',
        };

      default:
        throw new Error(`Unsupported TaskType: ${task}`);
    }
  }

  public static getRoutingManifest(): Record<TaskType, TaskRouteDecision> {
    const tasks: TaskType[] = [
      'CREATIVE_WRITING',
      'STORYBOARD',
      'VIDEO_SPEC',
      'VISUAL_ANALYSIS',
      'IMAGE_ANALYSIS',
      'RESEARCH_EXTRACTION',
      'STRUCTURED_WEB_RESEARCH',
      'VOICEOVER',
      'TRANSCRIPTION',
      'PRESENTER_VIDEO',
      'VOICE_CONTROL',
      'AUTOMATION',
      'EMAIL',
      'VIDEO_RENDER',
    ];

    const manifest: any = {};
    for (const t of tasks) {
      manifest[t] = this.route(t);
    }
    return manifest;
  }
}
