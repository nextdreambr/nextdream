import { AsyncLocalStorage } from 'node:async_hooks';
import { DEFAULT_API_LOCALE, type ApiLocale } from './locale';

const localeStorage = new AsyncLocalStorage<ApiLocale>();

export function runWithApiLocale<T>(locale: ApiLocale, callback: () => T): T {
  return localeStorage.run(locale, callback);
}

export function getRequestApiLocale(): ApiLocale {
  return localeStorage.getStore() ?? DEFAULT_API_LOCALE;
}
