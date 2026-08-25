import { ClaudeProvider } from './claude/ClaudeProvider';
import { GeminiProvider } from './gemini/GeminiProvider';
import { OpenAIProvider } from './openai/OpenAIProvider';
import type { AIProviderId, IAIProvider } from './types';

export * from './types';
export { ClaudeProvider } from './claude/ClaudeProvider';
export { GeminiProvider } from './gemini/GeminiProvider';
export { OpenAIProvider } from './openai/OpenAIProvider';

export class AIFactory {
  private static instances: Map<AIProviderId, IAIProvider> = new Map();

  public static getProvider(id: AIProviderId = 'claude'): IAIProvider {
    if (!this.instances.has(id)) {
      switch (id) {
        case 'claude':
          this.instances.set('claude', new ClaudeProvider());
          break;
        case 'gemini':
          this.instances.set('gemini', new GeminiProvider());
          break;
        case 'openai':
          this.instances.set('openai', new OpenAIProvider());
          break;
        default:
          throw new Error(`Unknown AI provider id: ${id}`);
      }
    }
    return this.instances.get(id)!;
  }

  public static getPrimary(): IAIProvider {
    return this.getProvider('claude');
  }

  public static getMultimodal(): IAIProvider {
    const gemini = this.getProvider('gemini');
    if (gemini.isConfigured) return gemini;
    return this.getProvider('claude');
  }
}
