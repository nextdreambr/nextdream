import { describe, expect, it } from 'vitest';
import { containsFinancialLanguage } from '../src/modules/conversations/chat-financial-moderation';

describe('chat financial moderation', () => {
  it('detects currency values with and without spaces after R$', () => {
    expect(containsFinancialLanguage('Posso mandar R$40 para ajudar.')).toBe(true);
    expect(containsFinancialLanguage('Posso mandar r$ 40 para ajudar.')).toBe(true);
    expect(containsFinancialLanguage('Posso ajudar com companhia no sábado.')).toBe(false);
  });
});
