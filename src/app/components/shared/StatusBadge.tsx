import { DreamStatus, ProposalStatus } from '../../data/mockData';

const dreamStatusConfig: Record<DreamStatus, { label: string; classes: string }> = {
  rascunho: { label: 'Rascunho', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  publicado: { label: 'Publicado', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  'em-conversa': { label: 'Em conversa', classes: 'bg-pink-100 text-pink-700 border-pink-200' },
  realizando: { label: 'Realizando', classes: 'bg-orange-100 text-orange-700 border-orange-200' },
  concluido: { label: 'Concluído ✓', classes: 'bg-green-100 text-green-700 border-green-200' },
  pausado: { label: 'Pausado', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  cancelado: { label: 'Cancelado', classes: 'bg-red-100 text-red-700 border-red-200' },
};

const proposalStatusConfig: Record<ProposalStatus, { label: string; classes: string }> = {
  enviada: { label: 'Enviada', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  'em-analise': { label: 'Em análise', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  aceita: { label: 'Aceita ✓', classes: 'bg-green-100 text-green-700 border-green-200' },
  recusada: { label: 'Recusada', classes: 'bg-red-100 text-red-700 border-red-200' },
  expirada: { label: 'Expirada', classes: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const urgencyConfig = {
  baixa: { label: 'Baixa', classes: 'bg-emerald-100 text-emerald-700' },
  media: { label: 'Média', classes: 'bg-amber-100 text-amber-700' },
  alta:  { label: 'Alta',  classes: 'bg-red-100 text-red-700' },
};

interface DreamStatusBadgeProps {
  status: DreamStatus;
  size?: 'sm' | 'md';
}

export function DreamStatusBadge({ status, size = 'sm' }: DreamStatusBadgeProps) {
  const config = dreamStatusConfig[status];
  return (
    <span className={`inline-flex items-center border rounded-full font-medium
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${config.classes}`}>
      {config.label}
    </span>
  );
}

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  size?: 'sm' | 'md';
}

export function ProposalStatusBadge({ status, size = 'sm' }: ProposalStatusBadgeProps) {
  const config = proposalStatusConfig[status];
  return (
    <span className={`inline-flex items-center border rounded-full font-medium
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${config.classes}`}>
      {config.label}
    </span>
  );
}

interface UrgencyBadgeProps {
  urgency: 'baixa' | 'media' | 'alta';
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const config = urgencyConfig[urgency];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}

interface ReportStatusBadgeProps {
  status: 'nova' | 'em-analise' | 'acao-tomada' | 'resolvida';
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const configs = {
    nova: 'bg-red-100 text-red-700 border-red-200',
    'em-analise': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'acao-tomada': 'bg-orange-100 text-orange-700 border-orange-200',
    resolvida: 'bg-green-100 text-green-700 border-green-200',
  };
  const labels = {
    nova: 'Nova',
    'em-analise': 'Em análise',
    'acao-tomada': 'Ação tomada',
    resolvida: 'Resolvida',
  };
  return (
    <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${configs[status]}`}>
      {labels[status]}
    </span>
  );
}