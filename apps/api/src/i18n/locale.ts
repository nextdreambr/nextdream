export const supportedApiLocales = ['pt-BR', 'en-US', 'es-ES'] as const;
export type ApiLocale = (typeof supportedApiLocales)[number];

export const DEFAULT_API_LOCALE: ApiLocale = 'pt-BR';

const localeAliases: Record<string, ApiLocale> = {
  pt: 'pt-BR',
  'pt-br': 'pt-BR',
  en: 'en-US',
  'en-us': 'en-US',
  es: 'es-ES',
  'es-es': 'es-ES',
};

type HeaderValue = string | string[] | undefined;

function normalizeLocale(value: string): ApiLocale | null {
  return localeAliases[value.trim().toLowerCase()] ?? null;
}

export function resolveApiLocaleFromHeader(headerValue: HeaderValue): ApiLocale {
  const rawHeader = Array.isArray(headerValue) ? headerValue.join(',') : headerValue;
  if (!rawHeader) return DEFAULT_API_LOCALE;

  const preferences = rawHeader
    .split(',')
    .map((entry) => {
      const [language, quality] = entry.trim().split(';q=');
      return {
        locale: normalizeLocale(language ?? ''),
        quality: quality ? Number(quality) : 1,
      };
    })
    .filter((entry): entry is { locale: ApiLocale; quality: number } => Boolean(entry.locale))
    .sort((a, b) => b.quality - a.quality);

  return preferences[0]?.locale ?? DEFAULT_API_LOCALE;
}

export function resolveApiLocale(headers: Record<string, HeaderValue>): ApiLocale {
  const explicitHeader = headers['x-nextdream-locale'] ?? headers['X-NextDream-Locale'];
  const explicitLocale = Array.isArray(explicitHeader)
    ? normalizeLocale(explicitHeader[0] ?? '')
    : explicitHeader
      ? normalizeLocale(explicitHeader)
      : null;

  if (explicitLocale) return explicitLocale;
  return resolveApiLocaleFromHeader(headers['accept-language'] ?? headers['Accept-Language']);
}
