import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { getBooleanEnv, getEnvOrDefault } from '../../config/env';
import {
  containsFinancialLanguage,
  getChatFinancialModerationMessage,
} from './chat-financial-moderation';
import {
  anonymizeChatModerationText,
  OpenAiChatModerationService,
} from './openai-chat-moderation.service';

export type ChatModerationReason = 'financeiro' | 'ofensa_grave' | 'degraded_allow';

export interface ChatModerationDecision {
  outcome: 'allow' | 'block';
  source: 'local' | 'openai';
  reason?: ChatModerationReason;
  message?: string;
  redactedBody: string;
  fingerprint: string;
}

export function getChatRespectModerationMessage() {
  return 'Este chat não permite linguagem ofensiva ou desrespeitosa. Reformule a mensagem com respeito para continuar.';
}

@Injectable()
export class ChatModerationService {
  private readonly openAiModerationService: OpenAiChatModerationService;

  constructor(
    @Inject(OpenAiChatModerationService) openAiModerationService: OpenAiChatModerationService,
  ) {
    this.openAiModerationService = openAiModerationService;
  }

  async moderateMessage(body: string): Promise<ChatModerationDecision> {
    const fingerprint = createHash('sha256').update(body).digest('hex');
    const redactedBody = anonymizeChatModerationText(body);

    if (containsFinancialLanguage(body)) {
      return {
        outcome: 'block',
        source: 'local',
        reason: 'financeiro',
        message: getChatFinancialModerationMessage(),
        redactedBody,
        fingerprint,
      };
    }

    if (!getBooleanEnv('CHAT_MODERATION_ENABLED', true)) {
      return {
        outcome: 'allow',
        source: 'local',
        redactedBody,
        fingerprint,
      };
    }

    if (getEnvOrDefault('CHAT_MODERATION_PROVIDER', 'openai').trim().toLowerCase() !== 'openai') {
      return {
        outcome: 'allow',
        source: 'local',
        redactedBody,
        fingerprint,
      };
    }

    const providerDecision = await this.openAiModerationService.moderateText(body);
    if (providerDecision.outcome === 'block') {
      return {
        outcome: 'block',
        source: 'openai',
        reason: 'ofensa_grave',
        message: getChatRespectModerationMessage(),
        redactedBody: providerDecision.redactedBody,
        fingerprint,
      };
    }

    if (providerDecision.outcome === 'degraded_allow') {
      return {
        outcome: 'allow',
        source: 'openai',
        reason: 'degraded_allow',
        redactedBody: providerDecision.redactedBody,
        fingerprint,
      };
    }

    return {
      outcome: 'allow',
      source: 'openai',
      redactedBody: providerDecision.redactedBody,
      fingerprint,
    };
  }
}
