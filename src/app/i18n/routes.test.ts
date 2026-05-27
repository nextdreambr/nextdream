import { describe, expect, it } from 'vitest';
import {
  getLocalizedPath,
  getRouteKeyFromPath,
  publicRouteSlugs,
  stripLocalePrefix,
} from './routes';

describe('localized route helpers', () => {
  it('translates public slugs in both directions', () => {
    expect(getLocalizedPath('/como-funciona', 'en-US')).toBe('/en-us/how-it-works');
    expect(getLocalizedPath('/en-us/how-it-works', 'es-ES')).toBe('/es-es/como-funciona');
    expect(getLocalizedPath('/es-es/seguridad', 'pt-BR')).toBe('/pt-br/seguranca');
    expect(getLocalizedPath('/pt-br/parcerias', 'en-US')).toBe('/en-us/partnerships');
  });

  it('preserves dynamic public dream ids across locale changes', () => {
    expect(getRouteKeyFromPath('/sonhos/dream-123')).toBe('publicDream');
    expect(getLocalizedPath('/sonhos/dream-123', 'en-US')).toBe('/en-us/dreams/dream-123');
    expect(getLocalizedPath('/en-us/dreams/dream-123', 'es-ES')).toBe('/es-es/suenos/dream-123');
  });

  it('keeps authenticated slugs stable while applying the locale prefix', () => {
    expect(getLocalizedPath('/paciente/dashboard', 'en-US')).toBe('/en-us/paciente/dashboard');
    expect(getLocalizedPath('/en-us/paciente/sonhos/abc', 'es-ES')).toBe('/es-es/paciente/sonhos/abc');
    expect(stripLocalePrefix('/es-es/instituicao/pacientes')).toBe('/instituicao/pacientes');
  });

  it('does not localize admin paths', () => {
    expect(getLocalizedPath('/admin', 'en-US')).toBe('/admin');
    expect(getLocalizedPath('/admin/usuarios', 'es-ES')).toBe('/admin/usuarios');
  });

  it('defines a slug for every public route in each supported locale', () => {
    for (const slugs of Object.values(publicRouteSlugs)) {
      expect(Object.keys(slugs).sort()).toEqual(['en-US', 'es-ES', 'pt-BR']);
    }
  });
});
