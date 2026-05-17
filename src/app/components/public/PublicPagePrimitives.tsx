import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';

type PublicHeroAction = {
  label: string;
  to: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
};

type PublicPageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  image?: string;
  imageAlt?: string;
  visual?: ReactNode;
  imageCaption?: string;
  imageFocus?: string;
  actions?: PublicHeroAction[];
  children?: ReactNode;
};

const sectionTones = {
  cream: 'bg-[#fff8ef] public-paper-grain',
  white: 'bg-white',
  sage: 'bg-[#e5f4ee] public-paper-grain',
  peach: 'bg-[#fff4d8] public-paper-grain',
};

function PublicHeroLink({ action }: { action: PublicHeroAction }) {
  const Icon = action.icon ?? ArrowRight;
  const isSecondary = action.variant === 'secondary';

  return (
    <Link
      to={action.to}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.35rem] px-5 py-3 text-sm font-extrabold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-4',
        isSecondary
          ? 'bg-white text-[#245b53] shadow-sm ring-1 ring-[#c9e5dc] hover:bg-[#e5f4ee] focus:ring-[#c9e5dc]'
          : 'bg-[#a8544a] text-white shadow-[0_14px_32px_rgba(168,84,74,0.22)] hover:bg-[#8b3d44] focus:ring-[#f4cbbd]',
      )}
    >
      {action.icon ? <Icon className="h-4 w-4" /> : null}
      {action.label}
      {!action.icon ? <Icon className="h-4 w-4" /> : null}
    </Link>
  );
}

export function PublicPageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  visual,
  imageCaption,
  imageFocus,
  actions,
  children,
}: PublicPageHeroProps) {
  const hasMedia = Boolean(visual || image);

  return (
    <section className="public-paper-grain relative isolate overflow-hidden border-b border-[#eadfd2] bg-white">
      <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#a8544a] via-[#245b53] to-[#fff4d8]" />
      <div
        className={cn(
          'mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:items-center',
          hasMedia ? 'lg:grid-cols-[0.92fr_1.08fr]' : 'lg:grid-cols-1',
        )}
      >
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex rounded-full border border-[#ecd8c8] bg-[#fff4d8] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#a8544a]">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] text-[#241b24] md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed text-[#5c4b52] md:text-xl">
            {intro}
          </p>
          {actions?.length ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {actions.map((action) => (
                <PublicHeroLink key={`${action.to}-${action.label}`} action={action} />
              ))}
            </div>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>

        {hasMedia ? (
          <figure className="relative">
            {visual ? (
              visual
            ) : image ? (
              <div className="public-organic-radius public-soft-shadow overflow-hidden border border-[#eadfd2] bg-white p-2">
                <ImageWithFallback
                  src={image}
                  alt={imageAlt ?? ''}
                  className="h-[340px] w-full rounded-[1.1rem] object-cover sm:h-[460px]"
                  style={{ objectPosition: imageFocus ?? 'center center' }}
                />
              </div>
            ) : null}
            {imageCaption ? (
              <figcaption className="public-stitched-edge ml-auto mt-4 max-w-md bg-white/80 px-1 pb-3 text-sm font-bold leading-relaxed text-[#5c4b52]">
                {imageCaption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </section>
  );
}

export function WarmSection({
  children,
  tone = 'white',
  className,
  id,
}: {
  children: ReactNode;
  tone?: keyof typeof sectionTones;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('relative overflow-hidden py-14 md:py-20', sectionTones[tone], className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('mb-9', align === 'center' && 'mx-auto max-w-3xl text-center')}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[#a8544a]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-4xl font-extrabold leading-[1.04] text-[#241b24] md:text-5xl">
        {title}
      </h2>
      {intro ? (
        <p className={cn('mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#5c4b52]', align === 'center' && 'mx-auto')}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}

export function StoryCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn('public-organic-radius border border-[#eadfd2] bg-white p-6 shadow-[0_16px_46px_rgba(92,62,51,0.07)]', className)}>
      {Icon ? (
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4d8] text-[#a8544a]">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="text-xl font-extrabold leading-tight text-[#241b24]">{title}</h3>
      <div className="mt-3 text-sm font-semibold leading-relaxed text-[#5c4b52]">{children}</div>
    </article>
  );
}

export function CareCallout({
  icon: Icon,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
  action?: PublicHeroAction;
  className?: string;
}) {
  return (
    <div className={cn('public-organic-radius public-paper-grain border border-[#ecd8c8] bg-[#fff8ef] p-6 public-soft-shadow md:p-8', className)}>
      <div className="grid gap-6 md:grid-cols-[0.78fr_0.22fr] md:items-center">
        <div>
          {Icon ? (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#245b53] shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
          ) : null}
          <h2 className="text-3xl font-extrabold leading-tight text-[#241b24] md:text-4xl">
            {title}
          </h2>
          <div className="mt-4 text-base font-semibold leading-relaxed text-[#5c4b52]">{children}</div>
        </div>
        {action ? (
          <div className="md:justify-self-end">
            <PublicHeroLink action={action} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
