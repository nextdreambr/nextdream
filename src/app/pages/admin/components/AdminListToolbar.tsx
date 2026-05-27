import type { ReactNode } from 'react';

interface AdminListToolbarProps {
  title?: string;
  description?: string;
  totalLabel?: string;
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function AdminListToolbar({ title, description, totalLabel, search, filters, actions }: AdminListToolbarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {(title || description || totalLabel || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-slate-950">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            {totalLabel && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-pink-700">{totalLabel}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {(search || filters) && (
        <div className="mt-4 space-y-3">
          {search}
          {filters}
        </div>
      )}
    </section>
  );
}
