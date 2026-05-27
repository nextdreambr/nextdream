import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, getCurrentBrowserLocale, supportedLocales, type SupportedLocale } from './locale';
import { getLocalizedPath } from './routes';
import { translate, type TranslationKey } from './messages';

type I18nContextValue = {
  locale: SupportedLocale;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
  localizedPath: (path: string) => string;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: (key) => translate(DEFAULT_LOCALE, key),
  localizedPath: (path) => path,
  formatDate: (value, options) => new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(new Date(value)),
});

export function I18nProvider({
  locale,
  children,
}: {
  locale?: SupportedLocale;
  children: ReactNode;
}) {
  const activeLocale = locale ?? getCurrentBrowserLocale();

  useEffect(() => {
    document.documentElement.lang = activeLocale;
    window.localStorage.setItem('nextdream.locale', activeLocale);
  }, [activeLocale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale: activeLocale,
    t: (key, values) => translate(activeLocale, key, values),
    localizedPath: (path) => getLocalizedPath(path, activeLocale),
    formatDate: (valueToFormat, options) => new Intl.DateTimeFormat(activeLocale, options).format(new Date(valueToFormat)),
  }), [activeLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

export function getLocaleLabel(locale: SupportedLocale): string {
  if (locale === 'pt-BR') return 'Português';
  if (locale === 'en-US') return 'English';
  return 'Español';
}

export { supportedLocales };
