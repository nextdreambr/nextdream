import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, AdminAuditLog, adminApi } from '../../lib/api';

export default function AdminAudit() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await adminApi.listAudit();
        if (mounted) setLogs(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar o log de auditoria.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return logs;
    return logs.filter((log) =>
      [log.action, log.by, log.target, log.type, log.details].join(' ').toLowerCase().includes(normalized),
    );
  }, [logs, query]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Auditoria</h1>
        <p className="text-sm text-gray-500">Rastro de ações administrativas e de moderação.</p>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por ação, ator ou alvo"
        className="w-full bg-white border border-pink-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
      />

      <div className="space-y-2">
        {filtered.map((log) => (
          <article key={log.id} className="bg-white border border-pink-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-800">{log.action}</p>
              <span className="text-xs text-gray-500">{new Date(log.date).toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-xs text-gray-500">{log.by} • {log.type} • {log.target}</p>
            <p className="text-sm text-gray-600">{log.details}</p>
            <button onClick={() => navigate(log.refPath, log.refId ? { state: { openId: log.refId } } : {})} className="text-xs text-pink-700 hover:text-pink-800">
              Abrir origem
            </button>
          </article>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}
