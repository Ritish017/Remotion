import { z } from 'zod';
import { getAnthropicClient, getDefaultModel } from '../client';
import { modelRouter, ModelTask } from '../modelRouter';
import { repairJsonString } from '@/lib/providers/ai/claude/ClaudeProvider';

export interface StructuredOutputOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  task?: ModelTask;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  agentName: string;
  fallbackGenerator?: () => T;
}

export async function generateStructuredOutput<T>(
  options: StructuredOutputOptions<T>
): Promise<T> {
  const {
    systemPrompt,
    userPrompt,
    schema,
    task = 'editorial_planning',
    model = options.model || modelRouter.resolveModel(options.task || 'editorial_planning'),
    maxTokens = 4000,
    agentName,
    fallbackGenerator,
  } = options;

  const allowDemoFallback = process.env.ALLOW_DEMO_FALLBACK === 'true';

  let rawText = '';
  try {
    const client = getAnthropicClient();

    // 1. Initial Claude API generation (Omit temperature for multi-model compatibility)
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: `${systemPrompt}\n\nCRITICAL: Output ONLY valid, parseable JSON matching the requested schema. Do not enclose in markdown explanation or commentary.`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseAndValidate(rawText, schema);
    if (parsed.success) {
      return parsed.data;
    }

    // 2. Strict Correction Retry Loop
    console.warn(`⚠️ [${agentName}] Initial schema validation failed. Retrying with correction prompt...`);
    const correctionPrompt = `Your previous JSON output failed validation with the following errors:\n${parsed.errors.join('\n')}\n\nHere was your output:\n${rawText}\n\nPlease output the corrected JSON ONLY.`;

    const retryResponse = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: `${systemPrompt}\n\nCRITICAL CORRECTION: Fix schema violations and output raw valid JSON ONLY.`,
      messages: [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: rawText },
        { role: 'user', content: correctionPrompt },
      ],
    });

    const retryText = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
    const retryParsed = parseAndValidate(retryText, schema);
    if (retryParsed.success) {
      return retryParsed.data;
    }

    throw new Error(`Schema validation failed after retry: ${retryParsed.errors.join(', ')}`);
  } catch (err: any) {
    if (fallbackGenerator) {
      console.warn(`⚠️ [${agentName}] Claude API failed (${err.message}). Using deterministic fallback.`);
      return fallbackGenerator();
    }

    console.error(`❌ [${agentName}] Fatal structured output failure: ${err.message}`);
    throw new Error(`[${agentName}] Failed to generate validated structured output: ${err.message}`);
  }
}

function parseAndValidate<T>(rawText: string, schema: z.ZodType<T>): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const cleaned = cleanJsonFences(rawText);
    const repaired = repairJsonString(cleaned);
    const parsedJson = JSON.parse(repaired);
    const result = schema.safeParse(parsedJson);

    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors = result.error.issues.map(
      (iss) => `Field "${iss.path.join('.')}" — ${iss.message}`
    );
    return { success: false, errors };
  } catch (parseError: any) {
    return { success: false, errors: [`JSON Parse Error: ${parseError.message}`] };
  }
}

function cleanJsonFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}
