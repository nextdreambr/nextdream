import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  KeyRound,
  Mail,
  MapPin,
  MessageCircle,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import {
  ApiError,
  AdminAuditLog,
  AdminPasswordResetResult,
  AdminReportSummary,
  AdminUser,
  AdminUserDetail,
  UpdateAdminUserInput,
  adminApi,
} from '../../lib/api';
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
  AdminTabs,
  ConfirmActionDialog,
  type AdminFilterField,
  type AdminRiskLevel,
  type AdminTabItem,
} from './components';

type UserTab = 'overview' | 'dreams' | 'proposals' | 'conversations' | 'reports' | 'audit';
type AccountStatusFilter = 'ativo' | 'suspenso' | '';
type ApprovalFilter = 'aprovado' | 'pendente' | '';
type VerificationFilter = 'verificado' | 'pendente' | '';

type ConfirmationState = {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
};

type EditFormState = {
  name: string;
  email: string;
  state: string;
  city: string;
  verified: boolean;
  approved: boolean;
  institutionType: string;
  institutionResponsibleName: string;
  institutionResponsiblePhone: string;
  institutionDescription: string;
};

const emptyEditForm: EditFormState = {
  name: '',
  email: '',
  state: '',
  city: '',
  verified: false,
  approved: false,
  institutionType: '',
  institutionResponsibleName: '',
  institutionResponsiblePhone: '',
  institutionDescription: '',
};

const userTabs: AdminTabItem<UserTab>[] = [
  { id: 'overview', label: 'Visão geral', icon: UserRound },
  { id: 'dreams', label: 'Sonhos', icon: FileText },
  { id: 'proposals', label: 'Propostas', icon: ClipboardList },
  { id: 'conversations', label: 'Conversas', icon: MessageCircle },
  { id: 'reports', label: 'Denúncias', icon: ShieldAlert },
  { id: 'audit', label: 'Auditoria', icon: History },
];

function buildLocationLabel(city?: string, state?: string) {
  if (city && state) return `${city}, ${state}`;
  return city || state || '';
}

function toUserSummary(detail: AdminUserDetail): AdminUser {
  return {
    id: detail.id,
    name: detail.name,
    email: detail.email,
    role: detail.role,
    state: detail.state,
    city: detail.city,
    locationLabel: buildLocationLabel(detail.city, detail.state),
    verified: detail.verified,
    approved: detail.approved,
    approvedAt: detail.approvedAt,
    suspended: detail.suspended,
    suspensionReason: detail.suspensionReason ?? undefined,
    suspendedAt: detail.suspendedAt ?? undefined,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}

function normalizeUserDetail(detail: AdminUserDetail): AdminUserDetail {
  return {
    ...detail,
    activitySummary: detail.activitySummary ?? {},
    recentDreams: Array.isArray(detail.recentDreams) ? detail.recentDreams : [],
    recentProposals: Array.isArray(detail.recentProposals) ? detail.recentProposals : [],
    recentConversations: Array.isArray(detail.recentConversations) ? detail.recentConversations : [],
  };
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

function roleLabel(role: AdminUser['role']) {
  if (role === 'instituicao') return 'Instituição';
  if (role === 'apoiador') return 'Apoiador';
  if (role === 'paciente') return 'Paciente';
  return 'Admin';
}

function emptyLabel(value?: string | null) {
  return value ? value : 'Não informado';
}

function userRisk(user: Pick<AdminUser, 'suspended' | 'role' | 'approved' | 'verified'>): {
  level: AdminRiskLevel;
  label: string;
  detail: string;
} {
  if (user.suspended) {
    return { level: 'high', label: 'Risco alto', detail: 'Conta suspensa' };
  }

  if (user.role === 'instituicao' && !user.approved) {
    return { level: 'pending', label: 'Pendência', detail: 'Aprovação institucional' };
  }

  if (!user.verified) {
    return { level: 'medium', label: 'Atenção', detail: 'E-mail não verificado' };
  }

  return { level: 'low', label: 'Estável', detail: 'Sem alerta imediato' };
}

function auditMentionsUser(log: AdminAuditLog, user: AdminUserDetail) {
  const haystack = [log.refId, log.refPath, log.action, log.by, log.target, log.type, log.details]
    .join(' ')
    .toLowerCase();
  return [user.id, user.email, user.name]
    .map((item) => item?.toLowerCase())
    .filter(Boolean)
    .some((needle) => haystack.includes(needle));
}

function reportMentionsUser(report: AdminReportSummary, user: AdminUserDetail) {
  const recentDreams = Array.isArray(user.recentDreams) ? user.recentDreams : [];
  const recentProposals = Array.isArray(user.recentProposals) ? user.recentProposals : [];
  const recentConversations = Array.isArray(user.recentConversations) ? user.recentConversations : [];
  const relatedIds = new Set<string>([
    user.id,
    ...recentDreams.map((dream) => dream.id),
    ...recentProposals.map((proposal) => proposal.id),
    ...recentConversations.map((conversation) => conversation.id),
  ]);

  return relatedIds.has(report.targetId);
}

function summaryCards(currentDetail: AdminUserDetail) {
  const activity = currentDetail.activitySummary ?? {};

  if (currentDetail.role === 'apoiador') {
    return [
      { label: 'Propostas enviadas', value: activity.proposalsSent },
      { label: 'Propostas aceitas', value: activity.acceptedProposals },
      { label: 'Conversas', value: activity.conversations },
      { label: 'Conversas ativas', value: activity.activeConversations },
    ];
  }

  const baseCards = [
    { label: 'Sonhos', value: activity.dreams },
    { label: 'Propostas recebidas', value: activity.proposalsReceived },
    { label: 'Conversas', value: activity.conversations },
    { label: 'Conversas ativas', value: activity.activeConversations },
  ];

  if (currentDetail.role === 'instituicao') {
    return [
      ...baseCards,
      { label: 'Pacientes acompanhados', value: activity.managedPatients },
      { label: 'Pacientes vinculados', value: activity.linkedPatients },
      { label: 'Apoiadores conectados', value: activity.supporterConnections },
    ];
  }

  return baseCards;
}

function statusLabel(user: Pick<AdminUser, 'suspended'>) {
  return user.suspended ? 'Suspenso' : 'Ativo';
}

function approvalLabel(user: Pick<AdminUser, 'approved'>) {
  return user.approved ? 'Aprovado' : 'Pendente';
}

function verificationLabel(user: Pick<AdminUser, 'verified'>) {
  return user.verified ? 'Verificado' : 'Não verificado';
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUser['role'] | ''>('');
  const [statusFilter, setStatusFilter] = useState<AccountStatusFilter>('');
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [panelSuccess, setPanelSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<UserTab>('overview');
  const [userAuditLogs, setUserAuditLogs] = useState<AdminAuditLog[]>([]);
  const [userReports, setUserReports] = useState<AdminReportSummary[]>([]);

  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [manualPassword, setManualPassword] = useState('');
  const [manualResetOpen, setManualResetOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [resetLinkMetadata, setResetLinkMetadata] = useState<{
    email?: string;
    expiresAt?: string;
  } | null>(null);

  const hasActiveFilters = Boolean(query || roleFilter || statusFilter || approvalFilter || verificationFilter);

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      query,
      role: roleFilter,
      status: statusFilter,
      approval: approvalFilter,
      verification: verificationFilter,
    }),
    [approvalFilter, page, pageSize, query, roleFilter, statusFilter, verificationFilter],
  );

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const response = await adminApi.listUsers(listParams);
      const legacyItems = Array.isArray(response) ? response : undefined;
      const paginatedResponse = response as Partial<{
        items: AdminUser[];
        total: number;
        totalPages: number;
      }>;
      const nextUsers = legacyItems ?? (Array.isArray(paginatedResponse.items) ? paginatedResponse.items : []);
      const nextTotal = legacyItems ? legacyItems.length : (typeof paginatedResponse.total === 'number' ? paginatedResponse.total : nextUsers.length);

      setUsers(nextUsers);
      setTotal(nextTotal);
      setTotalPages(
        legacyItems
          ? Math.max(1, Math.ceil(nextTotal / pageSize))
          : (typeof paginatedResponse.totalPages === 'number' ? paginatedResponse.totalPages : Math.max(1, Math.ceil(nextTotal / pageSize))),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [listParams]);

  useEffect(() => {
    if (!routeUserId) return;

    setSelectedUserId(routeUserId);
    setPanelSuccess('');
    setDetailError('');
    setManualPassword('');
    setResetLinkMetadata(null);
    setActiveTab('overview');
    void loadUserDetail(routeUserId);
  }, [routeUserId]);

  function resetPageAndApply(update: () => void) {
    setPage(1);
    update();
  }

  function applyUserSummaryPatch(userId: string, patch: Partial<AdminUser>) {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, ...patch } : user)),
    );
  }

  function syncEditForm(nextDetail: AdminUserDetail) {
    setEditForm({
      name: nextDetail.name,
      email: nextDetail.email,
      state: nextDetail.state ?? '',
      city: nextDetail.city ?? '',
      verified: nextDetail.verified,
      approved: nextDetail.approved,
      institutionType: nextDetail.institutionType ?? '',
      institutionResponsibleName: nextDetail.institutionResponsibleName ?? '',
      institutionResponsiblePhone: nextDetail.institutionResponsiblePhone ?? '',
      institutionDescription: nextDetail.institutionDescription ?? '',
    });
  }

  async function loadUserDetail(userId: string) {
    setDetailLoading(true);
    setDetailError('');
    setUserAuditLogs([]);
    setUserReports([]);

    try {
      const [rawData, auditLogsResult, reportsResult] = await Promise.all([
        adminApi.getUserDetail(userId),
        Promise.resolve(adminApi.listAudit()).catch(() => []),
        Promise.resolve(adminApi.listReports({ page: 1, pageSize: 100 })).catch(() => undefined),
      ]);
      const data = normalizeUserDetail(rawData);
      const auditLogs = Array.isArray(auditLogsResult) ? auditLogsResult : [];
      const reportItems = Array.isArray(reportsResult?.items) ? reportsResult.items : [];

      setDetail(data);
      syncEditForm(data);
      applyUserSummaryPatch(userId, toUserSummary(data));
      setUserAuditLogs(auditLogs.filter((log) => auditMentionsUser(log, data)).slice(0, 12));
      setUserReports(reportItems.filter((report) => reportMentionsUser(report, data)).slice(0, 12));
      return data;
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível carregar os detalhes do usuário.');
      return null;
    } finally {
      setDetailLoading(false);
    }
  }

  async function openUserCenter(userId: string) {
    setSelectedUserId(userId);
    setPanelSuccess('');
    setDetailError('');
    setManualPassword('');
    setResetLinkMetadata(null);
    setActiveTab('overview');
    navigate(`/admin/usuarios/${userId}`);
    await loadUserDetail(userId);
  }

  async function refreshAfterAction(userId: string) {
    await loadUserDetail(userId);
  }

  async function handleApprove(userId: string) {
    setError('');
    setSuccess('');
    setPanelSuccess('');
    setActionLoading('approve');

    try {
      const response = await adminApi.approveUser(userId);
      applyUserSummaryPatch(userId, {
        approved: response.approved,
        approvedAt: response.approvedAt,
      });

      if (selectedUserId === userId) {
        await refreshAfterAction(userId);
        setPanelSuccess('Instituição aprovada com sucesso.');
      } else {
        setSuccess('Instituição aprovada com sucesso.');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível aprovar a instituição.');
    } finally {
      setActionLoading(null);
    }
  }

  function requestApprove(userId: string) {
    setConfirmation({
      title: 'Confirme a ação sensível',
      description: 'A instituição será aprovada manualmente e liberada para operar sem a pendência atual.',
      onConfirm: async () => {
        await handleApprove(userId);
        setConfirmation(null);
      },
    });
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!detail || !selectedUserId) return;

    setSavingEdit(true);
    setDetailError('');
    setPanelSuccess('');

    const payload: UpdateAdminUserInput = {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      state: editForm.state.trim(),
      city: editForm.city.trim(),
      verified: editForm.verified,
    };

    if (detail.role === 'instituicao') {
      payload.approved = editForm.approved;
      payload.institutionType = editForm.institutionType.trim();
      payload.institutionResponsibleName = editForm.institutionResponsibleName.trim();
      payload.institutionResponsiblePhone = editForm.institutionResponsiblePhone.trim();
      payload.institutionDescription = editForm.institutionDescription.trim();
    }

    try {
      const updated = await adminApi.updateUser(selectedUserId, payload);
      const normalizedUpdated = normalizeUserDetail(updated);
      setDetail(normalizedUpdated);
      syncEditForm(normalizedUpdated);
      applyUserSummaryPatch(normalizedUpdated.id, toUserSummary(normalizedUpdated));
      setPanelSuccess('Alterações salvas.');
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleSuspend(reason?: string) {
    if (!detail || !selectedUserId || !reason) return;
    setActionLoading('suspend');
    setDetailError('');
    setPanelSuccess('');

    try {
      const response = await adminApi.suspendUser(selectedUserId, reason);
      applyUserSummaryPatch(selectedUserId, {
        suspended: response.suspended,
        suspensionReason: response.suspensionReason,
      });
      await refreshAfterAction(selectedUserId);
      setPanelSuccess('Conta suspensa com sucesso.');
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível suspender a conta.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReactivate(reason?: string) {
    if (!detail || !selectedUserId || !reason) return;
    setActionLoading('reactivate');
    setDetailError('');
    setPanelSuccess('');

    try {
      const response = await adminApi.reactivateUser(selectedUserId, reason);
      applyUserSummaryPatch(selectedUserId, {
        suspended: response.suspended,
        suspensionReason: response.suspensionReason,
      });
      await refreshAfterAction(selectedUserId);
      setPanelSuccess('Conta reativada com sucesso.');
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível reativar a conta.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleManualPasswordReset() {
    if (!selectedUserId) return;
    setActionLoading('manual-reset');
    setDetailError('');
    setPanelSuccess('');
    setResetLinkMetadata(null);

    try {
      await adminApi.resetUserPassword(selectedUserId, {
        mode: 'manual',
        newPassword: manualPassword.trim(),
      });
      setManualPassword('');
      setPanelSuccess('Senha redefinida manualmente.');
      setManualResetOpen(false);
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetLinkPassword() {
    if (!selectedUserId) return;
    setConfirmation({
      title: 'Confirme a ação sensível',
      description: 'Um link de redefinição será enviado para o e-mail cadastrado. A senha atual não será exibida no painel.',
      confirmLabel: 'Confirmar ação',
      onConfirm: async () => {
        setActionLoading('reset-link');
        setDetailError('');
        setPanelSuccess('');
        setResetLinkMetadata(null);

        try {
          const response: AdminPasswordResetResult = await adminApi.resetUserPassword(selectedUserId, {
            mode: 'reset-link',
          });
          setResetLinkMetadata({
            email: response.email,
            expiresAt: response.expiresAt,
          });
          setPanelSuccess(`Link de redefinição enviado por e-mail para ${response.email ?? 'a conta selecionada'}.`);
          setConfirmation(null);
        } catch (err) {
          setDetailError(err instanceof ApiError ? err.message : 'Não foi possível enviar o link de redefinição.');
        } finally {
          setActionLoading(null);
        }
      },
    });
  }

  function renderOverviewTab(currentDetail: AdminUserDetail) {
    const cards = summaryCards(currentDetail);

    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Resumo operacional</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-500">{card.label}</div>
                <div className="mt-2 text-2xl font-bold text-slate-950">{card.value ?? 0}</div>
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={saveEdit} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Dados cadastrais</h3>
              <p className="mt-1 text-sm text-slate-500">Edição operacional dos dados não sensíveis da conta.</p>
            </div>
            <button
              type="submit"
              disabled={savingEdit}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:bg-slate-500"
            >
              {savingEdit ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Nome do usuário</span>
              <input
                value={editForm.name}
                onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                required
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>E-mail da conta</span>
              <input
                type="email"
                value={editForm.email}
                onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                required
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Estado</span>
              <input
                value={editForm.state}
                onChange={(event) => setEditForm((current) => ({ ...current, state: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Cidade</span>
              <input
                value={editForm.city}
                onChange={(event) => setEditForm((current) => ({ ...current, city: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={editForm.verified}
                onChange={(event) => setEditForm((current) => ({ ...current, verified: event.target.checked }))}
                className="size-4 rounded border-slate-300 text-pink-700"
              />
              Conta verificada
            </label>
            {currentDetail.role === 'instituicao' && (
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={editForm.approved}
                  onChange={(event) => setEditForm((current) => ({ ...current, approved: event.target.checked }))}
                  className="size-4 rounded border-slate-300 text-pink-700"
                />
                Conta aprovada
              </label>
            )}
          </div>

          {currentDetail.role === 'instituicao' && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h4 className="text-sm font-semibold text-slate-950">Dados institucionais</h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Tipo da instituição</span>
                  <input
                    value={editForm.institutionType}
                    onChange={(event) => setEditForm((current) => ({ ...current, institutionType: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Responsável pela conta</span>
                  <input
                    value={editForm.institutionResponsibleName}
                    onChange={(event) => setEditForm((current) => ({ ...current, institutionResponsibleName: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Telefone do responsável</span>
                  <input
                    value={editForm.institutionResponsiblePhone}
                    onChange={(event) => setEditForm((current) => ({ ...current, institutionResponsiblePhone: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
                  <span>Descrição institucional</span>
                  <textarea
                    value={editForm.institutionDescription}
                    onChange={(event) => setEditForm((current) => ({ ...current, institutionDescription: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </label>
              </div>
            </div>
          )}
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Notas administrativas</h3>
          <div className="mt-4">
            <AdminEmptyState
              title="Notas ainda não persistidas"
              description="O contrato atual não retorna notas administrativas para usuários."
            />
          </div>
        </section>
      </div>
    );
  }

  function renderDreamsTab(currentDetail: AdminUserDetail) {
    if (currentDetail.recentDreams.length === 0) {
      return <AdminEmptyState title="Nenhum sonho relacionado" description="Esta conta ainda não possui sonhos retornados no detalhe." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Sonhos do usuário</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {currentDetail.recentDreams.map((dream) => (
            <Link key={dream.id} to={`/admin/sonhos/${dream.id}`} className="block py-3 transition hover:bg-pink-50/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-950">{dream.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{dream.category} • atualizado em {formatDateTime(dream.updatedAt)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge status={dream.status}>{dream.status}</AdminStatusBadge>
                  <AdminStatusBadge status={dream.urgency}>{dream.urgency}</AdminStatusBadge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderProposalsTab(currentDetail: AdminUserDetail) {
    if (currentDetail.recentProposals.length === 0) {
      return <AdminEmptyState title="Nenhuma proposta relacionada" description="Esta conta ainda não possui propostas retornadas no detalhe." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Propostas relacionadas</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {currentDetail.recentProposals.map((proposal) => (
            <Link key={proposal.id} to={`/admin/propostas/${proposal.id}`} className="block py-3 transition hover:bg-pink-50/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-950">{proposal.dreamTitle ?? 'Sonho não informado'}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {proposal.supporterName ?? proposal.patientName ?? 'Pessoa relacionada não informada'} • {proposal.offering ?? 'Sem oferta descrita'}
                  </div>
                </div>
                <AdminStatusBadge status={proposal.status}>{proposal.status}</AdminStatusBadge>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderConversationsTab(currentDetail: AdminUserDetail) {
    if (currentDetail.recentConversations.length === 0) {
      return <AdminEmptyState title="Nenhuma conversa relacionada" description="Esta conta ainda não possui conversas retornadas no detalhe." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Conversas relacionadas</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {currentDetail.recentConversations.map((conversation) => (
            <Link key={conversation.id} to={`/admin/chats/${conversation.id}`} className="block py-3 transition hover:bg-pink-50/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-950">{conversation.dreamTitle ?? 'Chat sem sonho informado'}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {conversation.supporterName ?? conversation.patientName ?? 'Participante não informado'} • {conversation.messageCount} mensagens
                  </div>
                </div>
                <AdminStatusBadge status={conversation.status}>{conversation.status}</AdminStatusBadge>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderReportsTab() {
    if (userReports.length === 0) {
      return <AdminEmptyState title="Nenhuma denúncia relacionada" description="Não há denúncias vinculadas aos registros retornados para esta conta." />;
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Denúncias relacionadas</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {userReports.map((report) => (
            <Link key={report.id} to={`/admin/denuncias/${report.id}`} className="block py-3 transition hover:bg-pink-50/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-950">{report.type}</div>
                  <div className="mt-1 text-sm text-slate-500">{report.reason}</div>
                </div>
                <AdminStatusBadge status={report.status}>{report.status}</AdminStatusBadge>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderAuditTab() {
    return (
      <AdminAuditTimeline
        events={userAuditLogs.map((log) => ({
          id: log.id,
          title: log.action,
          description: log.details,
          actor: log.by,
          date: formatDateTime(log.date),
          status: <AdminStatusBadge status={log.outcome}>{log.outcome}</AdminStatusBadge>,
          href: log.refPath && log.refId ? `${log.refPath}/${log.refId}` : log.refPath,
        }))}
        emptyTitle="Nenhuma auditoria relacionada"
        emptyDescription="Não há eventos administrativos vinculados a esta conta no retorno atual."
      />
    );
  }

  function renderActiveTab(currentDetail: AdminUserDetail) {
    if (activeTab === 'dreams') return renderDreamsTab(currentDetail);
    if (activeTab === 'proposals') return renderProposalsTab(currentDetail);
    if (activeTab === 'conversations') return renderConversationsTab(currentDetail);
    if (activeTab === 'reports') return renderReportsTab();
    if (activeTab === 'audit') return renderAuditTab();
    return renderOverviewTab(currentDetail);
  }

  const filterFields: AdminFilterField[] = [
    {
      id: 'role',
      label: 'Role',
      value: roleFilter,
      type: 'select',
      onChange: (value) => resetPageAndApply(() => setRoleFilter(value as AdminUser['role'] | '')),
      options: [
        { value: '', label: 'Todos' },
        { value: 'paciente', label: 'Paciente' },
        { value: 'apoiador', label: 'Apoiador' },
        { value: 'instituicao', label: 'Instituição' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      type: 'select',
      onChange: (value) => resetPageAndApply(() => setStatusFilter(value as AccountStatusFilter)),
      options: [
        { value: '', label: 'Todos' },
        { value: 'ativo', label: 'Ativo' },
        { value: 'suspenso', label: 'Suspenso' },
      ],
    },
    {
      id: 'approval',
      label: 'Aprovação',
      value: approvalFilter,
      type: 'select',
      onChange: (value) => resetPageAndApply(() => setApprovalFilter(value as ApprovalFilter)),
      options: [
        { value: '', label: 'Todas' },
        { value: 'aprovado', label: 'Aprovado' },
        { value: 'pendente', label: 'Pendente' },
      ],
    },
    {
      id: 'verification',
      label: 'Verificação',
      value: verificationFilter,
      type: 'select',
      onChange: (value) => resetPageAndApply(() => setVerificationFilter(value as VerificationFilter)),
      options: [
        { value: '', label: 'Todas' },
        { value: 'verificado', label: 'Verificado' },
        { value: 'pendente', label: 'Não verificado' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Operação Admin"
        title="Usuários"
        subtitle="Central de contas para pacientes, apoiadores e instituições com busca, filtros e paginação operacional."
        meta={<span>{total} registros encontrados</span>}
      />

      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
          <AdminListToolbar
            title="Lista de usuários"
            description="Use busca e filtros para encontrar a conta certa sem perder contexto."
            totalLabel={`${total} registros`}
            search={
              <AdminSearchInput
                value={query}
                onChange={(value) => resetPageAndApply(() => setQuery(value))}
                placeholder="Buscar por nome, e-mail, cidade ou estado"
              />
            }
            filters={<AdminFilters fields={filterFields} className="xl:grid-cols-2" />}
          />

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
              {loading ? 'Carregando usuários...' : `${users.length} itens nesta página`}
            </div>

            <div className="space-y-2 p-3">
              {loading && <AdminLoadingState title="Carregando usuários" description="Buscando a página solicitada." />}
              {!loading && error && (
                <AdminErrorState
                  title="Não foi possível carregar usuários"
                  description={error}
                  actionLabel="Tentar novamente"
                  onAction={() => void loadUsers()}
                />
              )}
              {!loading && !error && users.length === 0 && (
                <AdminEmptyState
                  title={hasActiveFilters ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                  description={
                    hasActiveFilters
                      ? 'Ajuste a busca ou os filtros para ampliar os resultados.'
                      : 'Quando houver contas operacionais, elas aparecerão aqui.'
                  }
                />
              )}
              {!loading && !error && users.map((user) => {
                const risk = userRisk(user);
                const selected = selectedUserId === user.id;

                return (
                  <button
                    key={user.id}
                    type="button"
                    aria-label={`Selecionar ${user.name}`}
                    onClick={() => void openUserCenter(user.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-pink-300 bg-pink-50 shadow-sm ring-2 ring-pink-100'
                        : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-pink-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-950">{user.name}</div>
                        <div className="mt-0.5 truncate text-xs text-slate-500">{user.email}</div>
                      </div>
                      <AdminRiskBadge level={risk.level} label={risk.label} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <AdminStatusBadge status="neutral">{roleLabel(user.role)}</AdminStatusBadge>
                      <AdminStatusBadge status={user.suspended ? 'suspenso' : 'ativo'}>{statusLabel(user)}</AdminStatusBadge>
                      <AdminStatusBadge status={user.approved ? 'aprovado' : 'pendente'}>{approvalLabel(user)}</AdminStatusBadge>
                      <AdminStatusBadge status={user.verified ? 'verificado' : 'pendente'}>{verificationLabel(user)}</AdminStatusBadge>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="size-3.5" />
                      <span className="truncate">{emptyLabel(user.locationLabel ?? buildLocationLabel(user.city, user.state))}</span>
                    </div>
                    <div className="mt-3 text-xs font-medium text-slate-600">{risk.detail}</div>
                  </button>
                );
              })}
            </div>

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

        <section className="min-w-0">
          {!selectedUserId && !detailLoading && (
            <AdminEmptyState
              title="Selecione uma conta"
              description="A ficha operacional abre aqui, mantendo a lista e a paginação visíveis para comparação."
            />
          )}

          {selectedUserId && (
            <div className="space-y-4">
              {detailLoading && (
                <AdminLoadingState title="Carregando ficha operacional" description="Buscando dados, vínculos e histórico da conta." />
              )}

              {detailError && (
                <AdminErrorState
                  title="Não foi possível carregar o usuário"
                  description={detailError}
                  actionLabel="Tentar novamente"
                  onAction={() => selectedUserId && void loadUserDetail(selectedUserId)}
                />
              )}

              {detail && !detailLoading && (
                <>
                  <AdminDetailHeader
                    title={detail.name}
                    subtitle={
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-4 text-slate-400" />
                          {detail.email}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-4 text-slate-400" />
                          {emptyLabel(detail.locationLabel ?? buildLocationLabel(detail.city, detail.state))}
                        </span>
                      </div>
                    }
                    status={
                      <>
                        <AdminStatusBadge status={detail.suspended ? 'suspenso' : 'ativo'}>{statusLabel(detail)}</AdminStatusBadge>
                        <span className="inline-flex items-center rounded-full border border-pink-200 bg-white px-2.5 py-1 text-xs font-semibold text-pink-700">
                          Ficha operacional
                        </span>
                      </>
                    }
                    risk={<AdminRiskBadge level={userRisk(detail).level} label={userRisk(detail).detail} />}
                    actions={
                      <Link
                        to="/admin/usuarios"
                        onClick={() => {
                          setSelectedUserId(null);
                          setDetail(null);
                        }}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Limpar seleção
                      </Link>
                    }
                    metadata={[
                      { label: 'Role', value: roleLabel(detail.role) },
                      { label: 'Aprovação', value: approvalLabel(detail) },
                      { label: 'Verificação', value: verificationLabel(detail) },
                      { label: 'Criação', value: formatDateTime(detail.createdAt) },
                      { label: 'Último acesso', value: 'Não informado' },
                      { label: 'Atualização', value: formatDateTime(detail.updatedAt) },
                    ]}
                  />

                  {panelSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {panelSuccess}
                    </div>
                  )}

                  <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_330px]">
                    <main className="min-w-0 space-y-4">
                      <AdminTabs tabs={userTabs} activeTab={activeTab} onChange={setActiveTab} />
                      {renderActiveTab(detail)}
                    </main>

                    <aside className="space-y-4">
                      <AdminActionPanel
                        title="Ações rápidas"
                        description="Atalhos sem alteração destrutiva direta."
                        actions={[
                          ...(detail.role === 'instituicao' && !detail.approved
                            ? [{
                                id: 'approve',
                                label: actionLoading === 'approve' ? 'Aprovando...' : 'Aprovar instituição',
                                icon: CheckCircle2,
                                tone: 'warning' as const,
                                disabled: actionLoading === 'approve',
                                onClick: () => requestApprove(detail.id),
                              }]
                            : []),
                          {
                            id: 'reset-link',
                            label: actionLoading === 'reset-link' ? 'Enviando...' : 'Enviar link de redefinição',
                            icon: KeyRound,
                            tone: 'primary',
                            disabled: actionLoading === 'reset-link',
                            onClick: () => void handleResetLinkPassword(),
                          },
                          {
                            id: 'conversations',
                            label: 'Abrir conversas',
                            icon: MessageCircle,
                            onClick: () => setActiveTab('conversations'),
                          },
                          {
                            id: 'reports',
                            label: 'Abrir denúncias',
                            icon: ShieldAlert,
                            onClick: () => setActiveTab('reports'),
                          },
                          {
                            id: 'audit',
                            label: 'Abrir auditoria',
                            icon: History,
                            onClick: () => setActiveTab('audit'),
                          },
                        ]}
                      >
                        {resetLinkMetadata && (
                          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                            <div className="text-xs font-semibold text-sky-800">Entrega confirmada</div>
                            <div className="mt-1 text-sm text-sky-950">{resetLinkMetadata.email ?? 'E-mail da conta'}</div>
                            <div className="mt-1 text-xs text-sky-700">
                              Expira em {formatDateTime(resetLinkMetadata.expiresAt)}
                            </div>
                          </div>
                        )}
                      </AdminActionPanel>

                      <AdminSensitiveActionPanel
                        title="Ações sensíveis"
                        description="Operações com impacto direto no acesso e rastreabilidade."
                        actions={[
                          !detail.suspended
                            ? {
                                id: 'suspend',
                                title: 'Suspender conta',
                                description: 'Remove o acesso desta conta até uma reavaliação administrativa.',
                                confirmLabel: 'Suspender conta',
                                requiresReason: true,
                                reasonLabel: 'Motivo da suspensão',
                                destructive: true,
                                loading: actionLoading === 'suspend',
                                onConfirm: handleSuspend,
                              }
                            : {
                                id: 'reactivate',
                                title: 'Reativar conta',
                                description: 'Restabelece o acesso da pessoa usuária e remove o estado de suspensão.',
                                confirmLabel: 'Reativar conta',
                                requiresReason: true,
                                reasonLabel: 'Motivo da reativação',
                                destructive: false,
                                loading: actionLoading === 'reactivate',
                                onConfirm: handleReactivate,
                              },
                        ]}
                      />

                      <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <h3 className="text-base font-semibold text-red-950">Reset manual de senha</h3>
                        <p className="mt-1 text-sm text-red-800">Use apenas quando o link de redefinição não for suficiente.</p>
                        <label className="mt-4 block space-y-1 text-sm font-semibold text-red-950">
                          <span>Reset manual de senha</span>
                          <input
                            type="text"
                            value={manualPassword}
                            onChange={(event) => setManualPassword(event.target.value)}
                            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 font-normal text-slate-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                            minLength={8}
                          />
                        </label>
                        <button
                          type="button"
                          disabled={manualPassword.trim().length < 8 || actionLoading === 'manual-reset'}
                          onClick={() => setManualResetOpen(true)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-500"
                        >
                          <KeyRound className="size-4" />
                          {actionLoading === 'manual-reset' ? 'Resetando...' : 'Salvar senha manual'}
                        </button>
                      </section>
                    </aside>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <ConfirmActionDialog
        open={Boolean(confirmation)}
        title={confirmation?.title ?? 'Confirme a ação sensível'}
        description={confirmation?.description ?? ''}
        confirmLabel={confirmation?.confirmLabel}
        destructive={confirmation?.destructive}
        loading={Boolean(actionLoading)}
        onConfirm={async () => {
          if (!confirmation) return;
          await confirmation.onConfirm();
        }}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
      />

      <ConfirmActionDialog
        open={manualResetOpen}
        title="Confirme a ação sensível"
        description="A nova senha manual substituirá a senha atual imediatamente."
        confirmLabel="Confirmar ação"
        destructive
        loading={actionLoading === 'manual-reset'}
        onConfirm={handleManualPasswordReset}
        onOpenChange={setManualResetOpen}
      />
    </div>
  );
}
