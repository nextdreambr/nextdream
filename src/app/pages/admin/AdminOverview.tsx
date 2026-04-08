import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError, AdminOverview as AdminOverviewData, adminApi } from '../../lib/api';

export default function AdminOverview() {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await adminApi.overview();
        if (mounted) setOverview(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar métricas administrativas.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Painel Administrativo</h1>
        <p className="text-sm text-gray-500">Visão consolidada da operação.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Usuários', value: overview?.totalUsers ?? 0 },
          { label: 'Sonhos', value: overview?.totalDreams ?? 0 },
          { label: 'Propostas', value: overview?.totalProposals ?? 0 },
          { label: 'Chats', value: overview?.totalChats ?? 0 },
          { label: 'Denúncias abertas', value: overview?.totalReportsOpen ?? 0 },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-pink-100 rounded-2xl p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-xl text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Usuários', to: '/admin/usuarios' },
          { label: 'Sonhos', to: '/admin/sonhos' },
          { label: 'Propostas', to: '/admin/propostas' },
          { label: 'Chats', to: '/admin/chats' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="bg-white border border-pink-100 hover:border-pink-200 rounded-xl px-3 py-2 text-sm text-gray-700">
            Abrir {item.label}
          </Link>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
