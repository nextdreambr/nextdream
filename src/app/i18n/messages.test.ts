import { describe, expect, it } from 'vitest';
import { dictionaries, translate } from './messages';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, nested]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (!nested || typeof nested !== 'object') return [nextPrefix];
    return flattenKeys(nested, nextPrefix);
  });
}

describe('i18n dictionaries', () => {
  it('keeps the same keys in every supported locale', () => {
    const ptKeys = flattenKeys(dictionaries['pt-BR']).sort();

    expect(flattenKeys(dictionaries['en-US']).sort()).toEqual(ptKeys);
    expect(flattenKeys(dictionaries['es-ES']).sort()).toEqual(ptKeys);
  });

  it('interpolates language names in translated labels', () => {
    expect(
      translate('en-US', 'dreamLanguageAssist.originallyWrittenIn', {
        language: 'Portuguese',
      }),
    ).toBe('Originally written in Portuguese');
    expect(
      translate('pt-BR', 'dreamLanguageAssist.translateTo', {
        language: 'inglês',
      }),
    ).toBe('Traduzir para inglês');
  });
});
