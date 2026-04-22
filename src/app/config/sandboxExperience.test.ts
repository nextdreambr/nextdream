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

  it('keeps every tour step explicit about what the user sees, does and learns', () => {
    for (const tour of Object.values(sandboxExperienceConfig.tours)) {
      for (const step of tour) {
        expect(step.see.length).toBeGreaterThan(20);
        expect(step.action.length).toBeGreaterThan(20);
        expect(step.why.length).toBeGreaterThan(20);
      }
    }
  });
});
