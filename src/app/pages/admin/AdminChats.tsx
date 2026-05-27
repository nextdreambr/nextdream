import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  AlertTriangle,
  Clock3,
  ExternalLink,
  FileWarning,
  History,
  NotebookPen,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { AdminAuditLog, AdminChatDetail, AdminChatSummary, ApiError, adminApi } from '../../lib/api';
import {
  AdminActionPanel,
  AdminAuditTimeline,
  AdminDetailHeader,
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminListToolbar,
  AdminLoadingState,
  AdminPageHeader,
  AdminPagination,
  AdminRiskBadge,
  AdminSearchInput,
  AdminSensitiveActionPanel,
  AdminStatusBadge,
  type AdminFilterField,
  type AdminRiskLevel,
} from './components';

type BooleanFilter = 'true' | 'false' | '';
type ChatRiskFilter = 'high' | 'medium' | 'low' | '';
type UnansweredFilter = '24h' | '72h' | '7d' | '';

function matchesChatAudit(log: AdminAuditLog, chatId: string) {
  const haystack = [log.refId, log.target, log.details, log.refPath].filter(Boolean).join(' ');
  return haystack.includes(chatId) || (log.type === 'chat' && log.refId === chatId);
}

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

function chatRisk(chat: Pick<AdminChatSummary, 'hasModeratedMessages' | 'hasModerationReport'>): {
  level: AdminRiskLevel;
  label: string;
  description: string;
} {
  if (chat.hasModeratedMessages && chat.hasModerationReport) {
    return {
      level: 'high',
      label: 'Risco alto',
      description: 'Mensagem moderada e denúncia vinculada',
    };
  }

  if (chat.hasModeratedMessages || chat.hasModerationReport) {
    return {
      level: 'medium',
      label: 'Risco médio',
      description: chat.hasModerationReport ? 'Denúncia vinculada' : 'Mensagem moderada',
    };
  }

  return {
    level: 'low',
    label: 'Risco baixo',
    description: 'Sem alerta registrado',
  };
}

function lastActivityLabel(chat: Pick<AdminChatSummary, 'lastMessageAt' | 'createdAt'>) {
  const activityDate = chat.lastMessageAt ?? chat.createdAt;
  const timestamp = new Date(activityDate).getTime();

  if (Number.isNaN(timestamp)) return 'Sem atividade registrada';

  const diffMs = Date.now() - timestamp;
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return 'Atividade recente';
  if (diffHours < 24) return `Sem resposta há ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? 'Sem resposta há 1 dia' : `Sem resposta há ${diffDays} dias`;
}

function participantLine(chat: Pick<AdminChatSummary, 'patientName' | 'supporterName' | 'institutionName'>) {
  const requester = chat.patientName ?? chat.institutionName ?? 'Solicitante não informado';
  const supporter = chat.supporterName ?? 'Apoiador não informado';
  return `${requester} com ${supporter}`;
}

function messagePreview(chat: AdminChatSummary) {
  return chat.lastMessagePreview?.trim() || 'Sem mensagem retornada na listagem.';
}

function chronologicalMessages(detail: AdminChatDetail) {
  return [...detail.latestMessages].sort((first, second) => {
    return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
  });
}

export default function AdminChats() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId?: string }>();
  const [items, setItems] = useState<AdminChatSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AdminChatSummary['status'] | ''>('');
  const [report, setReport] = useState<BooleanFilter>('');
  const [risk, setRisk] = useState<ChatRiskFilter>('');
  const [unanswered, setUnanswered] = useState<UnansweredFilter>('');
  const [entity, setEntity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detail, setDetail] = useState<AdminChatDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadChats() {
      setLoading(true);
      setError('');

      try {
        const response = await adminApi.listChats({
          page,
          pageSize,
          query,
          status,
          report,
          risk,
          unanswered,
          entity,
          dateFrom,
          dateTo,
        });
        if (mounted) {
          setItems(response.items);
          setTotal(response.total);
          setTotalPages(response.totalPages);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os chats.');
          setItems([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadChats();

    return () => {
      mounted = false;
    };
  }, [page, pageSize, query, status, report, risk, unanswered, entity, dateFrom, dateTo, reloadToken]);

  useEffect(() => {
    let mounted = true;

    async function loadDetail(selectedChatId: string) {
      setDetailLoading(true);
      setDetailError('');
      setActionError('');
      setActionSuccess('');
      setDetail(null);

      try {
        const [chatDetail, logs] = await Promise.all([
          adminApi.getChatDetail(selectedChatId),
          Promise.resolve(adminApi.listAudit()).catch(() => []),
        ]);
        if (mounted) {
          setDetail(chatDetail);
          setAuditLogs(Array.isArray(logs) ? logs.filter((log) => matchesChatAudit(log, selectedChatId)) : []);
        }
      } catch (err) {
        if (mounted) {
          setDetailError(err instanceof ApiError ? err.message : 'Não foi possível carregar os detalhes do chat.');
          setAuditLogs([]);
        }
      } finally {
        if (mounted) {
          setDetailLoading(false);
        }
      }
    }

    if (chatId) {
      void loadDetail(chatId);
    } else {
      setDetail(null);
      setDetailError('');
      setAuditLogs([]);
      setActionError('');
      setActionSuccess('');
    }

    return () => {
      mounted = false;
    };
  }, [chatId]);

  const selectedSummary = useMemo(() => items.find((item) => item.id === chatId) ?? null, [items, chatId]);
  const hasActiveFilters = Boolean(query || status || report || risk || unanswered || entity || dateFrom || dateTo);

  const filterFields: AdminFilterField[] = [
    {
      id: 'status',
      label: 'Status',
      value: status,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'ativa', label: 'Ativa' },
        { value: 'encerrada', label: 'Encerrada' },
      ],
      onChange: (value) => {
        setPage(1);
        setStatus(value as AdminChatSummary['status'] | '');
      },
    },
    {
      id: 'report',
      label: 'Com denúncia',
      value: report,
      type: 'select',
      options: [
        { value: '', label: 'Todas' },
        { value: 'true', label: 'Com denúncia' },
        { value: 'false', label: 'Sem denúncia' },
      ],
      onChange: (value) => {
        setPage(1);
        setReport(value as BooleanFilter);
      },
    },
    {
      id: 'risk',
      label: 'Risco',
      value: risk,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'high', label: 'Alto' },
        { value: 'medium', label: 'Médio' },
        { value: 'low', label: 'Baixo' },
      ],
      onChange: (value) => {
        setPage(1);
        setRisk(value as ChatRiskFilter);
      },
    },
    {
      id: 'unanswered',
      label: 'Tempo sem resposta',
      value: unanswered,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: '24h', label: 'Mais de 24h' },
        { value: '72h', label: 'Mais de 72h' },
        { value: '7d', label: 'Mais de 7 dias' },
      ],
      onChange: (value) => {
        setPage(1);
        setUnanswered(value as UnansweredFilter);
      },
    },
    {
      id: 'entity',
      label: 'Entidade relacionada',
      value: entity,
      placeholder: 'Sonho, instituição ou participante',
      onChange: (value) => {
        setPage(1);
        setEntity(value);
      },
    },
    {
      id: 'dateFrom',
      label: 'De',
      value: dateFrom,
      type: 'date',
      onChange: (value) => {
        setPage(1);
        setDateFrom(value);
      },
    },
    {
      id: 'dateTo',
      label: 'Até',
      value: dateTo,
      type: 'date',
      onChange: (value) => {
        setPage(1);
        setDateTo(value);
      },
    },
  ];

  function resetFilters() {
    setPage(1);
    setQuery('');
    setStatus('');
    setReport('');
    setRisk('');
    setUnanswered('');
    setEntity('');
    setDateFrom('');
    setDateTo('');
  }

  async function handleCloseChat(reason?: string) {
    if (!detail) return;

    setActionLoading('close');
    setActionError('');
    setActionSuccess('');

    try {
      await adminApi.closeChat(detail.id, reason ?? 'Encerrado por moderação administrativa.');
      setItems((current) => current.map((item) => (item.id === detail.id ? { ...item, status: 'encerrada' } : item)));
      const updated = await adminApi.getChatDetail(detail.id);
      setDetail(updated);
      setActionSuccess('Conversa encerrada e registrada na auditoria.');
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível encerrar o chat.');
    } finally {
      setActionLoading(null);
    }
  }

  function renderChatList() {
    if (loading) {
      return <AdminLoadingState title="Carregando conversas" description="Buscando chats, sinalizações e vínculos relacionados." />;
    }

    if (error) {
      return (
        <AdminErrorState
          title="Não foi possível carregar os chats"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => setReloadToken((current) => current + 1)}
        />
      );
    }

    if (items.length === 0) {
      return (
        <AdminEmptyState
          title={hasActiveFilters ? 'Nenhuma conversa encontrada' : 'Nenhum chat registrado'}
          description={
            hasActiveFilters
              ? 'Ajuste busca, risco, denúncia ou período para ampliar a investigação.'
              : 'Quando houver conversas entre solicitantes e apoiadores, elas aparecerão aqui.'
          }
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      );
    }

    return (
      <div className="space-y-2">
        {items.map((chat) => {
          const selected = chat.id === chatId;
          const riskState = chatRisk(chat);

          return (
            <button
              key={chat.id}
              type="button"
              onClick={() => navigate(`/admin/chats/${chat.id}`)}
              aria-pressed={selected}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selected
                  ? 'border-pink-300 bg-pink-50 shadow-sm ring-2 ring-pink-100'
                  : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-[#fffaf8]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-950">{chat.dreamTitle ?? chat.id}</div>
                  <div className="mt-1 truncate text-xs text-slate-500">{participantLine(chat)}</div>
                </div>
                <AdminStatusBadge status={chat.status}>{chat.status}</AdminStatusBadge>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-700">{messagePreview(chat)}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AdminRiskBadge level={riskState.level} label={riskState.label} />
                {chat.hasModerationReport && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    <FileWarning className="size-3.5" />
                    Denúncia
                  </span>
                )}
              </div>

              <div className="mt-3 grid gap-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" />
                  Última atividade: {formatDateTime(chat.lastMessageAt)}
                </span>
                <span>{lastActivityLabel(chat)}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function renderDetail() {
    if (!chatId) {
      return (
        <div className="flex min-h-[620px] items-center justify-center p-8">
          <AdminEmptyState
            title="Selecione uma conversa"
            description="A lista permanece ao lado para comparação enquanto mensagens, sonho, denúncias e ações abrem nesta área."
          />
        </div>
      );
    }

    if (detailLoading) {
      return (
        <div className="p-5">
          <AdminLoadingState title="Carregando conversa" description="Buscando mensagens, participantes e denúncias relacionadas." />
        </div>
      );
    }

    if (detailError) {
      return (
        <div className="p-5">
          <AdminErrorState
            title="Não foi possível carregar a conversa"
            description={detailError}
            actionLabel="Voltar para lista"
            onAction={() => navigate('/admin/chats')}
          />
        </div>
      );
    }

    if (!detail) {
      return (
        <div className="p-5">
          <AdminEmptyState title="Conversa não carregada" description="Selecione outro chat ou atualize a listagem." />
        </div>
      );
    }

    const riskState = chatRisk(detail);
    const messages = chronologicalMessages(detail);
    const reportHref = detail.moderationReports[0]?.id
      ? `/admin/denuncias/${detail.moderationReports[0].id}`
      : '/admin/denuncias';

    return (
      <div className="space-y-5 p-5">
        <AdminDetailHeader
          title={detail.dreamTitle ?? selectedSummary?.dreamTitle ?? 'Chat administrativo'}
          subtitle={
            <span>
              {participantLine(detail)}. A conversa fica visível em área dedicada para investigação sem abrir modal.
            </span>
          }
          status={<AdminStatusBadge status={detail.status}>{detail.status}</AdminStatusBadge>}
          risk={<AdminRiskBadge level={riskState.level} label={riskState.label} />}
          actions={
            <Link
              to={`/admin/sonhos/${detail.dreamId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm font-semibold text-pink-800 transition hover:bg-pink-50"
            >
              Ver sonho
              <ExternalLink className="size-4" />
            </Link>
          }
          metadata={[
            { label: 'Participantes', value: participantLine(detail) },
            { label: 'Mensagens', value: detail.messageCount },
            { label: 'Última atividade', value: formatDateTime(detail.lastMessageAt) },
            { label: 'Criado em', value: formatDateTime(detail.createdAt) },
          ]}
        />

        {(detail.hasModeratedMessages || detail.hasModerationReport) && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              Moderação detectada
            </div>
            <p className="mt-1 text-amber-800">{riskState.description}. Revise mensagens, denúncias e histórico antes de agir.</p>
          </section>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-label="Mensagens do chat" className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Conversa</h3>
                  <p className="mt-1 text-sm text-slate-500">Mensagens em ordem cronológica, com sinalização de moderação quando houver.</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {messages.length} retornadas
                </span>
              </div>
            </div>

            <div className="space-y-3 p-5">
              {messages.length === 0 ? (
                <AdminEmptyState
                  title="Conversa sem mensagens"
                  description="O contrato atual não retornou mensagens para este chat."
                />
              ) : (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-2xl border p-4 ${
                      message.moderated ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{message.senderName ?? 'Participante'}</div>
                        <div className="mt-1 text-xs text-slate-500">{formatDateTime(message.createdAt)}</div>
                      </div>
                      {message.moderated && <AdminStatusBadge status="em-analise">Moderada</AdminStatusBadge>}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.body}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <AdminActionPanel
              title="Ações rápidas"
              description="Atalhos de investigação. Ações críticas ficam separadas abaixo."
              actions={[
                {
                  id: 'note',
                  label: 'Adicionar nota interna',
                  icon: NotebookPen,
                  disabled: true,
                  onClick: () => undefined,
                },
                {
                  id: 'dream',
                  label: 'Ver sonho',
                  icon: ExternalLink,
                  onClick: () => navigate(`/admin/sonhos/${detail.dreamId}`),
                },
                {
                  id: 'reports',
                  label: 'Ver denúncias',
                  icon: FileWarning,
                  onClick: () => navigate(reportHref),
                },
                {
                  id: 'audit',
                  label: 'Abrir auditoria',
                  icon: History,
                  onClick: () => navigate('/admin/auditoria'),
                },
              ]}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-950">Contexto do sonho</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Sonho relacionado</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{detail.dreamTitle ?? 'Não informado'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Solicitante</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{detail.patientName ?? 'Não informado'}</dd>
                </div>
                {detail.institutionName && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Instituição</dt>
                    <dd className="mt-1 font-semibold text-slate-950">{detail.institutionName}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-slate-500">Apoiador</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{detail.supporterName ?? 'Não informado'}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-950">Participantes</h3>
              <div className="mt-4 space-y-3">
                <Link
                  to={`/admin/usuarios/${detail.patientId}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-pink-200 hover:bg-pink-50"
                >
                  <span>
                    <span className="block font-semibold text-slate-950">{detail.patientName ?? 'Solicitante'}</span>
                    <span className="text-slate-500">Solicitante ou instituição</span>
                  </span>
                  <UserRound className="size-4 text-slate-400" />
                </Link>
                <Link
                  to={`/admin/usuarios/${detail.supporterId}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-pink-200 hover:bg-pink-50"
                >
                  <span>
                    <span className="block font-semibold text-slate-950">{detail.supporterName ?? 'Apoiador'}</span>
                    <span className="text-slate-500">Apoiador</span>
                  </span>
                  <UserRound className="size-4 text-slate-400" />
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Denúncias relacionadas</h3>
                  <p className="mt-1 text-sm text-slate-500">Abrir denúncia usa página própria e preserva o contexto do chat.</p>
                </div>
                <ShieldCheck className="size-5 text-slate-400" />
              </div>
              <div className="mt-4 space-y-3">
                {detail.moderationReports.length === 0 ? (
                  <AdminEmptyState title="Nenhuma denúncia relacionada" description="Não há denúncia vinculada ao chat no contrato atual." />
                ) : (
                  detail.moderationReports.map((currentReport) => (
                    <Link
                      key={currentReport.id}
                      to={`/admin/denuncias/${currentReport.id}`}
                      className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-pink-200 hover:bg-pink-50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-950">{currentReport.type}</div>
                        <AdminStatusBadge status={currentReport.status}>{currentReport.status}</AdminStatusBadge>
                      </div>
                      <p className="mt-2 text-sm leading-5 text-slate-700">{currentReport.reason}</p>
                      <div className="mt-2 text-xs text-slate-500">{formatDateTime(currentReport.createdAt)}</div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-950">Notas internas</h3>
              <div className="mt-4">
                <AdminEmptyState
                  title="Nenhuma nota interna"
                  description="O contrato atual ainda não persiste notas internas por chat."
                />
              </div>
            </section>

            <AdminSensitiveActionPanel
              title="Ações sensíveis"
              description="Use apenas quando o contexto da conversa justificar a intervenção. A ação real disponível hoje é encerrar conversa."
              errorMessage={actionError}
              successMessage={actionSuccess}
              actions={[
                {
                  id: 'close',
                  title: 'Encerrar conversa',
                  description: detail.status === 'encerrada'
                    ? 'Esta conversa já está encerrada.'
                    : 'Encerra a conversa e cria denúncia administrativa vinculada ao chat.',
                  confirmLabel: 'Encerrar conversa',
                  destructive: true,
                  disabled: detail.status === 'encerrada',
                  loading: actionLoading === 'close',
                  requiresReason: true,
                  reasonLabel: 'Motivo do encerramento',
                  reasonPlaceholder: 'Explique o motivo para auditoria e rastreabilidade.',
                  reasonMinLength: 8,
                  onConfirm: handleCloseChat,
                },
                {
                  id: 'signal',
                  title: 'Sinalizar conversa',
                  description: 'Ainda não há endpoint para criar sinalização manual sem encerrar a conversa.',
                  confirmLabel: 'Sinalizar conversa',
                  disabled: true,
                  onConfirm: async () => undefined,
                },
                {
                  id: 'block',
                  title: 'Bloquear participante',
                  description: 'Bloqueio contextual de participante ainda depende de contrato backend específico.',
                  confirmLabel: 'Bloquear participante',
                  disabled: true,
                  onConfirm: async () => undefined,
                },
                {
                  id: 'escalate',
                  title: 'Escalar denúncia',
                  description: 'Escalonamento estruturado de denúncia ainda não existe no contrato atual.',
                  confirmLabel: 'Escalar denúncia',
                  disabled: true,
                  onConfirm: async () => undefined,
                },
              ]}
            />
          </aside>
        </div>

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
          emptyTitle="Nenhum histórico administrativo"
          emptyDescription="Ainda não há ação administrativa registrada especificamente para este chat."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Moderação"
        title="Chats"
        subtitle="Central operacional para investigar conversas sensíveis com lista, mensagens, sonho, participantes, denúncias e auditoria no mesmo fluxo."
        meta={
          <>
            <span>{total} conversas encontradas</span>
            <span>Sem modal para leitura ou investigação</span>
          </>
        }
      />

      <div className="grid gap-5 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <AdminListToolbar
            title="Conversas"
            description="Busca e filtros são enviados para a API administrativa."
            totalLabel={loading ? 'Carregando total' : `${total} conversas`}
            search={
              <AdminSearchInput
                value={query}
                onChange={(value) => {
                  setPage(1);
                  setQuery(value);
                }}
                placeholder="Buscar por sonho, participante ou mensagem"
                debounceMs={250}
              />
            }
            filters={<AdminFilters fields={filterFields} className="md:grid-cols-2 2xl:grid-cols-1" />}
            actions={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpar filtros
                </button>
              ) : undefined
            }
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {renderChatList()}
            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              disabled={loading}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPage(1);
                setPageSize(nextPageSize);
              }}
            />
          </section>
        </aside>

        <main className="min-h-[720px] rounded-2xl border border-slate-200 bg-white shadow-sm">{renderDetail()}</main>
      </div>
    </div>
  );
}
