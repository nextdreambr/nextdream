import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Eye, Loader2, MoreHorizontal, RefreshCcw } from 'lucide-react';
import { AdminAccountDetail, AdminInvite, AdminUser, ApiError, ApiUserRole, adminApi } from '../../lib/api';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminListToolbar,
  AdminLoadingState,
  AdminPagination,
  AdminSearchInput,
  AdminSensitiveActionPanel,
} from './components';
import { AdminStatusBadge, formatAdminDateTime } from './components/adminPageUtils';

type EditFormState = {
  name: string;
  email: string;
  role: ApiUserRole;
  isActive: boolean;
  currentPassword: string;
  newPassword: string;
};

const emptyEditForm: EditFormState = {
  name: '',
  email: '',
  role: 'admin',
  isActive: true,
  currentPassword: '',
  newPassword: '',
};

export default function AdminAdmins() {
  const navigate = useNavigate();
  const { adminId: routeAdminId } = useParams<{ adminId?: string }>();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<AdminInvite[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ativo' | 'suspenso' | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminAccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm);
  const [saving, setSaving] = useState(false);
  const [sensitiveSaving, setSensitiveSaving] = useState(false);
  const [sensitiveError, setSensitiveError] = useState('');
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [adminsResponse, invitesResponse] = await Promise.all([
        adminApi.listAdminsPage({ page, pageSize, query, status }),
        adminApi.listAdminInvites(),
      ]);
      setAdmins(adminsResponse.items);
      setTotal(adminsResponse.total);
      setTotalPages(adminsResponse.totalPages);
      setPendingInvites(invitesResponse);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar admins.');
      setAdmins([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [page, pageSize, query, status]);

  useEffect(() => {
    if (!routeAdminId) {
      resetAdminDetail();
      return;
    }

    setSelectedAdminId(routeAdminId);
    setDetailError('');
    void loadAdminDetail(routeAdminId);
  }, [routeAdminId]);

  function syncEditForm(nextDetail: AdminAccountDetail) {
    setEditForm({
      name: nextDetail.name,
      email: nextDetail.email,
      role: nextDetail.role,
      isActive: !nextDetail.suspended,
      currentPassword: '',
      newPassword: '',
    });
  }

  async function loadAdminDetail(adminId: string) {
    setDetailLoading(true);

    try {
      const adminDetail = await adminApi.getAdminDetail(adminId);
      setDetail(adminDetail);
      syncEditForm(adminDetail);
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível carregar os detalhes do admin.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function openAdminCenter(adminId: string) {
    setOpenMenuId(null);
    setSelectedAdminId(adminId);
    setDetailError('');
    navigate(`/admin/admins/${adminId}`);
    await loadAdminDetail(adminId);
  }

  function resetAdminDetail() {
    setSelectedAdminId(null);
    setDetail(null);
    setDetailError('');
    setEditForm(emptyEditForm);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!selectedAdminId) return;

    setSaving(true);
    setDetailError('');
    setSuccess('');

    try {
      await adminApi.updateAdmin(selectedAdminId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        currentPassword: editForm.currentPassword.trim(),
      });
      setSuccess('Admin atualizado com sucesso.');
      await loadData();
      const updatedDetail = await adminApi.getAdminDetail(selectedAdminId);
      setDetail(updatedDetail);
      syncEditForm(updatedDetail);
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Não foi possível atualizar admin.');
    } finally {
      setSaving(false);
    }
  }

  async function runSensitiveUpdate(payload: Partial<Pick<EditFormState, 'role' | 'isActive' | 'newPassword'>>, reason?: string) {
    if (!selectedAdminId) return;

    setSensitiveSaving(true);
    setSensitiveError('');
    setDetailError('');
    setSuccess('');

    try {
      await adminApi.updateAdmin(selectedAdminId, {
        role: payload.role,
        isActive: payload.isActive,
        currentPassword: editForm.currentPassword.trim(),
        newPassword: payload.newPassword?.trim() || undefined,
        reason,
      });
      setSuccess('Ação sensível registrada com sucesso.');
      await loadData();
      const updatedDetail = await adminApi.getAdminDetail(selectedAdminId);
      setDetail(updatedDetail);
      syncEditForm(updatedDetail);
    } catch (err) {
      setSensitiveError(err instanceof ApiError ? err.message : 'Não foi possível concluir a ação sensível.');
    } finally {
      setSensitiveSaving(false);
    }
  }

  async function resendInvite(email: string) {
    setResendingEmail(email);
    setError('');
    setSuccess('');

    try {
      const invite = await adminApi.inviteAdmin(email);
      setSuccess(`Convite reenviado para ${invite.email}.`);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível reenviar o convite.');
    } finally {
      setResendingEmail(null);
    }
  }

  async function createInvite(event: FormEvent) {
    event.preventDefault();
    const normalizedEmail = inviteEmail.trim().toLowerCase();
    if (!normalizedEmail) return;

    setInviting(true);
    setError('');
    setSuccess('');

    try {
      const invite = await adminApi.inviteAdmin(normalizedEmail);
      setSuccess(`Convite enviado para ${invite.email}.`);
      setInviteEmail('');
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar o convite.');
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Admins</h1>
        <p className="text-sm text-gray-500">Contas administrativas com paginação, filtros, trilha de segurança e convites pendentes.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <form onSubmit={createInvite} className="rounded-2xl border border-pink-100 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="novo.admin@nextdream.ong.br"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={inviting}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-black disabled:bg-gray-500"
          >
            {inviting ? 'Enviando...' : 'Enviar convite'}
          </button>
        </div>
      </form>

      {pendingInvites.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-amber-900">Convites pendentes</h2>
            <p className="text-sm text-amber-800">Reenvie convites ativos quando a pessoa administradora ainda não concluiu o aceite.</p>
          </div>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                  <div className="text-xs text-gray-500">Expira em {formatAdminDateTime(invite.expiresAt)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => void resendInvite(invite.email)}
                  disabled={resendingEmail === invite.email}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-3 py-2 text-sm text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
                  aria-label={`Reenviar convite para ${invite.email}`}
                >
                  <RefreshCcw className="size-4" />
                  {resendingEmail === invite.email ? 'Reenviando...' : 'Reenviar convite'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <AdminListToolbar
        title="Equipe administrativa"
        description="Busque e filtre admins sem carregar toda a base no navegador."
        totalLabel={`${total} admins`}
        search={
          <AdminSearchInput
            value={query}
            onChange={(value) => {
              setPage(1);
              setQuery(value);
            }}
            placeholder="Buscar por nome, e-mail, cidade ou estado"
            label="Buscar admins"
          />
        }
        filters={
          <AdminFilters
            fields={[
              {
                id: 'status',
                label: 'Status',
                value: status,
                type: 'select',
                onChange: (value) => {
                  setPage(1);
                  setStatus(value as 'ativo' | 'suspenso' | '');
                },
                options: [
                  { value: '', label: 'Todos' },
                  { value: 'ativo', label: 'Ativos' },
                  { value: 'suspenso', label: 'Suspensos' },
                ],
              },
            ]}
          />
        }
      />

      <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
        {loading && <AdminLoadingState title="Carregando admins" description="Buscando página, busca e filtros selecionados." />}
        {!loading && error && (
          <div className="p-4">
            <AdminErrorState title="Não foi possível carregar admins" description={error} actionLabel="Tentar novamente" onAction={() => void loadData()} />
          </div>
        )}
        {!loading && !error && admins.length === 0 && (
          <div className="p-4">
            <AdminEmptyState
              title={query || status ? 'Nenhum admin encontrado' : 'Nenhum admin listado'}
              description={query || status ? 'Ajuste busca ou filtros para ampliar os resultados.' : 'Contas administrativas aparecerão aqui quando cadastradas.'}
            />
          </div>
        )}
        {!loading && !error && admins.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-pink-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Nome</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Papel</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className={`border-t border-pink-50 ${selectedAdminId === admin.id ? 'bg-pink-50/70' : ''}`}>
                      <td className="px-3 py-2 text-gray-900">{admin.name}</td>
                      <td className="px-3 py-2 text-gray-600">{admin.email}</td>
                      <td className="px-3 py-2 text-gray-700">{admin.role}</td>
                      <td className="px-3 py-2">
                        <AdminStatusBadge status={admin.suspended ? 'suspenso' : 'ativo'}>
                          {admin.suspended ? 'Suspenso' : 'Ativo'}
                        </AdminStatusBadge>
                      </td>
                      <td className="relative px-3 py-2 text-right">
                        <button
                          type="button"
                          aria-label={`Ações para ${admin.name}`}
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === admin.id}
                          onClick={() => setOpenMenuId((current) => (current === admin.id ? null : admin.id))}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>

                        {openMenuId === admin.id && (
                          <div role="menu" className="absolute right-3 top-full z-20 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-lg">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => void openAdminCenter(admin.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                              <Eye className="size-4" />
                              Ver e editar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPage(1);
                setPageSize(nextPageSize);
              }}
              disabled={loading}
            />
          </>
        )}
      </div>

      {selectedAdminId && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-950">{detail?.name ?? 'Central do admin'}</h2>
              <p className="mt-1 text-sm text-gray-500">Edite dados da conta, acompanhe o estado atual e revise a trilha de segurança recente.</p>
            </div>
            <Link
              to="/admin/admins"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Voltar para equipe
            </Link>
          </div>

          {detailLoading && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-600">
              <Loader2 className="size-4 animate-spin" />
              Carregando central do admin...
            </div>
          )}

          {detailError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {detailError}
            </div>
          )}

          {detail && !detailLoading && (
            <div className="space-y-5">
              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{detail.name}</div>
                    <div className="text-sm text-gray-600">{detail.email}</div>
                  </div>
                  <AdminStatusBadge status={detail.suspended ? 'suspenso' : 'ativo'}>
                    {detail.suspended ? 'Suspenso' : 'Ativo'}
                  </AdminStatusBadge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Papel</div>
                    <div className="mt-1 text-sm text-gray-900">{detail.role}</div>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Criado em</div>
                    <div className="mt-1 text-sm text-gray-900">{formatAdminDateTime(detail.createdAt)}</div>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Atualizado em</div>
                    <div className="mt-1 text-sm text-gray-900">{formatAdminDateTime(detail.updatedAt)}</div>
                  </div>
                </div>
              </section>

              <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Editar conta administrativa</h3>
                  <p className="text-sm text-gray-500">O backend mantém os guardas para não auto-desativar um admin crítico nem remover o último admin ativo.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-gray-700">
                    <span>Nome do admin</span>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>

                  <label className="space-y-1 text-sm text-gray-700">
                    <span>E-mail do admin</span>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>

                  <label className="space-y-1 text-sm text-gray-700">
                    <span>Sua senha atual</span>
                    <input
                      type="password"
                      value={editForm.currentPassword}
                      onChange={(event) => setEditForm((current) => ({ ...current, currentPassword: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-black disabled:bg-gray-500"
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </form>

              <section className="space-y-4 rounded-2xl border border-red-200 bg-red-50/60 p-5">
                <div>
                  <h3 className="text-base font-semibold text-red-950">Ações sensíveis</h3>
                  <p className="mt-1 text-sm text-red-800">
                    Use apenas para impacto de acesso ou segurança. A senha atual valida a operação e o motivo fica registrado na auditoria.
                  </p>
                </div>

                <div className="grid gap-4 rounded-xl border border-red-200 bg-white p-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold text-red-950">
                    <span>Novo papel administrativo</span>
                    <select
                      value={editForm.role}
                      onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as ApiUserRole }))}
                      className="w-full rounded-xl border border-red-200 px-3 py-2 font-normal text-slate-900"
                    >
                      <option value="admin">admin</option>
                      <option value="apoiador">apoiador</option>
                      <option value="instituicao">instituicao</option>
                      <option value="paciente">paciente</option>
                    </select>
                  </label>

                  <label className="space-y-1 text-sm font-semibold text-red-950">
                    <span>Nova senha manual</span>
                    <input
                      type="password"
                      value={editForm.newPassword}
                      onChange={(event) => setEditForm((current) => ({ ...current, newPassword: event.target.value }))}
                      className="w-full rounded-xl border border-red-200 px-3 py-2 font-normal text-slate-900"
                      minLength={8}
                    />
                  </label>
                </div>

                <AdminSensitiveActionPanel
                  title="Confirmar alteração crítica"
                  description={!editForm.currentPassword.trim() ? 'Informe sua senha atual no formulário acima antes de executar qualquer ação sensível.' : 'Cada ação exige motivo e confirmação explícita.'}
                  errorMessage={sensitiveError}
                  actions={[
                    detail.suspended
                      ? {
                        id: 'reactivate-admin',
                        title: 'Reativar admin',
                        description: 'Remove a suspensão da conta administrativa selecionada.',
                        confirmLabel: 'Reativar admin',
                        destructive: false,
                        disabled: sensitiveSaving || !editForm.currentPassword.trim(),
                        loading: sensitiveSaving,
                        requiresReason: true,
                        reasonLabel: 'Motivo para reativar admin',
                        onConfirm: (reason) => runSensitiveUpdate({ isActive: true }, reason),
                      }
                      : {
                        id: 'suspend-admin',
                        title: 'Suspender admin',
                        description: 'Interrompe o acesso administrativo desta conta até nova reativação.',
                        confirmLabel: 'Suspender admin',
                        destructive: true,
                        disabled: sensitiveSaving || !editForm.currentPassword.trim(),
                        loading: sensitiveSaving,
                        requiresReason: true,
                        reasonLabel: 'Motivo para suspender admin',
                        onConfirm: (reason) => runSensitiveUpdate({ isActive: false }, reason),
                      },
                    {
                      id: 'change-role',
                      title: 'Alterar papel',
                      description: 'Atualiza o papel da conta. Remover o papel admin tira a conta desta central após a confirmação.',
                      confirmLabel: 'Alterar papel',
                      destructive: true,
                      disabled: sensitiveSaving || !editForm.currentPassword.trim() || editForm.role === detail.role,
                      loading: sensitiveSaving,
                      requiresReason: true,
                      reasonLabel: 'Motivo para alterar papel',
                      onConfirm: (reason) => runSensitiveUpdate({ role: editForm.role }, reason),
                    },
                    {
                      id: 'manual-password-reset',
                      title: 'Reset manual de senha',
                      description: 'Define uma senha manual para a conta administrativa. Prefira fluxos de redefinição quando disponíveis.',
                      confirmLabel: 'Atualizar senha',
                      destructive: true,
                      disabled: sensitiveSaving || !editForm.currentPassword.trim() || editForm.newPassword.trim().length < 8,
                      loading: sensitiveSaving,
                      requiresReason: true,
                      reasonLabel: 'Motivo para reset manual de senha',
                      onConfirm: (reason) => runSensitiveUpdate({ newPassword: editForm.newPassword }, reason),
                    },
                  ]}
                />
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Trilha básica de segurança</h3>
                  <p className="text-sm text-gray-500">Últimos eventos relevantes deste admin no painel.</p>
                </div>
                <div className="space-y-3">
                  {detail.securityTrail.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum evento recente.</p>
                  )}
                  {detail.securityTrail.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{item.action}</div>
                        <AdminStatusBadge status={item.outcome}>{item.outcome}</AdminStatusBadge>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">{item.details}</div>
                      <div className="mt-2 text-xs text-gray-500">{formatAdminDateTime(item.date)}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
