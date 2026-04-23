import { Injectable, Logger } from '@nestjs/common';
import { getEnvOrDefault } from '../../config/env';

type OpenAiModerationCategories = Record<string, boolean | undefined>;

interface OpenAiModerationResponse {
  id?: string;
  model?: string;
  results?: Array<{
    flagged?: boolean;
    categories?: OpenAiModerationCategories;
  }>;
}

export interface OpenAiChatModerationDecision {
  outcome: 'allow' | 'block' | 'degraded_allow';
  model?: string;
  redactedBody: string;
}

const MODERATION_URL = 'https://api.openai.com/v1/moderations';
const DEFAULT_TIMEOUT_MS = 3000;
const SEVERE_DISRESPECT_CATEGORIES = [
  'harassment',
  'harassment/threatening',
  'hate',
  'hate/threatening',
] as const;

function getTimeoutMs() {
  const raw = Number(process.env.OPENAI_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
}

function hasSevereDisrespect(categories: OpenAiModerationCategories | undefined) {
  if (!categories) {
    return false;
  }

  return SEVERE_DISRESPECT_CATEGORIES.some((category) => categories[category] === true);
}

export function anonymizeChatModerationText(value: string) {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, '[redacted-email]')
    .replace(/https?:\/\/\S+/giu, '[redacted-url]')
    .replace(/(^|[\s(])@[a-z0-9_]{2,}/giu, '$1[redacted-handle]')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/gu, '[redacted-cpf]')
    .replace(/\b(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9?\d{4})-?\d{4}\b/gu, '[redacted-phone]')
    .replace(/(?:^|[^\p{L}\p{N}])r\$\s*\d+(?:[.,]\d{1,2})?/giu, ' [redacted-money]')
    .replace(/\b\d+(?:[.,]\d{1,2})?\s*reais?\b/giu, '[redacted-money]')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/giu, '[redacted-pix]')
    .replace(/\s+/gu, ' ')
    .trim();
}

@Injectable()
export class OpenAiChatModerationService {
  private readonly logger = new Logger(OpenAiChatModerationService.name);

  async moderateText(body: string): Promise<OpenAiChatModerationDecision> {
    const redactedBody = anonymizeChatModerationText(body);
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return {
        outcome: 'degraded_allow',
        redactedBody,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getTimeoutMs());

    try {
      const response = await fetch(getEnvOrDefault('OPENAI_API_URL', MODERATION_URL), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: getEnvOrDefault('OPENAI_MODERATION_MODEL', 'omni-moderation-latest'),
          input: redactedBody,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(`OpenAI moderation request failed with status ${response.status}.`);
        return {
          outcome: 'degraded_allow',
          redactedBody,
        };
      }

      const payload = (await response.json()) as OpenAiModerationResponse;
      const firstResult = payload.results?.[0];
      if (hasSevereDisrespect(firstResult?.categories)) {
        return {
          outcome: 'block',
          model: payload.model,
          redactedBody,
        };
      }

      return {
        outcome: 'allow',
        model: payload.model,
        redactedBody,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown OpenAI moderation failure';
      this.logger.warn(`OpenAI moderation degraded: ${errorMessage}`);
      return {
        outcome: 'degraded_allow',
        redactedBody,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
