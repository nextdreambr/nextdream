import { describe, expect, it } from 'vitest';
import { getSandboxFinancialModerationMessage } from '../src/sandbox/sandbox-financial-moderation';

describe('sandbox financial moderation localization', () => {
  it('returns localized sandbox moderation copy', () => {
    expect(getSandboxFinancialModerationMessage('en-US')).toBe(
      'In the sandbox, messages about PIX, money, or donations are blocked. Rephrase by offering time, presence, or companionship.',
    );
    expect(getSandboxFinancialModerationMessage('es-ES')).toContain('tiempo, presencia o compania');
  });
});
