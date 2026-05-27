import type { ReactNode } from 'react';

interface AdminDetailHeaderMetadata {
  label: string;
  value: ReactNode;
}

interface AdminDetailHeaderProps {
  title: string;
  subtitle?: ReactNode;
  status?: ReactNode;
  risk?: ReactNode;
  actions?: ReactNode;
  metadata?: AdminDetailHeaderMetadata[];
}

export function AdminDetailHeader({ title, subtitle, status, risk, actions, metadata = [] }: AdminDetailHeaderProps) {
  return (
    <section className="rounded-2xl border border-pink-100 bg-[#fffaf8] p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {(status || risk) && <div className="mb-3 flex flex-wrap items-center gap-2">{status}{risk}</div>}
          <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
          {subtitle && <div className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {metadata.length > 0 && (
        <dl className="mt-5 grid gap-3 border-t border-pink-100 pt-4 sm:grid-cols-2 xl:grid-cols-4">
          {metadata.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
