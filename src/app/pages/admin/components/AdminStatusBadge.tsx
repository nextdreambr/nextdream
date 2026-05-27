import type { ReactNode } from 'react';

export type AdminStatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export function adminStatusTone(status: string): AdminStatusTone {
  switch (status) {
    case 'ativa':
    case 'ativo':
    case 'publicado':
    case 'aceita':
    case 'aprovado':
    case 'resolvido':
    case 'respondido':
    case 'concluido':
      return 'success';
    case 'aberto':
    case 'em-analise':
    case 'pausado':
    case 'pendente':
    case 'novo':
    case 'enviada':
      return 'warning';
    case 'encerrada':
    case 'cancelado':
    case 'recusada':
    case 'suspenso':
    case 'falha':
      return 'danger';
    case 'verificado':
    case 'rascunho':
      return 'info';
    default:
      return 'neutral';
  }
}

export function adminStatusClasses(status: string) {
  const tone = adminStatusTone(status);

  const classes: Record<AdminStatusTone, string> = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
  };

  return classes[tone];
}

export function AdminStatusBadge({ children, status }: { children: ReactNode; status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${adminStatusClasses(status)}`}>
      {children}
    </span>
  );
}
