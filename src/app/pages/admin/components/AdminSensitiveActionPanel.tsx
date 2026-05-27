import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { ConfirmActionDialog } from './ConfirmActionDialog';

export interface AdminSensitiveAction {
  id: string;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  requiresReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonMinLength?: number;
  onConfirm: (reason?: string) => void | Promise<void>;
}

interface AdminSensitiveActionPanelProps {
  title: string;
  description?: string;
  actions: AdminSensitiveAction[];
  errorMessage?: string;
  successMessage?: string;
}

export function AdminSensitiveActionPanel({
  title,
  description,
  actions,
  errorMessage,
  successMessage,
}: AdminSensitiveActionPanelProps) {
  const [pendingAction, setPendingAction] = useState<AdminSensitiveAction | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  function reasonFor(action: AdminSensitiveAction) {
    return reasons[action.id] ?? '';
  }

  function updateReason(actionId: string, value: string) {
    setReasons((current) => ({ ...current, [actionId]: value }));
  }

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 text-red-700" />
        <div>
          <h3 className="text-base font-semibold text-red-950">{title}</h3>
          {description && <p className="mt-1 text-sm text-red-800">{description}</p>}
        </div>
      </div>

      {errorMessage && <div className="mt-4 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-700">{errorMessage}</div>}
      {successMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{successMessage}</div>}

      <div className="mt-4 space-y-4">
        {actions.map((action) => {
          const reason = reasonFor(action);
          const minLength = action.reasonMinLength ?? 3;
          const reasonInvalid = Boolean(action.requiresReason && reason.trim().length < minLength);
          const disabled = action.disabled || action.loading || reasonInvalid;

          return (
            <article key={action.id} className="rounded-xl border border-red-200 bg-white p-3">
              <div>
                <h4 className="text-sm font-semibold text-red-950">{action.title}</h4>
                <p className="mt-1 text-sm leading-5 text-red-800">{action.description}</p>
              </div>
              {action.requiresReason && (
                <label className="mt-3 block space-y-1 text-sm font-semibold text-red-950">
                  <span>{action.reasonLabel ?? 'Motivo'}</span>
                  <textarea
                    value={reason}
                    onChange={(event) => updateReason(action.id, event.target.value)}
                    placeholder={action.reasonPlaceholder ?? 'Descreva o motivo para registro administrativo'}
                    className="min-h-20 w-full rounded-lg border border-red-200 bg-white px-3 py-2 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                </label>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => setPendingAction(action)}
                className={`mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  action.destructive ?? true
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                }`}
              >
                {action.loading ? 'Processando...' : action.confirmLabel ?? 'Confirmar ação'}
              </button>
            </article>
          );
        })}
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        title="Confirme a ação sensível"
        description={pendingAction?.description ?? ''}
        confirmLabel="Confirmar ação"
        destructive={pendingAction?.destructive ?? true}
        loading={Boolean(pendingAction?.loading)}
        onConfirm={async () => {
          if (!pendingAction) return;
          const reason = reasonFor(pendingAction).trim();
          await pendingAction.onConfirm(reason || undefined);
          setPendingAction(null);
        }}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      />
    </section>
  );
}
