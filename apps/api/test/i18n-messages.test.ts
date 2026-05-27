import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { getLocalizedExceptionResponse, tApi } from '../src/i18n/messages';

describe('API localized messages', () => {
  it('translates known user-facing exception messages', () => {
    const response = getLocalizedExceptionResponse(
      new BadRequestException('Demo access is only available in sandbox mode'),
      'en-US',
    );

    expect(response).toMatchObject({
      statusCode: 400,
      message: 'Demo access is only available in sandbox mode.',
      error: 'Bad Request',
    });
  });

  it('translates sandbox moderation messages', () => {
    expect(tApi('sandbox.financialModeration', 'pt-BR')).toContain('PIX');
    expect(tApi('sandbox.financialModeration', 'en-US')).toBe(
      'In the sandbox, messages about PIX, money, or donations are blocked. Rephrase by offering time, presence, or companionship.',
    );
    expect(tApi('sandbox.financialModeration', 'es-ES')).toContain('tiempo, presencia o compania');
  });
});
