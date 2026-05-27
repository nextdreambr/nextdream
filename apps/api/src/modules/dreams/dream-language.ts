export const SUPPORTED_DREAM_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'] as const;

export type DreamLanguage = (typeof SUPPORTED_DREAM_LANGUAGES)[number];

export type DreamTranslationSource = 'machine' | 'human';

export interface DreamTranslation {
  title: string;
  description: string;
  source: DreamTranslationSource;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  model?: string;
}

export type DreamTranslations = Partial<Record<DreamLanguage, DreamTranslation>>;

export const DEFAULT_DREAM_LANGUAGE: DreamLanguage = 'pt-BR';

export function isDreamLanguage(value: unknown): value is DreamLanguage {
  return typeof value === 'string' && SUPPORTED_DREAM_LANGUAGES.includes(value as DreamLanguage);
}

export function normalizeDreamLanguage(value: unknown): DreamLanguage {
  return isDreamLanguage(value) ? value : DEFAULT_DREAM_LANGUAGE;
}

export function normalizeDreamTranslations(value: unknown): DreamTranslations {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return SUPPORTED_DREAM_LANGUAGES.reduce<DreamTranslations>((translations, language) => {
    const candidate = (value as Record<string, unknown>)[language];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return translations;
    }

    const translation = candidate as Partial<DreamTranslation>;
    if (typeof translation.title === 'string' && typeof translation.description === 'string') {
      translations[language] = {
        title: translation.title,
        description: translation.description,
        source: translation.source === 'human' ? 'human' : 'machine',
        createdAt: typeof translation.createdAt === 'string' ? translation.createdAt : new Date().toISOString(),
        updatedAt: typeof translation.updatedAt === 'string' ? translation.updatedAt : new Date().toISOString(),
        reviewedAt: typeof translation.reviewedAt === 'string' ? translation.reviewedAt : null,
        model: typeof translation.model === 'string' ? translation.model : undefined,
      };
    }

    return translations;
  }, {});
}
