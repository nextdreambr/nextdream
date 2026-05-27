import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DreamTranslationService } from '../src/modules/dreams/dream-translation.service';

describe('DreamTranslationService', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_TRANSLATION_MODEL;
  const originalTimeout = process.env.OPENAI_TIMEOUT_MS;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_TRANSLATION_MODEL = 'gpt-5-mini';
    process.env.OPENAI_TIMEOUT_MS = '3000';
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }

    if (originalModel === undefined) {
      delete process.env.OPENAI_TRANSLATION_MODEL;
    } else {
      process.env.OPENAI_TRANSLATION_MODEL = originalModel;
    }

    if (originalTimeout === undefined) {
      delete process.env.OPENAI_TIMEOUT_MS;
    } else {
      process.env.OPENAI_TIMEOUT_MS = originalTimeout;
    }
  });

  it('calls the OpenAI Responses API with structured JSON output instructions', async () => {
    const service = new DreamTranslationService();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'resp-translation-1',
          output: [
            {
              content: [
                {
                  type: 'output_text',
                  text: JSON.stringify({
                    title: 'See the sea once more',
                    description: 'I want a quiet afternoon to feel the breeze.',
                  }),
                },
              ],
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

    await expect(
      service.translateDream({
        title: 'Ver o mar outra vez',
        description: 'Quero uma tarde tranquila para sentir a brisa.',
        sourceLanguage: 'pt-BR',
        targetLanguage: 'en-US',
      }),
    ).resolves.toEqual({
      title: 'See the sea once more',
      description: 'I want a quiet afternoon to feel the breeze.',
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, requestInit] = fetchSpy.mock.calls[0] ?? [];
    const payload = JSON.parse(String((requestInit as RequestInit | undefined)?.body));
    expect(url).toBe('https://api.openai.com/v1/responses');
    expect(payload.model).toBe('gpt-5-mini');
    expect(payload.text.format).toMatchObject({
      type: 'json_schema',
      name: 'dream_translation',
      strict: true,
    });
    expect(JSON.stringify(payload)).toContain('preserve the original human tone');
    expect(JSON.stringify(payload)).toContain('Do not add facts');
  });

  it('returns a controlled service error when OpenAI is not configured', async () => {
    delete process.env.OPENAI_API_KEY;
    const service = new DreamTranslationService();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(
      service.translateDream({
        title: 'Ver o mar outra vez',
        description: 'Quero uma tarde tranquila.',
        sourceLanguage: 'pt-BR',
        targetLanguage: 'en-US',
      }),
    ).rejects.toMatchObject({
      status: 503,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns a controlled service error when the Responses API payload is invalid', async () => {
    const service = new DreamTranslationService();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ output: [] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(
      service.translateDream({
        title: 'Ver o mar outra vez',
        description: 'Quero uma tarde tranquila.',
        sourceLanguage: 'pt-BR',
        targetLanguage: 'en-US',
      }),
    ).rejects.toMatchObject({
      status: 503,
    });
  });
});
