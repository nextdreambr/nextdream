import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../ui/utils';

type Tone = 'care' | 'support' | 'institution' | 'admin' | 'neutral';

const toneStyles: Record<Tone, {
  page: string;
  hero: string;
  icon: string;
  eyebrow: string;
  action: string;
  soft: string;
  border: string;
}> = {
  care: {
    page: 'bg-[#fff8ef] text-[#241b24]',
    hero: 'border-[#ecd8c8] bg-[#fff3e4]',
    icon: 'bg-[#f7d9c6] text-[#8b3d44]',
    eyebrow: 'text-[#a8544a]',
    action: 'bg-[#a8544a] text-white hover:bg-[#8b3d44] focus:ring-[#f4cbbd]',
    soft: 'bg-[#fff4d8] text-[#5c4b52]',
    border: 'border-[#ecd8c8]',
  },
  support: {
    page: 'bg-[#f2fbf8] text-[#1f2924]',
    hero: 'border-[#c9e5dc] bg-[#e5f4ee]',
    icon: 'bg-[#c9e5dc] text-[#245b53]',
    eyebrow: 'text-[#245b53]',
    action: 'bg-[#245b53] text-white hover:bg-[#17453f] focus:ring-[#9ed0c1]',
    soft: 'bg-[#e5f4ee] text-[#245b53]',
    border: 'border-[#c9e5dc]',
  },
  institution: {
    page: 'bg-[#f8f5ff] text-[#241b24]',
    hero: 'border-[#d8cdeb] bg-[#f6f0ff]',
    icon: 'bg-[#e6ddf6] text-[#584478]',
    eyebrow: 'text-[#584478]',
    action: 'bg-[#584478] text-white hover:bg-[#44345f] focus:ring-[#d8cdeb]',
    soft: 'bg-[#f6f0ff] text-[#584478]',
    border: 'border-[#d8cdeb]',
  },
  admin: {
    page: 'bg-[#f8faf7] text-[#1f2924]',
    hero: 'border-[#d7e3d9] bg-[#eef7f2]',
    icon: 'bg-[#dcebdc] text-[#365343]',
    eyebrow: 'text-[#365343]',
    action: 'bg-[#365343] text-white hover:bg-[#293f33] focus:ring-[#c8dacb]',
    soft: 'bg-[#eef7f2] text-[#365343]',
    border: 'border-[#d7e3d9]',
  },
  neutral: {
    page: 'bg-[#fffaf4] text-[#241b24]',
    hero: 'border-[#eadfd2] bg-white',
    icon: 'bg-[#fff4d8] text-[#8b3d44]',
    eyebrow: 'text-[#a8544a]',
    action: 'bg-[#245b53] text-white hover:bg-[#17453f] focus:ring-[#9ed0c1]',
    soft: 'bg-[#fff8ef] text-[#5c4b52]',
    border: 'border-[#eadfd2]',
  },
};

type ShellWidth = 'narrow' | 'content' | 'wide';

const widths: Record<ShellWidth, string> = {
  narrow: 'max-w-3xl',
  content: 'max-w-5xl',
  wide: 'max-w-7xl',
};

export function ProductPageShell({
  children,
  tone = 'neutral',
  width = 'content',
  className,
  ...props
}: {
  children: ReactNode;
  tone?: Tone;
  width?: ShellWidth;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('mx-auto w-full space-y-6', widths[width], toneStyles[tone].page, className)}>
      {children}
    </div>
  );
}

export function ProductHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone = 'neutral',
  action,
  aside,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: Tone;
  action?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  const styles = toneStyles[tone];

  return (
    <section className={cn('overflow-hidden rounded-2xl border p-5 shadow-[0_20px_60px_rgba(92,62,51,0.08)] md:p-7', styles.hero, className)}>
      <div className={cn('grid gap-6', aside && 'lg:grid-cols-[1fr_0.42fr] lg:items-center')}>
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {Icon ? (
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', styles.icon)}>
                <Icon className="h-5 w-5" />
              </span>
            ) : null}
            {eyebrow ? (
              <p className={cn('text-xs font-extrabold uppercase tracking-[0.18em]', styles.eyebrow)}>
                {eyebrow}
              </p>
            ) : null}
          </div>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.02] tracking-normal md:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#66585e] md:text-lg">
              {description}
            </p>
          ) : null}
          {action ? <div className="mt-6">{action}</div> : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  );
}

export function SoftActionLink({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-4',
        toneStyles[tone].action,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function HumanCard({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <article className={cn('rounded-2xl border bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]', toneStyles[tone].border, className)}>
      {children}
    </article>
  );
}

export function SensitiveNotice({
  title = 'Privacidade e consentimento',
  children,
  tone = 'neutral',
  icon: Icon = ShieldCheck,
  className,
}: {
  title?: string;
  children: ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
}) {
  const styles = toneStyles[tone];

  return (
    <div className={cn('rounded-2xl border p-4', styles.border, styles.soft, className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/75">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-extrabold leading-snug">{title}</p>
          <div className="mt-1 text-sm font-semibold leading-relaxed opacity-85">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold leading-tight text-[#241b24]">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[#66585e]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function FieldHelp({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#7a6d72]">{children}</p>;
}

export function GentleProgress({
  steps,
  current,
  tone = 'neutral',
}: {
  steps: string[];
  current: number;
  tone?: Tone;
}) {
  const styles = toneStyles[tone];

  return (
    <nav aria-label="Progresso" className="rounded-2xl border border-white/70 bg-white/82 p-4 shadow-sm">
      <ol className="grid gap-3 sm:grid-cols-4">
        {steps.map((label, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold',
                  isDone || isCurrent ? styles.action : 'bg-[#f1ece7] text-[#7a6d72]',
                )}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <span className={cn('text-xs font-extrabold leading-tight', isCurrent ? styles.eyebrow : 'text-[#7a6d72]')}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
