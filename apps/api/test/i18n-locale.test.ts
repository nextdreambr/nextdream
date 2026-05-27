import { describe, expect, it } from 'vitest';
import {
  DEFAULT_API_LOCALE,
  resolveApiLocale,
  resolveApiLocaleFromHeader,
  supportedApiLocales,
} from '../src/i18n/locale';

describe('API locale resolution', () => {
  it('resolves supported locales from explicit headers', () => {
    expect(resolveApiLocale({ 'x-nextdream-locale': 'en-US' })).toBe('en-US');
    expect(resolveApiLocale({ 'x-nextdream-locale': 'es-ES' })).toBe('es-ES');
  });

  it('falls back to Accept-Language when the explicit header is absent', () => {
    expect(resolveApiLocale({ 'accept-language': 'es-ES,es;q=0.9,en;q=0.7' })).toBe('es-ES');
    expect(resolveApiLocale({ 'accept-language': 'en;q=0.9,pt-BR;q=0.7' })).toBe('en-US');
  });

  it('uses pt-BR for unsupported locales', () => {
    expect(resolveApiLocale({ 'x-nextdream-locale': 'fr-FR' })).toBe(DEFAULT_API_LOCALE);
    expect(resolveApiLocaleFromHeader('de-DE,de;q=0.9')).toBe(DEFAULT_API_LOCALE);
    expect(supportedApiLocales).toEqual(['pt-BR', 'en-US', 'es-ES']);
  });
});
