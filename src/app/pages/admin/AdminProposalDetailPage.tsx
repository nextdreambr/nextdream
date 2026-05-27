import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  HandHeart,
  History,
  MessageCircle,
  NotebookPen,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { AdminAuditLog, AdminProposalDetail, ApiError, Proposal, adminApi } from '../../lib/api';
import {
  AdminActionPanel,
  AdminAuditTimeline,
  AdminDetailHeader,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminRiskBadge,
  AdminSensitiveActionPanel,
  AdminStatusBadge,
  AdminTabs,
  type AdminRiskLevel,
  type AdminTabItem,
} from './components';

type ProposalTab = 'overview' | 'conversation' | 'reports' | 'moderation' | 'audit';

const proposalTabs: AdminTabItem<ProposalTab>[] = [
  { id: 'overview', label: 'Visão geral', icon: FileText },
  { id: 'conversation', label: 'Conversa', icon: MessageCircle },
  { id: 'reports', label: 'Denúncias', icon: ShieldAlert },
  { id: 'moderation', label: 'Moderação', icon: NotebookPen },
  { id: 'audit', label: 'Auditoria', icon: History },
];

function formatDateTime(value?: string | null) {
  if (!value) return 'Não informado';

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function supporterLabel(proposal: AdminProposalDetail) {
  return proposal.supporterName ?? 'Apoiador não informado';
}

function dreamLabel(proposal: AdminProposalDetail) {
  return proposal.dreamTitle ?? 'Sonho não informado';
}

function proposalRisk(proposal: AdminProposalDetail): { level: AdminRiskLevel; label: string } {
  if (proposal.riskLevel === 'high') return { level: 'high', label: `${proposal.reportCount ?? 1} denúncia${(proposal.reportCount ?? 1) === 1 ? '' : 's'}` };
  if (proposal.riskLevel === 'medium') return { level: 'medium', label: `${proposal.reportCount ?? 1} denúncia${(proposal.reportCount ?? 1) === 1 ? '' : 's'}` };
  if (proposal.riskLevel === 'pending') return { level: 'pending', label: 'Em análise' };
  if ((proposal.reportCount ?? 0) > 0) return { level: 'medium', label: `${proposal.reportCount} denúncia${proposal.reportCount === 1 ? '' : 's'}` };
  return { level: 'low', label: 'Sem alerta' };
}

function auditMentionsProposal(log: AdminAuditLog, proposal: AdminProposalDetail) {
  const haystack = [log.refId, log.refPath, log.action, log.target, log.type, log.details].filter(Boolean).join(' ').toLowerCase();
  return [proposal.id, proposal.dreamTitle, proposal.supporterName].filter(Boolean).some((needle) => haystack.includes(String(needle).toLowerCase()));
}

export default function AdminProposalDetailPage() {
  const navigate = useNavigate();
  const { proposalId } = useParams<{ proposalId: string }>();
  const [detail, setDetail] = useState<AdminProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<ProposalTab>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDetail(id: string) {
      setLoading(true);
      setError('');
      setActionError('');
      setActionSuccess('');

      try {
        const [response, logs] = await Promise.all([
          adminApi.getProposalDetail(id),
          Promise.resolve(adminApi.listAudit()).catch(() => []),
        ]);
        if (mounted) {
          setDetail(response);
          setAuditLogs(Array.isArray(logs) ? logs.filter((log) => auditMentionsProposal(log, response)) : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a proposta.');
          setAuditLogs([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (proposalId) void loadDetail(proposalId);

    return () => {
      mounted = false;
    };
  }, [proposalId]);

  const tabs = useMemo(() => {
    if (!detail) return proposalTabs;
    return proposalTabs.map((tab) => {
      if (tab.id === 'conversation') return { ...tab, badge: detail.relatedConversation ? 1 : 0 };
      if (tab.id === 'reports') return { ...tab, badge: detail.relatedReports?.length ?? 0 };
      if (tab.id === 'audit') return { ...tab, badge: auditLogs.length };
      return tab;
    });
  }, [auditLogs.length, detail]);

  async function refreshCurrentDetail() {
    if (!proposalId) return;
    const [updated, logs] = await Promise.all([
      adminApi.getProposalDetail(proposalId),
      Promise.resolve(adminApi.listAudit()).catch(() => []),
    ]);
    setDetail(updated);
    setAuditLogs(Array.isArray(logs) ? logs.filter((log) => auditMentionsProposal(log, updated)) : []);
  }

  async function updateStatus(status: Proposal['status'], reason?: string) {
    if (!proposalId) return;
    setActionLoading(status);
    setActionError('');
    setActionSuccess('');

    try {
      await adminApi.updateProposalStatus(proposalId, status, reason);
      await refreshCurrentDetail();
      setActionSuccess(`Status atualizado para ${status}.`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível atualizar o status da proposta.');
    } finally {
      setActionLoading(null);
    }
  }

  function renderOverview(proposal: AdminProposalDetail) {
    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Mensagem da proposta</h3>
          <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {proposal.message ?? 'Mensagem não informada'}
          </div>

          <dl className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-slate-500">Oferta</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{proposal.offering ?? 'Não informado'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Disponibilidade</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{proposal.availability ?? 'Não informado'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Duração</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{proposal.duration ?? 'Não informado'}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-950">Contexto do sonho</h4>
            <dl className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">Sonho</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{dreamLabel(proposal)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Status do sonho</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{proposal.dreamStatus ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Beneficiário</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{proposal.patientName ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Instituição</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{proposal.institutionName ?? 'Não informado'}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6">
            <AdminEmptyState
              title="Sem notas internas"
              description="Ainda não há um contrato de notas administrativas persistidas para propostas."
            />
          </div>
        </section>

        <aside className="space-y-4">
          <AdminActionPanel
            title="Ações rápidas"
            description="Atalhos de investigação. Decisões críticas ficam em moderação."
            actions={[
              {
                id: 'dream',
                label: 'Abrir sonho',
                icon: HandHeart,
                onClick: () => navigate(`/admin/sonhos/${proposal.dreamId}`),
              },
              {
                id: 'supporter',
                label: 'Abrir apoiador',
                icon: UserRound,
                disabled: !proposal.supporterId,
                onClick: () => {
                  if (proposal.supporterId) navigate(`/admin/usuarios/${proposal.supporterId}`);
                },
              },
              {
                id: 'conversation',
                label: 'Abrir conversa',
                icon: MessageCircle,
                disabled: !proposal.relatedConversation,
                onClick: () => {
                  if (proposal.relatedConversation) navigate(`/admin/chats/${proposal.relatedConversation.id}`);
                },
              },
              {
                id: 'reports',
                label: 'Abrir denúncias',
                icon: ShieldAlert,
                disabled: (proposal.relatedReports?.length ?? 0) === 0,
                onClick: () => setActiveTab('reports'),
              },
              {
                id: 'note',
                label: 'Adicionar nota interna',
                icon: NotebookPen,
                disabled: true,
                onClick: () => undefined,
              },
            ]}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-950">Indicadores</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-bold text-slate-950">{proposal.relatedConversation ? 1 : 0}</div>
                <div className="mt-1 text-xs text-slate-500">conversa</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <div className="font-bold">{proposal.reportCount ?? proposal.relatedReports?.length ?? 0}</div>
                <div className="mt-1 text-xs">denúncias</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    );
  }

  function renderConversation(proposal: AdminProposalDetail) {
    if (!proposal.relatedConversation) {
      return (
        <AdminEmptyState
          title="Sem conversa relacionada"
          description="A proposta ainda não possui conversa vinculada para investigação administrativa."
        />
      );
    }

    const chat = proposal.relatedConversation;
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Conversa relacionada</h3>
            <p className="mt-1 text-sm text-slate-500">Participantes e sinais principais da conversa originada pela proposta.</p>
          </div>
          <Link
            to={`/admin/chats/${chat.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Abrir chat
            <ExternalLink className="size-4" />
          </Link>
        </div>

        <dl className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-slate-500">Status</dt>
            <dd className="mt-1"><AdminStatusBadge status={chat.status}>{chat.status}</AdminStatusBadge></dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Solicitante</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">{chat.institutionName ?? chat.patientName ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Apoiador</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">{chat.supporterName ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Mensagens</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">{chat.messageCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Última mensagem</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">{formatDateTime(chat.lastMessageAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Moderação</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">{chat.hasModeratedMessages ? 'Com sinalização' : 'Sem sinalização'}</dd>
          </div>
        </dl>
      </section>
    );
  }

  function renderReports(proposal: AdminProposalDetail) {
    const reports = proposal.relatedReports ?? [];
    if (reports.length === 0) {
      return <AdminEmptyState title="Sem denúncias relacionadas" description="Nenhuma denúncia foi vinculada a esta proposta, sonho ou conversa." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Denúncias relacionadas</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/admin/denuncias/${report.id}`}
              className="block py-4 transition first:pt-0 last:pb-0 hover:bg-slate-50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge status={report.status}>{report.status}</AdminStatusBadge>
                {report.severity && <AdminRiskBadge level={report.severity} label={report.severity} />}
                <span className="text-xs font-semibold text-slate-500">{report.targetType}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{report.reason}</div>
              <div className="mt-1 text-xs text-slate-500">Criada em {formatDateTime(report.createdAt)}</div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderModeration(proposal: AdminProposalDetail) {
    const proposalAudit = auditLogs.filter((log) => log.type === 'proposta');
    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminAuditTimeline
          title="Histórico da proposta"
          events={proposalAudit.map((log) => ({
            id: log.id,
            title: log.action,
            description: log.details,
            actor: log.by,
            date: formatDateTime(log.date),
            status: <AdminStatusBadge status={log.outcome}>{log.outcome}</AdminStatusBadge>,
            href: log.refPath,
          }))}
          emptyTitle="Sem histórico"
          emptyDescription="Alterações de status e decisões administrativas aparecerão aqui quando registradas."
        />

        <AdminSensitiveActionPanel
          title="Ações sensíveis"
          description="Ações com impacto na proposta exigem confirmação e motivo quando aplicável."
          errorMessage={actionError}
          successMessage={actionSuccess}
          actions={[
            {
              id: 'review',
              title: 'Marcar em análise',
              description: proposal.status === 'em-analise' ? 'Esta proposta já está em análise.' : 'Move a proposta para triagem operacional.',
              confirmLabel: 'Marcar em análise',
              destructive: false,
              disabled: proposal.status === 'em-analise',
              loading: actionLoading === 'em-analise',
              onConfirm: async () => updateStatus('em-analise', 'Movida para análise via painel administrativo.'),
            },
            {
              id: 'cancel',
              title: 'Cancelar proposta',
              description: proposal.status === 'recusada' ? 'Esta proposta já está recusada.' : 'Recusa a proposta e registra a decisão para auditoria.',
              confirmLabel: 'Cancelar proposta',
              destructive: true,
              disabled: proposal.status === 'recusada',
              loading: actionLoading === 'recusada',
              requiresReason: true,
              reasonLabel: 'Motivo do cancelamento',
              reasonPlaceholder: 'Explique por que a proposta deve ser cancelada.',
              reasonMinLength: 8,
              onConfirm: async (reason) => updateStatus('recusada', reason),
            },
            {
              id: 'signal',
              title: 'Sinalizar proposta',
              description: 'Ainda não há endpoint para criar denúncia manual diretamente a partir da proposta.',
              confirmLabel: 'Sinalizar proposta',
              disabled: true,
              onConfirm: async () => undefined,
            },
            {
              id: 'block',
              title: 'Bloquear apoiador',
              description: 'Bloqueio de usuário exige fluxo próprio de usuários e motivo estruturado.',
              confirmLabel: 'Bloquear apoiador',
              disabled: true,
              onConfirm: async () => undefined,
            },
            {
              id: 'escalate',
              title: 'Escalar para denúncia',
              description: 'Escalonamento manual ainda não possui contrato persistente na API.',
              confirmLabel: 'Escalar',
              disabled: true,
              onConfirm: async () => undefined,
            },
          ]}
        />
      </div>
    );
  }

  function renderAudit() {
    return (
      <AdminAuditTimeline
        events={auditLogs.map((log) => ({
          id: log.id,
          title: log.action,
          description: log.details,
          actor: log.by,
          date: formatDateTime(log.date),
          status: <AdminStatusBadge status={log.outcome}>{log.outcome}</AdminStatusBadge>,
          href: log.refPath,
        }))}
        emptyTitle="Sem auditoria relacionada"
        emptyDescription="Eventos administrativos associados a esta proposta aparecerão aqui."
      />
    );
  }

  if (loading) {
    return <AdminLoadingState title="Carregando proposta" description="Buscando apoiador, sonho, conversa, denúncias e histórico." />;
  }

  if (error) {
    return (
      <AdminErrorState
        title="Não foi possível carregar a proposta"
        description={error}
        actionLabel="Voltar para propostas"
        onAction={() => navigate('/admin/propostas')}
      />
    );
  }

  if (!detail) {
    return <AdminEmptyState title="Proposta não encontrada" description="A proposta selecionada não retornou dados para investigação." />;
  }

  const risk = proposalRisk(detail);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate('/admin/propostas')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="size-4" />
        Voltar para propostas
      </button>

      <AdminDetailHeader
        title={`Proposta de ${supporterLabel(detail)}`}
        subtitle={<span>{dreamLabel(detail)}</span>}
        status={<AdminStatusBadge status={detail.status}>{detail.status}</AdminStatusBadge>}
        risk={<AdminRiskBadge level={risk.level} label={risk.label} />}
        actions={
          detail.relatedConversation ? (
            <Link
              to={`/admin/chats/${detail.relatedConversation.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Abrir conversa
              <ExternalLink className="size-4" />
            </Link>
          ) : undefined
        }
        metadata={[
          { label: 'Apoiador', value: supporterLabel(detail) },
          { label: 'Sonho', value: dreamLabel(detail) },
          { label: 'Localização', value: detail.locationLabel ?? 'Não informado' },
          { label: 'Atualizado em', value: formatDateTime(detail.updatedAt ?? detail.createdAt) },
        ]}
      />

      <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && renderOverview(detail)}
      {activeTab === 'conversation' && renderConversation(detail)}
      {activeTab === 'reports' && renderReports(detail)}
      {activeTab === 'moderation' && renderModeration(detail)}
      {activeTab === 'audit' && renderAudit()}
    </div>
  );
}
