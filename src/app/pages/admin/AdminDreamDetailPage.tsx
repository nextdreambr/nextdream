import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Ban,
  ClipboardList,
  ExternalLink,
  FileText,
  History,
  MessageCircle,
  NotebookPen,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { AdminAuditLog, AdminDreamDetail, ApiError, PublicDream, adminApi } from '../../lib/api';
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

type DreamTab = 'overview' | 'proposals' | 'conversations' | 'reports' | 'moderation' | 'audit';

const dreamTabs: AdminTabItem<DreamTab>[] = [
  { id: 'overview', label: 'Visão geral', icon: FileText },
  { id: 'proposals', label: 'Propostas', icon: ClipboardList },
  { id: 'conversations', label: 'Conversas', icon: MessageCircle },
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

function languageLabel(value?: string) {
  if (value === 'en-US') return 'Inglês';
  if (value === 'es-ES') return 'Espanhol';
  return 'Português';
}

function requesterLabel(dream: AdminDreamDetail) {
  return dream.institutionName ?? dream.operatorName ?? dream.patientName ?? 'Solicitante não informado';
}

function beneficiaryLabel(dream: AdminDreamDetail) {
  if (dream.managedPatientName) return dream.managedPatientName;
  if (dream.institutionName && dream.patientName) return dream.patientName;
  return 'Não informado';
}

function dreamRisk(dream: AdminDreamDetail): { level: AdminRiskLevel; label: string } {
  if ((dream.reportCount ?? 0) > 0) return { level: 'high', label: `${dream.reportCount} denúncia${dream.reportCount === 1 ? '' : 's'}` };
  if (dream.status === 'pausado' || dream.status === 'cancelado') return { level: 'medium', label: 'Pendência' };
  if ((dream.proposalCount ?? 0) === 0) return { level: 'pending', label: 'Sem proposta' };
  return { level: 'low', label: 'Sem alerta' };
}

function auditMentionsDream(log: AdminAuditLog, dream: AdminDreamDetail) {
  const haystack = [log.refId, log.refPath, log.action, log.target, log.type, log.details].filter(Boolean).join(' ').toLowerCase();
  return [dream.id, dream.title].some((needle) => haystack.includes(needle.toLowerCase()));
}

export default function AdminDreamDetailPage() {
  const navigate = useNavigate();
  const { dreamId } = useParams<{ dreamId: string }>();
  const [detail, setDetail] = useState<AdminDreamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<DreamTab>('overview');
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
          adminApi.getDreamDetail(id),
          Promise.resolve(adminApi.listAudit()).catch(() => []),
        ]);
        if (mounted) {
          setDetail(response);
          setAuditLogs(Array.isArray(logs) ? logs.filter((log) => auditMentionsDream(log, response)) : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o sonho.');
          setAuditLogs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (dreamId) void loadDetail(dreamId);

    return () => {
      mounted = false;
    };
  }, [dreamId]);

  const tabs = useMemo(() => {
    if (!detail) return dreamTabs;
    return dreamTabs.map((tab) => {
      if (tab.id === 'proposals') return { ...tab, badge: detail.relatedProposals.length };
      if (tab.id === 'conversations') return { ...tab, badge: detail.linkedConversation ? 1 : 0 };
      if (tab.id === 'reports') return { ...tab, badge: detail.relatedReports?.length ?? 0 };
      if (tab.id === 'audit') return { ...tab, badge: auditLogs.length };
      return tab;
    });
  }, [auditLogs.length, detail]);

  async function refreshCurrentDetail() {
    if (!dreamId) return;
    const [updated, logs] = await Promise.all([
      adminApi.getDreamDetail(dreamId),
      Promise.resolve(adminApi.listAudit()).catch(() => []),
    ]);
    setDetail(updated);
    setAuditLogs(Array.isArray(logs) ? logs.filter((log) => auditMentionsDream(log, updated)) : []);
  }

  async function updateStatus(status: PublicDream['status'], reason?: string) {
    if (!dreamId) return;
    setActionLoading(status);
    setActionError('');
    setActionSuccess('');

    try {
      await adminApi.updateDreamStatus(dreamId, status, reason);
      await refreshCurrentDetail();
      setActionSuccess(`Status atualizado para ${status}.`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível atualizar o status do sonho.');
    } finally {
      setActionLoading(null);
    }
  }

  function renderOverview(dream: AdminDreamDetail) {
    const translationEntries = Object.entries(dream.translations ?? {});

    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Resumo</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{dream.description}</p>

          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Solicitante</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{requesterLabel(dream)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Beneficiário</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{beneficiaryLabel(dream)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Localização</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{dream.locationLabel ?? 'Não informado'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Categoria</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{dream.category}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Formato</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{dream.format}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Urgência</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{dream.urgency}</dd>
            </div>
          </dl>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-950">Idioma</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Traduções são cache auxiliar. Título e descrição originais continuam como fonte de verdade.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                Original: {languageLabel(dream.originalLanguage)}
              </span>
            </div>

            {translationEntries.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {translationEntries.map(([language, translation]) => (
                  <div key={language} className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-950">{languageLabel(language)}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700">{translation.source}</span>
                    </div>
                    <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div>
                        <dt className="font-semibold text-slate-500">Criada em</dt>
                        <dd className="mt-0.5 text-slate-800">{formatDateTime(translation.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">Atualizada em</dt>
                        <dd className="mt-0.5 text-slate-800">{formatDateTime(translation.updatedAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">Revisada em</dt>
                        <dd className="mt-0.5 text-slate-800">{formatDateTime(translation.reviewedAt)}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs font-semibold text-slate-500">Nenhuma tradução em cache.</p>
            )}
          </section>
        </section>

        <aside className="space-y-4">
          <AdminActionPanel
            title="Ações rápidas"
            description="Atalhos de operação. Ações críticas ficam separadas abaixo."
            actions={[
              {
                id: 'approve',
                label: 'Aprovar sonho',
                icon: FileText,
                tone: 'primary',
                disabled: dream.status === 'publicado',
                loading: actionLoading === 'publicado',
                onClick: () => void updateStatus('publicado', 'Aprovado via painel administrativo.'),
              },
              {
                id: 'adjust',
                label: 'Solicitar ajuste',
                icon: NotebookPen,
                disabled: true,
                onClick: () => undefined,
              },
              {
                id: 'requester',
                label: 'Abrir solicitante',
                icon: UserRound,
                disabled: !dream.patientId,
                onClick: () => {
                  if (dream.patientId) navigate(`/admin/usuarios/${dream.patientId}`);
                },
              },
              {
                id: 'chats',
                label: 'Abrir conversas',
                icon: MessageCircle,
                disabled: !dream.linkedConversation,
                onClick: () => {
                  if (dream.linkedConversation) navigate(`/admin/chats/${dream.linkedConversation.id}`);
                },
              },
              {
                id: 'reports',
                label: 'Abrir denúncias',
                icon: ShieldAlert,
                disabled: (dream.relatedReports?.length ?? 0) === 0,
                onClick: () => setActiveTab('reports'),
              },
            ]}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-950">Indicadores</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-bold text-slate-950">{dream.proposalCount ?? dream.relatedProposals.length}</div>
                <div className="mt-1 text-xs text-slate-500">propostas</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-bold text-slate-950">{dream.chatCount ?? (dream.linkedConversation ? 1 : 0)}</div>
                <div className="mt-1 text-xs text-slate-500">chats</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <div className="font-bold">{dream.reportCount ?? dream.relatedReports?.length ?? 0}</div>
                <div className="mt-1 text-xs">denúncias</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    );
  }

  function renderProposals(dream: AdminDreamDetail) {
    if (dream.relatedProposals.length === 0) {
      return <AdminEmptyState title="Sem propostas" description="Nenhuma proposta relacionada foi retornada para este sonho." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Propostas relacionadas</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {dream.relatedProposals.map((proposal) => (
            <Link key={proposal.id} to={`/admin/propostas/${proposal.id}`} className="block py-4 transition hover:bg-pink-50/50">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{proposal.supporterName ?? 'Apoiador não informado'}</div>
                  <p className="mt-1 text-sm text-slate-600">{proposal.offering ?? proposal.message ?? 'Sem oferta descrita'}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(proposal.createdAt)}</p>
                </div>
                <AdminStatusBadge status={proposal.status}>{proposal.status}</AdminStatusBadge>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderConversations(dream: AdminDreamDetail) {
    if (!dream.linkedConversation) {
      return <AdminEmptyState title="Sem conversas" description="Nenhum chat relacionado foi retornado para este sonho." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Conversa relacionada</h3>
        <Link to={`/admin/chats/${dream.linkedConversation.id}`} className="mt-4 block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-pink-200 hover:bg-pink-50">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-950">Abrir conversa</div>
              <p className="mt-1 text-sm text-slate-600">
                {dream.linkedConversation.patientName ?? 'Solicitante'} com {dream.linkedConversation.supporterName ?? 'apoiador'}
              </p>
              <p className="mt-2 text-xs text-slate-500">Última interação {formatDateTime(dream.linkedConversation.lastMessageAt)}</p>
            </div>
            <AdminStatusBadge status={dream.linkedConversation.status}>{dream.linkedConversation.status}</AdminStatusBadge>
          </div>
        </Link>
      </section>
    );
  }

  function renderReports(dream: AdminDreamDetail) {
    const reports = dream.relatedReports ?? [];
    if (reports.length === 0) {
      return <AdminEmptyState title="Sem denúncias" description="Não há denúncias vinculadas a este sonho, propostas ou conversa relacionada." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Denúncias relacionadas</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {reports.map((report) => (
            <Link key={report.id} to={`/admin/denuncias/${report.id}`} className="block py-4 transition hover:bg-pink-50/50">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{report.type}</div>
                  <p className="mt-1 text-sm text-slate-600">{report.reason}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(report.createdAt)}</p>
                </div>
                <AdminStatusBadge status={report.status}>{report.status}</AdminStatusBadge>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderModeration(dream: AdminDreamDetail) {
    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminAuditTimeline
          title="Histórico de moderação"
          events={auditLogs.filter((log) => log.type === 'sonho').map((log) => ({
            id: log.id,
            title: log.action,
            description: log.details,
            actor: log.by,
            date: formatDateTime(log.date),
            status: <AdminStatusBadge status={log.outcome}>{log.outcome}</AdminStatusBadge>,
            href: log.refPath,
          }))}
          emptyTitle="Sem histórico de moderação"
          emptyDescription="Quando houver pausa, cancelamento ou alteração de status, o histórico aparecerá aqui."
        />

        <AdminSensitiveActionPanel
          title="Ações sensíveis"
          description="Ações com impacto no sonho exigem motivo e confirmação."
          errorMessage={actionError}
          successMessage={actionSuccess}
          actions={[
            {
              id: 'reject',
              title: 'Recusar sonho',
              description: 'O contrato atual não possui status rejeitado; use cancelar quando houver decisão definitiva.',
              confirmLabel: 'Recusar sonho',
              disabled: true,
              onConfirm: async () => undefined,
            },
            {
              id: 'pause',
              title: 'Suspender publicação',
              description: dream.status === 'pausado' ? 'Este sonho já está pausado.' : 'Pausa a publicação e registra motivo administrativo.',
              confirmLabel: 'Suspender publicação',
              destructive: true,
              disabled: dream.status === 'pausado',
              loading: actionLoading === 'pausado',
              requiresReason: true,
              reasonLabel: 'Motivo da suspensão',
              reasonPlaceholder: 'Explique por que a publicação deve ser suspensa.',
              reasonMinLength: 8,
              onConfirm: async (reason) => updateStatus('pausado', reason),
            },
            {
              id: 'cancel',
              title: 'Cancelar sonho',
              description: dream.status === 'cancelado' ? 'Este sonho já está cancelado.' : 'Cancela o sonho e registra decisão administrativa.',
              confirmLabel: 'Cancelar sonho',
              destructive: true,
              disabled: dream.status === 'cancelado',
              loading: actionLoading === 'cancelado',
              requiresReason: true,
              reasonLabel: 'Motivo do cancelamento',
              reasonPlaceholder: 'Explique a decisão para auditoria.',
              reasonMinLength: 8,
              onConfirm: async (reason) => updateStatus('cancelado', reason),
            },
            {
              id: 'signal',
              title: 'Sinalizar sonho',
              description: 'Ainda não há endpoint para criar sinalização manual sem alterar status.',
              confirmLabel: 'Sinalizar sonho',
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
        emptyTitle="Sem auditoria"
        emptyDescription="Nenhum evento administrativo foi encontrado para este sonho."
      />
    );
  }

  function renderActiveTab(dream: AdminDreamDetail) {
    if (activeTab === 'overview') return renderOverview(dream);
    if (activeTab === 'proposals') return renderProposals(dream);
    if (activeTab === 'conversations') return renderConversations(dream);
    if (activeTab === 'reports') return renderReports(dream);
    if (activeTab === 'moderation') return renderModeration(dream);
    return renderAudit();
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Link to="/admin/sonhos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="size-4" />
          Voltar para sonhos
        </Link>
        <AdminLoadingState title="Carregando sonho" description="Buscando resumo, propostas, conversas, denúncias e auditoria." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <Link to="/admin/sonhos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="size-4" />
          Voltar para sonhos
        </Link>
        <AdminErrorState title="Não foi possível carregar o sonho" description={error} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-5">
        <Link to="/admin/sonhos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="size-4" />
          Voltar para sonhos
        </Link>
        <AdminEmptyState title="Sonho não encontrado" description="Selecione outro sonho na listagem administrativa." />
      </div>
    );
  }

  const risk = dreamRisk(detail);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate('/admin/sonhos')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="size-4" />
        Voltar para sonhos
      </button>

      <AdminDetailHeader
        title={detail.title}
        subtitle={<span>{detail.description}</span>}
        status={<AdminStatusBadge status={detail.status}>{detail.status}</AdminStatusBadge>}
        risk={<AdminRiskBadge level={risk.level} label={risk.label} />}
        metadata={[
          { label: 'Solicitante', value: requesterLabel(detail) },
          { label: 'Beneficiário', value: beneficiaryLabel(detail) },
          { label: 'Localização', value: detail.locationLabel ?? 'Não informado' },
          { label: 'Atualizado em', value: formatDateTime(detail.updatedAt) },
        ]}
        actions={
          detail.patientId ? (
            <Link
              to={`/admin/usuarios/${detail.patientId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm font-semibold text-pink-800 transition hover:bg-pink-50"
            >
              Abrir solicitante
              <ExternalLink className="size-4" />
            </Link>
          ) : undefined
        }
      />

      {actionError && <AdminErrorState title="Ação não concluída" description={actionError} />}

      <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {renderActiveTab(detail)}

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <Ban className="mt-0.5 size-4" />
          <div>
            <div className="font-semibold">Sem dados inventados</div>
            <p className="mt-1 text-amber-800">
              Solicitação de ajuste e sinalização manual aparecem como indisponíveis porque ainda não há contrato backend específico.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
