import { AlertTriangle, Circle, ShieldAlert } from 'lucide-react';

export type AdminRiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'pending' | 'neutral';

const riskConfig: Record<AdminRiskLevel, { label: string; className: string; icon: typeof Circle }> = {
  low: {
    label: 'Risco baixo',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: Circle,
  },
  medium: {
    label: 'Risco médio',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: AlertTriangle,
  },
  high: {
    label: 'Risco alto',
    className: 'border-red-200 bg-red-50 text-red-800',
    icon: ShieldAlert,
  },
  critical: {
    label: 'Crítico',
    className: 'border-red-300 bg-red-100 text-red-900',
    icon: ShieldAlert,
  },
  pending: {
    label: 'Pendência',
    className: 'border-pink-200 bg-pink-50 text-pink-800',
    icon: AlertTriangle,
  },
  neutral: {
    label: 'Sem alerta',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
    icon: Circle,
  },
};

export function AdminRiskBadge({ level, label }: { level: AdminRiskLevel; label?: string }) {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="size-3.5" />
      {label ?? config.label}
    </span>
  );
}
