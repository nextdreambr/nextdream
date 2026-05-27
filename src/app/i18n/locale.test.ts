import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  getLocalePrefix,
  resolveLocaleFromHeader,
  resolveLocaleFromPath,
  supportedLocales,
} from './locale';

describe('frontend locale resolution', () => {
  it('resolves supported locales from localized paths', () => {
    expect(resolveLocaleFromPath('/pt-br/como-funciona')).toMatchObject({
      locale: 'pt-BR',
      hasLocalePrefix: true,
      pathWithoutLocale: '/como-funciona',
    });
    expect(resolveLocaleFromPath('/en-us/how-it-works')).toMatchObject({
      locale: 'en-US',
      hasLocalePrefix: true,
      pathWithoutLocale: '/how-it-works',
    });
    expect(resolveLocaleFromPath('/es-es/como-funciona')).toMatchObject({
      locale: 'es-ES',
      hasLocalePrefix: true,
      pathWithoutLocale: '/como-funciona',
    });
  });

  it('falls back to pt-BR for unprefixed or unknown paths', () => {
    expect(resolveLocaleFromPath('/admin')).toMatchObject({
      locale: DEFAULT_LOCALE,
      hasLocalePrefix: false,
      pathWithoutLocale: '/admin',
    });
    expect(resolveLocaleFromPath('/fr-fr/comment-ca-marche')).toMatchObject({
      locale: DEFAULT_LOCALE,
      hasLocalePrefix: false,
      pathWithoutLocale: '/fr-fr/comment-ca-marche',
    });
  });

  it('resolves locale from weighted language headers', () => {
    expect(resolveLocaleFromHeader('es-ES,es;q=0.9,en;q=0.7')).toBe('es-ES');
    expect(resolveLocaleFromHeader('en;q=0.9,pt-BR;q=0.7')).toBe('en-US');
    expect(resolveLocaleFromHeader('fr-CA,fr;q=0.9')).toBe(DEFAULT_LOCALE);
  });

  it('keeps supported locale prefixes stable', () => {
    expect(supportedLocales).toEqual(['pt-BR', 'en-US', 'es-ES']);
    expect(getLocalePrefix('pt-BR')).toBe('/pt-br');
    expect(getLocalePrefix('en-US')).toBe('/en-us');
    expect(getLocalePrefix('es-ES')).toBe('/es-es');
  });
});
