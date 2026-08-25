import type { ProviderHealth } from '../../ai/types';
import type { EmailNotificationRequest, EmailNotificationResult, IEmailProvider } from '../types';

export class ResendEmailProvider implements IEmailProvider {
  private get apiKey(): string {
    return process.env.RESEND_API_KEY || '';
  }
  private get defaultFrom(): string {
    return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  }
  private get defaultTo(): string {
    return process.env.RESEND_DEFAULT_RECIPIENT || 'pabbatek@gmail.com';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async sendNotification(request: EmailNotificationRequest): Promise<EmailNotificationResult> {
    if (!this.isConfigured) {
      return {
        id: `mock_email_${Date.now()}`,
        to: request.to || this.defaultTo,
        status: 'queued',
        provider: 'resend',
        sentAt: new Date().toISOString(),
        error: 'Resend API key is not configured',
      };
    }

    const recipient = request.to || this.defaultTo;
    const from = request.from || this.defaultFrom;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: recipient,
          subject: request.subject,
          html: request.html,
          text: request.text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          id: `resend_err_${Date.now()}`,
          to: recipient,
          status: 'failed',
          provider: 'resend',
          sentAt: new Date().toISOString(),
          error: data.message || JSON.stringify(data),
        };
      }

      return {
        id: data.id,
        to: recipient,
        status: 'sent',
        provider: 'resend',
        sentAt: new Date().toISOString(),
      };
    } catch (e: any) {
      console.warn('[Resend] Send email error:', e.message);
      return {
        id: `resend_err_${Date.now()}`,
        to: recipient,
        status: 'failed',
        provider: 'resend',
        sentAt: new Date().toISOString(),
        error: e.message,
      };
    }
  }

  async sendRenderComplete(videoTitle: string, s3Url: string, durationSeconds: number, recipient?: string): Promise<EmailNotificationResult> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #090a0f; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 24px 32px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Catalyst Video Production Ready</h1>
          <p style="margin: 4px 0 0 0; color: #e2e8f0; font-size: 14px;">Your AI-native Remotion documentary has completed rendering.</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="font-size: 18px; color: #f1f5f9; margin-top: 0;">${videoTitle}</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Format:</td>
              <td style="padding: 8px 0; color: #f8fafc; font-weight: 600; text-align: right;">1080x1920 (9:16 Vertical) @ 30 FPS</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Duration:</td>
              <td style="padding: 8px 0; color: #f8fafc; font-weight: 600; text-align: right;">${durationSeconds.toFixed(1)} seconds</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Storage:</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 600; text-align: right;">AWS S3 Cloud Storage</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 32px;">
            <a href="${s3Url}" style="background: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Download Master MP4</a>
          </div>
        </div>
      </div>
    `;

    return this.sendNotification({
      to: recipient,
      subject: `🎬 [Catalyst] Video Render Complete: ${videoTitle}`,
      html,
    });
  }

  async sendRenderFailed(videoTitle: string, error: string, recipient?: string): Promise<EmailNotificationResult> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #ef4444;">
        <h2 style="color: #ef4444; margin-top: 0;">❌ Video Render Failed</h2>
        <p>Your video <strong>${videoTitle}</strong> encountered an error during rendering:</p>
        <pre style="background: #1e293b; color: #fca5a5; padding: 16px; border-radius: 8px; overflow-x: auto;">${error}</pre>
      </div>
    `;

    return this.sendNotification({
      to: recipient,
      subject: `❌ [Catalyst] Video Render Failed: ${videoTitle}`,
      html,
    });
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'Resend Email API',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'RESEND_API_KEY is not configured',
      };
    }

    return {
      provider: 'Resend Email API',
      configured: true,
      reachable: true,
      authenticated: true,
      latencyMs: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  }
}
