import { describe, expect, it } from 'vitest';
import { containsFinancialLanguage } from './sandbox-financial-moderation';

describe('sandbox financial moderation', () => {
  it('blocks normalized financial variants', () => {
    expect(containsFinancialLanguage('Posso organizar doações com o grupo.')).toBe(true);
    expect(containsFinancialLanguage('Consigo ajudar com transferências entre contas.')).toBe(true);
    expect(containsFinancialLanguage('Levo R$ 20 em mãos.')).toBe(true);
  });

  it('does not block unrelated substrings', () => {
    expect(containsFinancialLanguage('Sou capixaba e posso oferecer companhia.')).toBe(false);
    expect(containsFinancialLanguage('Posso estar presente e ouvir com calma.')).toBe(false);
  });
});
