import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, eyebrow, meta, actions, children }: AdminPageHeaderProps) {
  return (
    <header className="rounded-2xl border border-pink-100 bg-[#fffaf8] px-5 py-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-700">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-5 border-t border-pink-100 pt-4">{children}</div>}
    </header>
  );
}
