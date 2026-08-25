import { AIFactory, ClaudeProvider, GeminiProvider, OpenAIProvider } from './ai';
import { OpenAIAudioProvider } from './audio/openai/OpenAIAudioProvider';
import { N8nProvider } from './automation/n8n/N8nProvider';
import { ResendEmailProvider } from './email/resend/ResendEmailProvider';
import { HeyGenProvider } from './presenter/heygen/HeyGenProvider';
import { ApifyProvider } from './research/apify/ApifyProvider';
import { FirecrawlProvider } from './research/firecrawl/FirecrawlProvider';
import { VapiProvider } from './voice/vapi/VapiProvider';

export * from './ai';
export * from './research/types';
export * from './audio/types';
export * from './presenter/types';
export * from './voice/types';
export * from './automation/types';
export * from './email/types';

export class ProviderRegistry {
  public static readonly ai = {
    claude: new ClaudeProvider(),
    gemini: new GeminiProvider(),
    openai: new OpenAIProvider(),
  };

  public static readonly research = {
    firecrawl: new FirecrawlProvider(),
    apify: new ApifyProvider(),
  };

  public static readonly audio = {
    openai: new OpenAIAudioProvider(),
  };

  public static readonly presenter = {
    heygen: new HeyGenProvider(),
  };

  public static readonly voice = {
    vapi: new VapiProvider(),
  };

  public static readonly automation = {
    n8n: new N8nProvider(),
  };

  public static readonly email = {
    resend: new ResendEmailProvider(),
  };

  public static async runAllHealthChecks() {
    const checks = await Promise.all([
      this.ai.claude.healthCheck(),
      this.ai.gemini.healthCheck(),
      this.ai.openai.healthCheck(),
      this.research.firecrawl.healthCheck(),
      this.research.apify.healthCheck(),
      this.audio.openai.healthCheck(),
      this.presenter.heygen.healthCheck(),
      this.voice.vapi.healthCheck(),
      this.automation.n8n.healthCheck(),
      this.email.resend.healthCheck(),
    ]);

    return checks;
  }
}
