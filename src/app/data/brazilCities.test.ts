import { describe, expect, it } from 'vitest';
import * as brazilCitiesModule from './brazilCities';
import { BRAZIL_STATES } from './brazilCities';
import { getBrazilState, getCitiesForState } from '../lib/location';

const brazilCities = brazilCitiesModule as typeof brazilCitiesModule & {
  BRAZIL_CITIES_SOURCE?: string;
  BRAZIL_CITIES_SOURCE_URL?: string;
  BRAZIL_CITIES_TOTAL?: number;
  BRAZIL_CITIES_REFERENCE_DATE?: string;
};

const collator = new Intl.Collator('pt-BR');

describe('brazilCities', () => {
  it('exposes the complete IBGE-backed dataset metadata', () => {
    const totalCities = BRAZIL_STATES.reduce((total, state) => total + state.cities.length, 0);

    expect(BRAZIL_STATES).toHaveLength(27);
    expect(new Set(BRAZIL_STATES.map((state) => state.uf)).size).toBe(27);
    expect(brazilCities.BRAZIL_CITIES_SOURCE).toBe('IBGE');
    expect(brazilCities.BRAZIL_CITIES_SOURCE_URL).toContain('servicodados.ibge.gov.br/api/v1/localidades');
    expect(brazilCities.BRAZIL_CITIES_TOTAL).toBe(totalCities);
    expect(brazilCities.BRAZIL_CITIES_TOTAL).toBeGreaterThanOrEqual(5570);
    expect(brazilCities.BRAZIL_CITIES_REFERENCE_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('keeps states and cities deterministic and officially scoped', () => {
    const stateUfs = BRAZIL_STATES.map((state) => state.uf);
    const sortedStateUfs = [...stateUfs].sort((a, b) => collator.compare(a, b));

    expect(stateUfs).toEqual(sortedStateUfs);
    for (const state of BRAZIL_STATES) {
      expect(state.cities.length).toBeGreaterThan(0);
      expect(state.cities).toEqual([...state.cities].sort((a, b) => collator.compare(a, b)));
    }
    expect(getCitiesForState('DF')).toEqual(['Brasília']);
  });

  it('returns official cities from states that were incomplete before', () => {
    expect(getBrazilState('SP')?.name).toBe('São Paulo');
    expect(getCitiesForState('SP')).toContain('Adamantina');
    expect(getCitiesForState('PE')).toContain('Afogados da Ingazeira');
    expect(getCitiesForState('XX')).toEqual([]);
  });
});
