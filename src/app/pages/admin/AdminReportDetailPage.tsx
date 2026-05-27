import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Ban,
  ExternalLink,
  FileWarning,
  History,
  MessageCircle,
  NotebookPen,
  ShieldAlert,
  UserRound,
  XCircle,
} from 'lucide-react';
import { AdminAuditLog, AdminReportDetail, AdminReportSeverity, ApiError, adminApi } from '../../lib/api';
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
  type AdminRiskLevel,
} from './components';

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

function severityBadge(severity?: AdminReportSeverity): { level: AdminRiskLevel; label: string } {
  if (severity === 'critical') return { level: 'critical', label: 'Crítica' };
  if (severity === 'high') return { level: 'high', label: 'Risco alto' };
  if (severity === 'medium') return { level: 'medium', label: 'Risco médio' };
  return { level: 'low', label: 'Risco baixo' };
}

function targetTypeLabel(value: string) {
  const labels: Record<string, string> = {
    chat: 'Chat',
    message: 'Mensagem',
    dream: 'Sonho',
    proposal: 'Proposta',
    user: 'Usuário',
  };
  return labels[value] ?? value;
}

function targetHref(detail: AdminReportDetail) {
  if (detail.targetSummary?.chatId) return `/admin/chats/${detail.targetSummary.chatId}`;
  if (detail.targetSummary?.conversationId) return `/admin/chats/${detail.targetSummary.conversationId}`;
  if (detail.targetSummary?.dreamId) return `/admin/sonhos/${detail.targetSummary.dreamId}`;
  if (detail.targetSummary?.proposalId) return `/admin/propostas/${detail.targetSummary.proposalId}`;
  if (detail.targetSummary?.targetUserId) return `/admin/usuarios/${detail.targetSummary.targetUserId}`;
  if (detail.targetType === 'chat') return `/admin/chats/${detail.targetId}`;
  if (detail.targetType === 'dream') return `/admin/sonhos/${detail.targetId}`;
  if (detail.targetType === 'proposal') return `/admin/propostas/${detail.targetId}`;
  if (detail.targetType === 'user') return `/admin/usuarios/${detail.targetId}`;
  return '';
}

function chatIdFromReport(detail: AdminReportDetail) {
  return detail.targetSummary?.chatId ?? detail.targetSummary?.conversationId ?? (detail.targetType === 'chat' ? detail.targetId : '');
}

function auditMentionsReport(log: AdminAuditLog, detail: AdminReportDetail) {
  const haystack = [log.refId, log.refPath, log.action, log.target, log.type, log.details].filter(Boolean).join(' ');
  return haystack.includes(detail.id) || haystack.includes(detail.targetId);
}

function entityLabel(detail: AdminReportDetail) {
  return (
    detail.entityLabel ??
    detail.targetSummary?.dreamTitle ??
    detail.targetSummary?.targetUserName ??
    detail.targetSummary?.senderName ??
    detail.targetSummary?.body ??
    `${targetTypeLabel(detail.targetType)} ${detail.targetId}`
  );
}

function accusedLabel(detail: AdminReportDetail) {
  return (
    detail.accusedName ??
    detail.targetSummary?.targetUserName ??
    detail.targetSummary?.senderName ??
    detail.targetSummary?.supporterName ??
    detail.targetSummary?.patientName ??
    'Não informado'
  );
}

export default function AdminReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const [detail, setDetail] = useState<AdminReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
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
          adminApi.getReportDetail(id),
          Promise.resolve(adminApi.listAudit()).catch(() => []),
        ]);
        if (mounted) {
          setDetail(response);
          setAuditLogs(Array.isArray(logs) ? logs.filter((log) => auditMentionsReport(log, response)) : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a denúncia.');
          setAuditLogs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (reportId) void loadDetail(reportId);

    return () => {
      mounted = false;
    };
  }, [reportId]);

  const relatedHref = useMemo(() => (detail ? targetHref(detail) : ''), [detail]);

  async function refreshCurrentDetail() {
    if (!reportId) return;
    const [updated, logs] = await Promise.all([
      adminApi.getReportDetail(reportId),
      Promise.resolve(adminApi.listAudit()).catch(() => []),
    ]);
    setDetail(updated);
    setAuditLogs(Array.isArray(logs) ? logs.filter((log) => auditMentionsReport(log, updated)) : []);
  }

  async function updateReportStatus(status: AdminReportDetail['status'], resolution?: string) {
    if (!reportId) return;

    setActionLoading(status);
    setActionError('');
    setActionSuccess('');

    try {
      await adminApi.updateReportStatus(reportId, status, resolution);
      await refreshCurrentDetail();
      setActionSuccess(status === 'resolvido' ? 'Denúncia resolvida e registrada em auditoria.' : 'Denúncia escalada para análise.');
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível atualizar a denúncia.');
    } finally {
      setActionLoading(null);
    }
  }

  async function closeRelatedChat(reason?: string) {
    if (!detail) return;
    const chatId = chatIdFromReport(detail);
    if (!chatId) return;

    setActionLoading('close-chat');
    setActionError('');
    setActionSuccess('');

    try {
      await adminApi.closeChat(chatId, reason ?? 'Encerrado a partir de denúncia administrativa.');
      await refreshCurrentDetail();
      setActionSuccess('Chat encerrado e registrado na auditoria.');
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível encerrar o chat relacionado.');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Link to="/admin/denuncias" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="size-4" />
          Voltar para denúncias
        </Link>
        <AdminLoadingState title="Carregando denúncia" description="Buscando severidade, entidade relacionada e histórico." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <Link to="/admin/denuncias" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="size-4" />
          Voltar para denúncias
        </Link>
        <AdminErrorState title="Não foi possível carregar a denúncia" description={error} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-5">
        <Link to="/admin/denuncias" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="size-4" />
          Voltar para denúncias
        </Link>
        <AdminEmptyState title="Denúncia não encontrada" description="Selecione outro caso na central de denúncias." />
      </div>
    );
  }

  const severity = severityBadge(detail.severity);
  const chatId = chatIdFromReport(detail);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate('/admin/denuncias')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="size-4" />
        Voltar para denúncias
      </button>

      <AdminDetailHeader
        title={`Denúncia ${detail.type}`}
        subtitle={<span>{detail.reason}</span>}
        status={<AdminStatusBadge status={detail.status}>{detail.status}</AdminStatusBadge>}
        risk={<AdminRiskBadge level={severity.level} label={severity.label} />}
        metadata={[
          { label: 'Tipo', value: detail.type },
          { label: 'Alvo', value: `${targetTypeLabel(detail.targetType)} ${detail.targetId}` },
          { label: 'Criada em', value: formatDateTime(detail.createdAt) },
          { label: 'Última atualização', value: formatDateTime(detail.updatedAt ?? detail.resolvedAt ?? detail.createdAt) },
        ]}
        actions={
          relatedHref ? (
            <Link
              to={relatedHref}
              className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm font-semibold text-pink-800 transition hover:bg-pink-50"
            >
              Abrir entidade
              <ExternalLink className="size-4" />
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <FileWarning className="mt-0.5 size-5 text-pink-700" />
              <div>
                <h2 className="text-base font-semibold text-slate-950">Resumo da denúncia</h2>
                <p className="mt-1 text-sm text-slate-500">Contexto para decisão antes de qualquer ação sensível.</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">Descrição</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-800">{detail.reason}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Entidade relacionada</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{entityLabel(detail)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Denunciante</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{detail.reporterName ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Denunciado</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{accusedLabel(detail)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Responsável</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">{detail.responsibleName ?? 'Não atribuído'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Resolução</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-800">{detail.resolution ?? 'Sem resolução registrada.'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-5 text-amber-600" />
              <div>
                <h2 className="text-base font-semibold text-slate-950">Entidades relacionadas</h2>
                <p className="mt-1 text-sm text-slate-500">Navegação direta para investigar sem modal.</p>
              </div>
            </div>

            {!detail.targetSummary && (
              <div className="mt-4">
                <AdminEmptyState title="Sem entidade relacionada" description="O alvo existe na denúncia, mas o contrato não retornou um resumo da entidade." />
              </div>
            )}

            {detail.targetSummary && (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">Sonho relacionado</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{detail.targetSummary.dreamTitle ?? 'Não informado'}</div>
                  {detail.targetSummary.dreamId && (
                    <Link to={`/admin/sonhos/${detail.targetSummary.dreamId}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pink-700 hover:text-pink-800">
                      Abrir sonho
                      <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">Chat relacionado</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{chatId || 'Não informado'}</div>
                  {chatId && (
                    <Link to={`/admin/chats/${chatId}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pink-700 hover:text-pink-800">
                      Abrir chat
                      <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">Solicitante</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{detail.targetSummary.patientName ?? 'Não informado'}</div>
                  {detail.targetSummary.patientId && (
                    <Link to={`/admin/usuarios/${detail.targetSummary.patientId}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pink-700 hover:text-pink-800">
                      Abrir usuário
                      <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">Apoiador</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{detail.targetSummary.supporterName ?? 'Não informado'}</div>
                  {detail.targetSummary.supporterId && (
                    <Link to={`/admin/usuarios/${detail.targetSummary.supporterId}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pink-700 hover:text-pink-800">
                      Abrir usuário
                      <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </div>

                {detail.targetSummary.proposalId && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-medium text-slate-500">Proposta relacionada</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{detail.targetSummary.proposalId}</div>
                    <Link to={`/admin/propostas/${detail.targetSummary.proposalId}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pink-700 hover:text-pink-800">
                      Abrir proposta
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

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
            emptyTitle="Denúncia sem histórico"
            emptyDescription="Nenhuma ação administrativa foi registrada para esta denúncia até agora."
          />
        </main>

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
                id: 'reporter',
                label: 'Abrir usuário denunciante',
                icon: UserRound,
                disabled: true,
                onClick: () => undefined,
              },
              {
                id: 'accused',
                label: 'Abrir usuário denunciado',
                icon: UserRound,
                disabled: !detail.targetSummary?.senderId && !detail.targetSummary?.supporterId && !detail.targetSummary?.patientId,
                onClick: () => {
                  const userId = detail.targetSummary?.senderId ?? detail.targetSummary?.supporterId ?? detail.targetSummary?.patientId;
                  if (userId) navigate(`/admin/usuarios/${userId}`);
                },
              },
              {
                id: 'chat',
                label: 'Abrir chat',
                icon: MessageCircle,
                disabled: !chatId,
                onClick: () => {
                  if (chatId) navigate(`/admin/chats/${chatId}`);
                },
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
            <h2 className="text-base font-semibold text-slate-950">Notas internas</h2>
            <div className="mt-4">
              <AdminEmptyState
                title="Denúncia sem notas"
                description="O contrato atual ainda não persiste notas internas por denúncia."
              />
            </div>
          </section>

          <AdminSensitiveActionPanel
            title="Ações sensíveis"
            description="Confirme apenas depois de revisar contexto, entidade relacionada e histórico."
            errorMessage={actionError}
            successMessage={actionSuccess}
            actions={[
              {
                id: 'resolve',
                title: 'Marcar como resolvida',
                description: detail.status === 'resolvido'
                  ? 'Esta denúncia já possui status resolvido.'
                  : 'Registra resolução e cria trilha de auditoria para o caso.',
                confirmLabel: 'Resolver denúncia',
                destructive: false,
                disabled: detail.status === 'resolvido',
                loading: actionLoading === 'resolvido',
                requiresReason: true,
                reasonLabel: 'Resolução',
                reasonPlaceholder: 'Explique a decisão tomada para este caso.',
                reasonMinLength: 8,
                onConfirm: async (reason) => updateReportStatus('resolvido', reason),
              },
              {
                id: 'escalate',
                title: 'Escalar denúncia',
                description: 'Move a denúncia para em análise e registra o motivo da escalada.',
                confirmLabel: 'Escalar para análise',
                destructive: false,
                disabled: detail.status === 'em-analise' || detail.status === 'resolvido',
                loading: actionLoading === 'em-analise',
                requiresReason: true,
                reasonLabel: 'Motivo da escalada',
                reasonPlaceholder: 'Explique por que este caso precisa de análise.',
                reasonMinLength: 8,
                onConfirm: async (reason) => updateReportStatus('em-analise', reason),
              },
              {
                id: 'reject',
                title: 'Rejeitar denúncia',
                description: 'O status rejeitado ainda não existe no contrato atual de denúncias.',
                confirmLabel: 'Rejeitar denúncia',
                disabled: true,
                onConfirm: async () => undefined,
              },
              {
                id: 'suspend',
                title: 'Suspender usuário',
                description: 'Suspensão exige seleção explícita de usuário e contrato de caso ainda não disponível nesta tela.',
                confirmLabel: 'Suspender usuário',
                disabled: true,
                onConfirm: async () => undefined,
              },
              {
                id: 'block',
                title: 'Bloquear interação',
                description: 'Bloqueio de interação ainda não existe como endpoint administrativo.',
                confirmLabel: 'Bloquear interação',
                disabled: true,
                onConfirm: async () => undefined,
              },
              {
                id: 'close-chat',
                title: 'Encerrar chat relacionado',
                description: chatId
                  ? 'Encerra o chat relacionado e registra uma ação administrativa.'
                  : 'Esta denúncia não possui chat relacionado para encerrar.',
                confirmLabel: 'Encerrar chat',
                disabled: !chatId,
                loading: actionLoading === 'close-chat',
                requiresReason: true,
                reasonLabel: 'Motivo do encerramento',
                reasonPlaceholder: 'Explique por que o chat deve ser encerrado.',
                reasonMinLength: 8,
                onConfirm: closeRelatedChat,
              },
            ]}
          />

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <Ban className="mt-0.5 size-4" />
              <div>
                <div className="font-semibold">Sem dados inventados</div>
                <p className="mt-1 text-amber-800">
                  Denunciante, responsável e notas internas aparecem como indisponíveis quando o contrato não retorna esses dados.
                </p>
              </div>
            </div>
          </section>

          {detail.status === 'resolvido' && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="font-semibold">Resolução registrada</div>
              <p className="mt-1 text-emerald-800">{detail.resolution ?? 'Caso marcado como resolvido.'}</p>
              <p className="mt-2 text-xs text-emerald-700">Resolvida em {formatDateTime(detail.resolvedAt)}</p>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 size-4 text-slate-400" />
              <div>
                <h2 className="text-base font-semibold text-slate-950">Ausências do contrato</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Severidade ainda é calculada, não persistida. Rejeição formal, owner do caso e notas internas precisam de suporte backend.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
