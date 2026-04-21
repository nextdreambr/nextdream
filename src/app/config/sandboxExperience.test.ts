import { describe, expect, it } from 'vitest';
import { sandboxExperienceConfig } from './sandboxExperience';

describe('sandboxExperienceConfig', () => {
  it('defines the guided steps for the patient journey', () => {
    expect(sandboxExperienceConfig.tours.paciente.map((step) => step.id)).toEqual([
      'dashboard',
      'criar-sonho',
      'propostas',
      'chat',
    ]);
  });

  it('defines the guided steps for the supporter journey', () => {
    expect(sandboxExperienceConfig.tours.apoiador.map((step) => step.id)).toEqual([
      'dashboard',
      'explorar',
      'propostas',
      'chat',
    ]);
  });

  it('defines the guided steps for the institution journey', () => {
    expect(sandboxExperienceConfig.tours.instituicao.map((step) => step.id)).toEqual([
      'dashboard',
      'pacientes',
      'publicar-sonho',
      'propostas',
    ]);
  });
});
