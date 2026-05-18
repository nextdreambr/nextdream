import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getSeoData } from './metadata';

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
});
