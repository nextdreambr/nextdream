import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

interface AdminStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

function AdminStateAction({ actionLabel, onAction }: Pick<AdminStateProps, 'actionLabel' | 'onAction'>) {
  if (!actionLabel || !onAction) return null;

  return (
    <button
      type="button"
      onClick={onAction}
      className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      {actionLabel}
    </button>
  );
}

export function AdminLoadingState({ title, description }: AdminStateProps) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/60 px-6 py-10 text-center">
      <div>
        <Loader2 className="mx-auto size-6 animate-spin text-pink-700" />
        <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
      </div>
    </div>
  );
}

export function AdminErrorState({ title, description, actionLabel, onAction, children }: AdminStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <AlertTriangle className="mx-auto size-6 text-red-700" />
      <h3 className="mt-4 text-base font-semibold text-red-950">{title}</h3>
      {description && <p className="mt-2 text-sm text-red-800">{description}</p>}
      {children}
      <AdminStateAction actionLabel={actionLabel} onAction={onAction} />
    </div>
  );
}

export function AdminEmptyState({ title, description, actionLabel, onAction, children }: AdminStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
      <Inbox className="mx-auto size-7 text-slate-400" />
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      {children}
      <AdminStateAction actionLabel={actionLabel} onAction={onAction} />
    </div>
  );
}
