import { Globe2 } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { getLocaleLabel, supportedLocales, useI18n } from './I18nProvider';
import { getLocalizedPath } from './routes';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-[#eadfd2] bg-white/78 p-1 text-xs font-extrabold text-[#5c4b52] shadow-sm"
      aria-label={t('language.label')}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#245b53]" aria-hidden>
        <Globe2 className="h-4 w-4" />
      </span>
      {supportedLocales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            to={getLocalizedPath(currentPath, item)}
            className={`rounded-full px-2.5 py-1.5 transition-colors ${
              active ? 'bg-[#245b53] text-white' : 'hover:bg-[#e5f4ee] hover:text-[#245b53]'
            }`}
            lang={item}
            aria-current={active ? 'true' : undefined}
          >
            {compact ? item.slice(0, 2).toUpperCase() : getLocaleLabel(item)}
          </Link>
        );
      })}
    </div>
  );
}
