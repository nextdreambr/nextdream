import { useEffect, useState } from 'react';
import { ApiError, AdminUser, adminApi } from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadUsers() {
    try {
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar usuários.');
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function suspendUser(userId: string) {
    setActingId(userId);
    try {
      await adminApi.suspendUser(userId, 'Suspensão operacional via painel admin.');
      await loadUsers();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível suspender o usuário.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Usuários</h1>
        <p className="text-sm text-gray-500">Gestão operacional de contas.</p>
      </div>

      <div className="bg-white border border-pink-100 rounded-2xl overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-pink-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Nome</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-pink-50">
                <td className="px-3 py-2">{user.name}</td>
                <td className="px-3 py-2 text-gray-600">{user.email}</td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.suspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.suspended ? 'Suspenso' : 'Ativo'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {!user.suspended && (
                    <button
                      onClick={() => suspendUser(user.id)}
                      disabled={actingId === user.id}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs"
                    >
                      Suspender
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
