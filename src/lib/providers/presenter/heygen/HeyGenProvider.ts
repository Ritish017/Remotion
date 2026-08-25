import type { ProviderHealth } from '../../ai/types';
import type { IPresenterProvider, PresenterVideoRequest, PresenterVideoResult } from '../types';

export class HeyGenProvider implements IPresenterProvider {
  private get apiKey(): string {
    return process.env.HEYGEN_API_KEY || '';
  }
  private get defaultTemplateId(): string {
    return process.env.HEYGEN_TEMPLATE_ID || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generatePresenterVideo(request: PresenterVideoRequest): Promise<PresenterVideoResult> {
    if (!this.isConfigured) {
      throw new Error('HeyGen is not configured. Set HEYGEN_API_KEY in environment.');
    }

    const templateId = request.templateId || this.defaultTemplateId;
    const url = 'https://api.heygen.com/v2/video/generate';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: request.avatarId || 'default',
            },
            voice: {
              type: 'text',
              input_text: request.script,
            },
          },
        ],
        test: false,
        title: request.title || 'Catalyst Presenter Scene',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HeyGen video generate error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const videoId = data.data?.video_id || `heygen_${Date.now()}`;

    return {
      videoId,
      status: 'pending',
      provider: 'heygen',
      createdAt: new Date().toISOString(),
    };
  }

  async getPresenterVideoStatus(videoId: string): Promise<PresenterVideoResult> {
    if (!this.isConfigured) {
      throw new Error('HeyGen is not configured.');
    }

    const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HeyGen status error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const status = data.data?.status === 'completed' ? 'completed' : data.data?.status === 'failed' ? 'failed' : 'processing';

    return {
      videoId,
      videoUrl: data.data?.video_url,
      status,
      provider: 'heygen',
      durationSeconds: data.data?.duration,
      createdAt: new Date().toISOString(),
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'HeyGen Presenter API',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'HEYGEN_API_KEY is not configured',
      };
    }

    try {
      const res = await fetch('https://api.heygen.com/v2/templates', {
        headers: { 'X-Api-Key': this.apiKey },
      });
      return {
        provider: 'HeyGen Presenter API',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        provider: 'HeyGen Presenter API',
        configured: true,
        reachable: false,
        authenticated: false,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: e.message,
      };
    }
  }
}
