import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getSeoAlternates, getSeoData } from './metadata';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '../../..');
const publicHomeDescription =
  'NextDream conecta pessoas em momentos delicados de saude, familiares e instituicoes a apoiadores para realizar sonhos com tempo, presenca e cuidado.';

describe('SEO metadata', () => {
  it('uses the current public audience description on the home page', () => {
    expect(getSeoData('/').description).toBe(publicHomeDescription);
  });

  it('keeps the static shell metadata aligned with the current audience', () => {
    const indexHtml = readFileSync(resolve(rootDir, 'index.html'), 'utf8');

    expect(indexHtml).not.toMatch(/pacientes e idosos/i);
    expect(indexHtml).not.toMatch(/content="[^"]*idosos/i);
    expect(indexHtml.split(publicHomeDescription)).toHaveLength(4);
  });

  it('returns localized metadata and alternates for translated public routes', () => {
    const english = getSeoData('/en-us/how-it-works');

    expect(english.title).toBe('How It Works | NextDream');
    expect(english.description).toContain('publish dreams');
    expect(english.canonicalPath).toBe('/en-us/how-it-works');
    expect(english.locale).toBe('en-US');
    expect(getSeoAlternates('/en-us/how-it-works')).toEqual({
      'pt-BR': 'https://nextdream.ong.br/pt-br/como-funciona',
      'en-US': 'https://nextdream.ong.br/en-us/how-it-works',
      'es-ES': 'https://nextdream.ong.br/es-es/como-funciona',
      'x-default': 'https://nextdream.ong.br/pt-br/como-funciona',
    });
  });
});
