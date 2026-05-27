import type { ComponentType, ReactNode } from 'react';

interface AdminPanelAction {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'neutral' | 'primary' | 'warning';
  onClick: () => void;
}

interface AdminActionPanelProps {
  title: string;
  description?: string;
  actions?: AdminPanelAction[];
  children?: ReactNode;
}

const toneClasses: Record<NonNullable<AdminPanelAction['tone']>, string> = {
  neutral: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  primary: 'border-pink-200 bg-pink-50 text-pink-800 hover:bg-pink-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100',
};

export function AdminActionPanel({ title, description, actions = [], children }: AdminActionPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {actions.length > 0 && (
        <div className="mt-4 grid gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[action.tone ?? 'neutral']}`}
              >
                {Icon && <Icon className="size-4" />}
                {action.loading ? 'Processando...' : action.label}
              </button>
            );
          })}
        </div>
      )}
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
