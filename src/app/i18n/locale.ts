export const supportedLocales = ['pt-BR', 'en-US', 'es-ES'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

const localePrefixes: Record<SupportedLocale, string> = {
  'pt-BR': '/pt-br',
  'en-US': '/en-us',
  'es-ES': '/es-es',
};

const normalizedLocaleAliases: Record<string, SupportedLocale> = {
  pt: 'pt-BR',
  'pt-br': 'pt-BR',
  en: 'en-US',
  'en-us': 'en-US',
  es: 'es-ES',
  'es-es': 'es-ES',
};

export type ResolvedPathLocale = {
  locale: SupportedLocale;
  hasLocalePrefix: boolean;
  pathWithoutLocale: string;
};

function normalizeLocaleCandidate(value: string): SupportedLocale | null {
  return normalizedLocaleAliases[value.trim().toLowerCase()] ?? null;
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}

export function getLocalePrefix(locale: SupportedLocale): string {
  return localePrefixes[locale];
}

export function getLocaleFromPrefix(prefix: string): SupportedLocale | null {
  const normalized = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return supportedLocales.find((locale) => localePrefixes[locale] === normalized.toLowerCase()) ?? null;
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const withoutTrailingSlash = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return withoutTrailingSlash.startsWith('/') ? withoutTrailingSlash : `/${withoutTrailingSlash}`;
}

export function resolveLocaleFromPath(pathname: string): ResolvedPathLocale {
  const normalizedPath = normalizePathname(pathname);
  const firstSegment = normalizedPath.split('/')[1] ?? '';
  const locale = getLocaleFromPrefix(firstSegment);

  if (!locale) {
    return {
      locale: DEFAULT_LOCALE,
      hasLocalePrefix: false,
      pathWithoutLocale: normalizedPath,
    };
  }

  const prefix = getLocalePrefix(locale);
  const pathWithoutLocale = normalizePathname(normalizedPath.slice(prefix.length) || '/');

  return {
    locale,
    hasLocalePrefix: true,
    pathWithoutLocale,
  };
}

export function resolveLocaleFromHeader(headerValue: string | null | undefined): SupportedLocale {
  if (!headerValue) return DEFAULT_LOCALE;

  const preferences = headerValue
    .split(',')
    .map((entry) => {
      const [language, quality] = entry.trim().split(';q=');
      return {
        locale: normalizeLocaleCandidate(language ?? ''),
        quality: quality ? Number(quality) : 1,
      };
    })
    .filter((entry): entry is { locale: SupportedLocale; quality: number } => Boolean(entry.locale))
    .sort((a, b) => b.quality - a.quality);

  return preferences[0]?.locale ?? DEFAULT_LOCALE;
}

export function getCurrentBrowserLocale(): SupportedLocale {
  if (typeof document !== 'undefined') {
    const documentLocale = normalizeLocaleCandidate(document.documentElement.lang);
    if (documentLocale) return documentLocale;
  }

  if (typeof window !== 'undefined') {
    const storedLocale = normalizeLocaleCandidate(window.localStorage.getItem('nextdream.locale') ?? '');
    if (storedLocale) return storedLocale;
    return resolveLocaleFromPath(window.location.pathname).locale;
  }

  return DEFAULT_LOCALE;
}
