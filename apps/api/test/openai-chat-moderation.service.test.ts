import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  anonymizeChatModerationText,
  OpenAiChatModerationService,
} from '../src/modules/conversations/openai-chat-moderation.service';

describe('OpenAiChatModerationService', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODERATION_MODEL;
  const originalTimeout = process.env.OPENAI_TIMEOUT_MS;
  const originalApiUrl = process.env.OPENAI_API_URL;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_MODERATION_MODEL = 'omni-moderation-latest';
    process.env.OPENAI_TIMEOUT_MS = '3000';
    process.env.OPENAI_API_URL = 'https://api.openai.com/v1/moderations';
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }

    if (originalModel === undefined) {
      delete process.env.OPENAI_MODERATION_MODEL;
    } else {
      process.env.OPENAI_MODERATION_MODEL = originalModel;
    }

    if (originalTimeout === undefined) {
      delete process.env.OPENAI_TIMEOUT_MS;
    } else {
      process.env.OPENAI_TIMEOUT_MS = originalTimeout;
    }

    if (originalApiUrl === undefined) {
      delete process.env.OPENAI_API_URL;
    } else {
      process.env.OPENAI_API_URL = originalApiUrl;
    }
  });

  it('redacts personal and financial details while preserving abusive tone', async () => {
    const service = new OpenAiChatModerationService();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'modr-1',
          model: 'omni-moderation-latest',
          results: [
            {
              flagged: false,
              categories: {
                harassment: false,
                'harassment/threatening': false,
                hate: false,
                'hate/threatening': false,
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const decision = await service.moderateText(
      'Seu idiota, me chama em joao@example.com, @joao, https://nextdream.ong.br, (81) 99999-0000, CPF 123.456.789-09 e mando R$ 40 por PIX.',
    );

    expect(decision.outcome).toBe('allow');
    expect(fetchSpy).toHaveBeenCalledOnce();

    const [, requestInit] = fetchSpy.mock.calls[0] ?? [];
    const payload = JSON.parse(String((requestInit as RequestInit | undefined)?.body));
    expect(payload.input).toContain('Seu idiota');
    expect(payload.input).not.toContain('joao@example.com');
    expect(payload.input).not.toContain('@joao');
    expect(payload.input).not.toContain('https://nextdream.ong.br');
    expect(payload.input).not.toContain('99999-0000');
    expect(payload.input).not.toContain('123.456.789-09');
    expect(payload.input).not.toContain('R$ 40');
    expect(anonymizeChatModerationText('Seu idiota, me chama em joao@example.com')).toContain('Seu idiota');
  });

  it('blocks severe disrespect when OpenAI flags harassment categories', async () => {
    const service = new OpenAiChatModerationService();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'modr-2',
          model: 'omni-moderation-latest',
          results: [
            {
              flagged: true,
              categories: {
                harassment: true,
                'harassment/threatening': false,
                hate: false,
                'hate/threatening': false,
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await expect(service.moderateText('Seu idiota.')).resolves.toMatchObject({
      outcome: 'block',
    });
  });

  it('returns degraded_allow when OpenAI responds with an invalid payload', async () => {
    const service = new OpenAiChatModerationService();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'modr-invalid',
          model: 'omni-moderation-latest',
          results: [],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await expect(service.moderateText('Posso acompanhar com calma.')).resolves.toMatchObject({
      outcome: 'degraded_allow',
      model: 'omni-moderation-latest',
    });
  });

  it('returns degraded_allow when the OpenAI request fails', async () => {
    const service = new OpenAiChatModerationService();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('timeout'));

    await expect(service.moderateText('Posso acompanhar com calma.')).resolves.toMatchObject({
      outcome: 'degraded_allow',
    });
  });
});
