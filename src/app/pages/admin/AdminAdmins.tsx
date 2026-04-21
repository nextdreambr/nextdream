import { FormEvent, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiError, AdminUser, adminApi } from '../../lib/api';

export default function AdminAdmins() {
  const { currentUser } = useApp();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'paciente' | 'apoiador' | 'instituicao' | 'admin'>('admin');
  const [editActive, setEditActive] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const isEditingSelf = editingId !== null && currentUser?.id === editingId;

  async function loadAdmins() {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listAdmins();
      setAdmins(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar admins.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdmins();
  }, []);

  function startEdit(admin: AdminUser) {
    setEditingId(admin.id);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditRole(admin.role);
    setEditActive(!admin.suspended);
    setCurrentPassword('');
    setNewPassword('');
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditRole('admin');
    setEditActive(true);
    setCurrentPassword('');
    setNewPassword('');
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;

    const trimmedNewPassword = newPassword.trim();
    const requiresCurrentPassword = !isEditingSelf || trimmedNewPassword.length > 0;
    if (requiresCurrentPassword && !currentPassword) {
      setError('Senha atual é obrigatória para confirmar esta alteração.');
      return;
    }

    setSavingEdit(true);
    setError('');
    setSuccess('');
    try {
      await adminApi.updateAdmin(editingId, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        isActive: editActive,
        currentPassword: requiresCurrentPassword ? currentPassword : undefined,
        newPassword: trimmedNewPassword.length > 0 ? trimmedNewPassword : undefined,
      });
      setSuccess('Admin atualizado com sucesso.');
      cancelEdit();
      await loadAdmins();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível atualizar admin.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function inviteAdmin(event: FormEvent) {
    event.preventDefault();
    const normalizedEmail = inviteEmail.trim().toLowerCase();
    if (!normalizedEmail) return;

    setInviting(true);
    setError('');
    setSuccess('');
    try {
      const invite = await adminApi.inviteAdmin(normalizedEmail);
      setSuccess(`Convite enviado para ${invite.email}. Expira em ${new Date(invite.expiresAt).toLocaleString()}.`);
      setInviteEmail('');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível enviar convite.');
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Admins</h1>
        <p className="text-sm text-gray-500">Gestão de contas administrativas e convites.</p>
      </div>

      <form onSubmit={inviteAdmin} className="bg-white border border-pink-100 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Adicionar novo admin</h2>
        <div className="flex flex-col sm:flex-row gap-2">
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
            className="rounded-xl bg-gray-900 hover:bg-black disabled:bg-gray-500 px-4 py-2 text-sm text-white"
          >
            {inviting ? 'Enviando...' : 'Enviar convite'}
          </button>
        </div>
      </form>

      <div className="bg-white border border-pink-100 rounded-2xl overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-pink-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Nome</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t border-pink-50">
                <td className="px-3 py-2">{admin.name}</td>
                <td className="px-3 py-2 text-gray-600">{admin.email}</td>
                <td className="px-3 py-2">{admin.role}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${admin.suspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {admin.suspended ? 'Suspenso' : 'Ativo'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => startEdit(admin)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {!loading && admins.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={5}>Nenhum admin encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId && (
        <form onSubmit={saveEdit} className="bg-white border border-pink-100 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">Editar admin</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nome"
              required
            />
            <input
              type="email"
              value={editEmail}
              onChange={(event) => setEditEmail(event.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Email"
              required
            />
            <select
              value={editRole}
              onChange={(event) => setEditRole(event.target.value as 'paciente' | 'apoiador' | 'instituicao' | 'admin')}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="admin">admin</option>
              <option value="apoiador">apoiador</option>
              <option value="instituicao">instituicao</option>
              <option value="paciente">paciente</option>
            </select>
            <select
              value={editActive ? 'active' : 'suspended'}
              onChange={(event) => setEditActive(event.target.value === 'active')}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
            </select>
            <input
              type="password"
              value={newPassword}
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nova senha (opcional)"
            />
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Sua senha atual (confirmação)"
              required={!isEditingSelf || newPassword.trim().length > 0}
            />
          </div>
          <p className="text-xs text-gray-500">
            {isEditingSelf
              ? 'Para alterar sua própria senha, informe sua senha atual.'
              : 'Para editar outro admin, confirme com sua senha atual.'}
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingEdit}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black disabled:bg-gray-500 text-sm text-white"
            >
              {savingEdit ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">{success}</div>}
    </div>
  );
}
