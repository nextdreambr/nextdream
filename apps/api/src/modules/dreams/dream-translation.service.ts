import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { getEnvOrDefault } from '../../config/env';
import { DreamLanguage } from './dream-language';

interface OpenAiResponsesPayload {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  model?: string;
}

export interface TranslateDreamInput {
  title: string;
  description: string;
  sourceLanguage: DreamLanguage;
  targetLanguage: DreamLanguage;
}

export interface GeneratedDreamTranslation {
  title: string;
  description: string;
  model?: string;
}

const RESPONSES_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_TIMEOUT_MS = 3000;

function getTimeoutMs() {
  const raw = Number(process.env.OPENAI_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
}

function extractOutputText(payload: OpenAiResponsesPayload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim().length > 0) {
    return payload.output_text;
  }

  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string' && content.text.trim().length > 0) {
        return content.text;
      }
    }
  }

  return null;
}

function parseTranslationPayload(raw: string, model?: string): GeneratedDreamTranslation | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GeneratedDreamTranslation>;
    if (typeof parsed.title !== 'string' || typeof parsed.description !== 'string') {
      return null;
    }

    return {
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      model,
    };
  } catch {
    return null;
  }
}

@Injectable()
export class DreamTranslationService {
  private readonly logger = new Logger(DreamTranslationService.name);

  async translateDream(input: TranslateDreamInput): Promise<GeneratedDreamTranslation> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException('Translation is temporarily unavailable.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getTimeoutMs());

    try {
      const response = await fetch(RESPONSES_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: getEnvOrDefault('OPENAI_TRANSLATION_MODEL', 'gpt-5-mini'),
          input: [
            {
              role: 'system',
              content: [
                {
                  type: 'input_text',
                  text: [
                    'You translate NextDream dream stories for optional reader assistance.',
                    'Translate only the title and description.',
                    'preserve the original human tone, warmth, dignity, and directness.',
                    'Do not add facts, explanations, warnings, promises, or medical interpretation.',
                    'Do not soften, dramatize, summarize, or make the story more persuasive.',
                    'Return only JSON that matches the requested schema.',
                  ].join(' '),
                },
              ],
            },
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: JSON.stringify({
                    sourceLanguage: input.sourceLanguage,
                    targetLanguage: input.targetLanguage,
                    title: input.title,
                    description: input.description,
                  }),
                },
              ],
            },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'dream_translation',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  title: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                },
                required: ['title', 'description'],
              },
            },
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(`OpenAI translation request failed with status ${response.status}.`);
        throw new ServiceUnavailableException('Translation is temporarily unavailable.');
      }

      const payload = (await response.json()) as OpenAiResponsesPayload;
      const outputText = extractOutputText(payload);
      const translation = outputText ? parseTranslationPayload(outputText, payload.model) : null;
      if (!translation?.title || !translation.description) {
        this.logger.warn('OpenAI translation returned an unexpected payload.');
        throw new ServiceUnavailableException('Translation is temporarily unavailable.');
      }

      return translation;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown OpenAI translation failure';
      this.logger.warn(`OpenAI translation degraded: ${message}`);
      throw new ServiceUnavailableException('Translation is temporarily unavailable.');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
