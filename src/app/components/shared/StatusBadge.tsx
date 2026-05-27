import { useI18n } from '../../i18n/I18nProvider';

type DreamStatus = 'rascunho' | 'publicado' | 'em-conversa' | 'realizando' | 'concluido' | 'pausado' | 'cancelado';
type ProposalStatus = 'enviada' | 'em-analise' | 'aceita' | 'recusada' | 'expirada';

const dreamStatusConfig: Record<DreamStatus, { labelKey: Parameters<ReturnType<typeof useI18n>['t']>[0]; classes: string; mark?: string }> = {
  rascunho: { labelKey: 'labels.dreamStatus.draft', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  publicado: { labelKey: 'labels.dreamStatus.published', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  'em-conversa': { labelKey: 'labels.dreamStatus.inConversation', classes: 'bg-pink-100 text-pink-700 border-pink-200' },
  realizando: { labelKey: 'labels.dreamStatus.fulfilling', classes: 'bg-orange-100 text-orange-700 border-orange-200' },
  concluido: { labelKey: 'labels.dreamStatus.completed', classes: 'bg-green-100 text-green-700 border-green-200', mark: '✓' },
  pausado: { labelKey: 'labels.dreamStatus.paused', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  cancelado: { labelKey: 'labels.dreamStatus.canceled', classes: 'bg-red-100 text-red-700 border-red-200' },
};

const proposalStatusConfig: Record<ProposalStatus, { labelKey: Parameters<ReturnType<typeof useI18n>['t']>[0]; classes: string; mark?: string }> = {
  enviada: { labelKey: 'labels.proposalStatus.sent', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  'em-analise': { labelKey: 'labels.proposalStatus.inReview', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  aceita: { labelKey: 'labels.proposalStatus.accepted', classes: 'bg-green-100 text-green-700 border-green-200', mark: '✓' },
  recusada: { labelKey: 'labels.proposalStatus.rejected', classes: 'bg-red-100 text-red-700 border-red-200' },
  expirada: { labelKey: 'labels.proposalStatus.expired', classes: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const urgencyConfig = {
  baixa: { labelKey: 'labels.urgency.low', classes: 'bg-[#e5f4ee] text-[#245b53]' },
  media: { labelKey: 'labels.urgency.medium', classes: 'bg-[#fff4d8] text-[#8b3d44]' },
  alta:  { labelKey: 'labels.urgency.high', classes: 'bg-[#f6f0ff] text-[#584478]' },
} as const;

interface DreamStatusBadgeProps {
  status: DreamStatus;
  size?: 'sm' | 'md';
}

export function DreamStatusBadge({ status, size = 'sm' }: DreamStatusBadgeProps) {
  const { t } = useI18n();
  const config = dreamStatusConfig[status];
  const label = `${t(config.labelKey)}${config.mark ? ` ${config.mark}` : ''}`;
  return (
    <span className={`inline-flex items-center border rounded-full font-medium
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${config.classes}`}>
      {label}
    </span>
  );
}

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  size?: 'sm' | 'md';
}

export function ProposalStatusBadge({ status, size = 'sm' }: ProposalStatusBadgeProps) {
  const { t } = useI18n();
  const config = proposalStatusConfig[status];
  const label = `${t(config.labelKey)}${config.mark ? ` ${config.mark}` : ''}`;
  return (
    <span className={`inline-flex items-center border rounded-full font-medium
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${config.classes}`}>
      {label}
    </span>
  );
}

interface UrgencyBadgeProps {
  urgency: 'baixa' | 'media' | 'alta';
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const { t } = useI18n();
  const config = urgencyConfig[urgency];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}>
      {t(config.labelKey)}
    </span>
  );
}

interface ReportStatusBadgeProps {
  status: 'nova' | 'em-analise' | 'acao-tomada' | 'resolvida';
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const { t } = useI18n();
  const configs = {
    nova: 'bg-red-100 text-red-700 border-red-200',
    'em-analise': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'acao-tomada': 'bg-orange-100 text-orange-700 border-orange-200',
    resolvida: 'bg-green-100 text-green-700 border-green-200',
  };
  const labels = {
    nova: t('labels.reportStatus.new'),
    'em-analise': t('labels.reportStatus.inReview'),
    'acao-tomada': t('labels.reportStatus.actionTaken'),
    resolvida: t('labels.reportStatus.resolved'),
  };
  return (
    <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${configs[status]}`}>
      {labels[status]}
    </span>
  );
}
