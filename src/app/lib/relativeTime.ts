import type { SupportedLocale } from '../i18n/locale';

export function formatRelativeDate(
  dateInput: string | Date,
  nowInput = new Date(),
  locale: SupportedLocale = 'pt-BR',
) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = nowInput instanceof Date ? nowInput : new Date(nowInput);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = now.getTime() - date.getTime();
  if (diffMs <= 0) {
    if (locale === 'en-US') return 'Just now';
    if (locale === 'es-ES') return 'Ahora mismo';
    return 'Agora mesmo';
  }

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-minutes, 'minute');
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-hours, 'hour');
  }

  const days = Math.floor(diffMs / day);
  if (days < 7) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-days, 'day');

  return date.toLocaleDateString(locale);
}
