import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { dreamsApi, type DreamLanguage, type DreamTranslation } from '../../lib/api';

type DreamLanguageAssistDream = {
  id: string;
  title: string;
  description: string;
  originalLanguage?: DreamLanguage;
  translations?: Partial<Record<DreamLanguage, DreamTranslation>>;
};

type DreamLanguageAssistRenderState = {
  title: string;
  description: string;
  isTranslated: boolean;
  controls: ReactNode;
};

type DreamLanguageAssistProps = {
  dream: DreamLanguageAssistDream;
  variant?: 'card' | 'detail';
  children: (state: DreamLanguageAssistRenderState) => ReactNode;
};

const DEFAULT_DREAM_LANGUAGE: DreamLanguage = 'pt-BR';

function languageLabel(language: DreamLanguage, t: ReturnType<typeof useI18n>['t']) {
  if (language === 'pt-BR') return t('dreamLanguageAssist.portuguese');
  if (language === 'en-US') return t('dreamLanguageAssist.english');
  return t('dreamLanguageAssist.spanish');
}

export function DreamLanguageAssist({
  dream,
  variant = 'card',
  children,
}: DreamLanguageAssistProps) {
  const { locale, t } = useI18n();
  const originalLanguage = dream.originalLanguage ?? DEFAULT_DREAM_LANGUAGE;
  const [translations, setTranslations] = useState<Partial<Record<DreamLanguage, DreamTranslation>>>(
    dream.translations ?? {},
  );
  const [view, setView] = useState<'original' | 'translated'>('original');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTranslations(dream.translations ?? {});
    setView('original');
    setLoading(false);
    setError('');
  }, [dream.id, dream.translations, locale]);

  const activeTranslation = translations[locale];
  const canTranslate = locale !== originalLanguage;
  const isTranslated = canTranslate && view === 'translated' && Boolean(activeTranslation);
  const title = isTranslated && activeTranslation ? activeTranslation.title : dream.title;
  const description = isTranslated && activeTranslation ? activeTranslation.description : dream.description;
  const originalLanguageLabel = languageLabel(originalLanguage, t);
  const targetLanguageLabel = languageLabel(locale, t);

  async function translateToActiveLocale() {
    if (!canTranslate || loading) return;
    setError('');

    if (translations[locale]) {
      setView('translated');
      return;
    }

    setLoading(true);
    try {
      const translation = await dreamsApi.translateDream(dream.id, locale);
      setTranslations((current) => ({
        ...current,
        [locale]: translation,
      }));
      setView('translated');
    } catch {
      setView('original');
      setError(t('dreamLanguageAssist.unavailable'));
    } finally {
      setLoading(false);
    }
  }

  function stopCardNavigation(event: MouseEvent) {
    event.stopPropagation();
  }

  const controls = useMemo(() => {
    if (!canTranslate && variant === 'card') {
      return null;
    }

    const action = canTranslate ? (
      <button
        type="button"
        onClick={(event) => {
          stopCardNavigation(event);
          if (isTranslated) {
            setView('original');
            setError('');
            return;
          }
          void translateToActiveLocale();
        }}
        disabled={loading}
        className={
          variant === 'detail'
            ? 'inline-flex min-h-10 items-center justify-center rounded-full bg-[#245b53] px-4 text-sm font-extrabold text-white transition hover:bg-[#17453f] disabled:cursor-wait disabled:opacity-70'
            : 'inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border border-[#c9e5dc] bg-white px-3 text-xs font-extrabold text-[#245b53] transition hover:bg-[#f2fbf8] disabled:cursor-wait disabled:opacity-70'
        }
      >
        {isTranslated
          ? t('dreamLanguageAssist.viewOriginal')
          : t('dreamLanguageAssist.translateTo', { language: targetLanguageLabel })}
      </button>
    ) : null;

    if (variant === 'detail') {
      return (
        <section
          className="rounded-2xl border border-[#c9e5dc] bg-[#f2fbf8] p-4"
          onClick={stopCardNavigation}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#245b53]">
                <Languages className="h-4 w-4" />
                {t('dreamLanguageAssist.language')}
              </div>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-[#66766e]">{t('dreamLanguageAssist.original')}</dt>
                  <dd className="mt-0.5 font-extrabold text-[#1f2924]">{originalLanguageLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-[#66766e]">{t('dreamLanguageAssist.viewing')}</dt>
                  <dd className="mt-0.5 font-extrabold text-[#1f2924]">
                    {isTranslated ? targetLanguageLabel : originalLanguageLabel}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-[#66766e]">
                {t('dreamLanguageAssist.originalStoryNote')}
              </p>
            </div>
            {action}
          </div>
          <div className="mt-3 text-xs font-semibold text-[#66766e]" aria-live="polite">
            {loading ? t('dreamLanguageAssist.translating') : error}
          </div>
        </section>
      );
    }

    return (
      <div
        className="mt-3 flex flex-col gap-2 rounded-xl border border-[#d8ebe3] bg-[#f7fcf9] px-3 py-2 text-xs font-bold text-[#245b53] sm:flex-row sm:items-center sm:justify-between"
        onClick={stopCardNavigation}
        aria-live="polite"
      >
        <span>
          {isTranslated
            ? `${t('dreamLanguageAssist.viewing')} ${targetLanguageLabel}`
            : t('dreamLanguageAssist.originallyWrittenIn', { language: originalLanguageLabel })}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {loading && <span className="text-[#66766e]">{t('dreamLanguageAssist.translating')}</span>}
          {action}
        </div>
        {error && <span className="text-[#8b3d44]">{error}</span>}
      </div>
    );
  }, [
    canTranslate,
    dream.id,
    error,
    isTranslated,
    loading,
    locale,
    originalLanguageLabel,
    targetLanguageLabel,
    t,
    translations,
    variant,
  ]);

  return (
    <>
      {children({
        title,
        description,
        isTranslated,
        controls,
      })}
    </>
  );
}
