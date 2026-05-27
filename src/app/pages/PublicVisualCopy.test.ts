import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(currentDir, '..');

const publicVisualFiles = [
  'components/home/HomeHero.tsx',
  'components/layout/PublicLayout.tsx',
  'components/public/PublicPagePrimitives.tsx',
  'data/heroVariants.ts',
  'pages/Landing.tsx',
  'pages/HowItWorks.tsx',
  'pages/Security.tsx',
  'pages/FAQ.tsx',
  'pages/Contact.tsx',
  'pages/Partnerships.tsx',
];

const blockedPublicTerms = [
  /\bpix\b/i,
  /vaquinha/i,
  /arrecada[cç][aã]o/i,
  /campanha financeira/i,
  /\bdinheiro\b/i,
  /pagamento/i,
  /financeir/i,
];

const allowedNonFinancialContext = [
  /não é sobre dinheiro/i,
  /apoio sem dinheiro envolvido/i,
  /apoio não acontece por doação em dinheiro/i,
  /não acontece por doação em dinheiro/i,
];

function hasAllowedNonFinancialContext(line: string) {
  return allowedNonFinancialContext.some((pattern) => pattern.test(line));
}

describe('public visual copy', () => {
  it('keeps financial terms restricted to approved negative context', () => {
    for (const relativePath of publicVisualFiles) {
      const source = readFileSync(resolve(appDir, relativePath), 'utf8');
      const lines = source.split('\n');

      for (const term of blockedPublicTerms) {
        const invalidLine = lines.find((line) => term.test(line) && !hasAllowedNonFinancialContext(line));

        expect(
          invalidLine,
          `${relativePath} should only include ${term} inside approved non-financial copy`,
        ).toBeUndefined();
      }
    }
  });
});
