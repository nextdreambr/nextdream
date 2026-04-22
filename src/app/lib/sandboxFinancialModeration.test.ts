import { describe, expect, it } from 'vitest';
import { containsFinancialLanguage } from './sandboxFinancialModeration';

describe('sandboxFinancialModeration', () => {
  it('blocks normalized financial variants', () => {
    expect(containsFinancialLanguage('Posso mandar um PIX agora mesmo.')).toBe(true);
    expect(containsFinancialLanguage('Posso ajudar com doações recorrentes.')).toBe(true);
    expect(containsFinancialLanguage('Aceita transferências no fim do dia?')).toBe(true);
  });

  it('keeps harmless words outside the blocklist', () => {
    expect(containsFinancialLanguage('Sou capixaba e gosto de conversar na varanda.')).toBe(false);
    expect(containsFinancialLanguage('Posso oferecer companhia e tempo de qualidade.')).toBe(false);
  });
});
