import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, AdminAuditLog, adminApi } from '../../lib/api';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminListToolbar,
  AdminLoadingState,
  AdminPagination,
  AdminSearchInput,
} from './components';
import { AdminStatusBadge, formatAdminDateTime } from './components/adminPageUtils';

function auditTargetPath(log: AdminAuditLog) {
  if (!log.refId) return log.refPath;
  if (log.refPath === '/admin/chats') return `/admin/chats/${log.refId}`;
  if (log.refPath === '/admin/denuncias') return `/admin/denuncias/${log.refId}`;
  if (log.refPath === '/admin/sonhos') return `/admin/sonhos/${log.refId}`;
  if (log.refPath === '/admin/propostas') return `/admin/propostas/${log.refId}`;
  if (log.refPath === '/admin/usuarios') return `/admin/usuarios/${log.refId}`;
  if (log.refPath === '/admin/admins') return `/admin/admins/${log.refId}`;
  if (log.refPath === '/admin/mensagens') return `/admin/mensagens/${log.refId}`;
  return log.refPath;
}

export default function AdminAudit() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState<AdminAuditLog['severity'] | ''>('');
  const [outcome, setOutcome] = useState<AdminAuditLog['outcome'] | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const hasFilters = useMemo(
    () => Boolean(query.trim() || type || severity || outcome || dateFrom || dateTo),
    [dateFrom, dateTo, outcome, query, severity, type],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await adminApi.listAuditPage({
          page,
          pageSize,
          query,
          type,
          severity,
          outcome,
          dateFrom,
          dateTo,
        });
        if (mounted) {
          setLogs(data.items);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        if (mounted) {
          setLogs([]);
          setTotal(0);
          setTotalPages(1);
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o log de auditoria.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [dateFrom, dateTo, outcome, page, pageSize, query, reloadKey, severity, type]);

  function resetToFirstPageAnd(update: () => void) {
    setPage(1);
    update();
  }

  const filterFields = [
    {
      id: 'type',
      label: 'Tipo',
      value: type,
      type: 'select' as const,
      onChange: (value: string) => resetToFirstPageAnd(() => setType(value)),
      options: [
        { value: '', label: 'Todos os tipos' },
        { value: 'usuario', label: 'Usuário' },
        { value: 'admin', label: 'Admin' },
        { value: 'sonho', label: 'Sonho' },
        { value: 'proposta', label: 'Proposta' },
        { value: 'chat', label: 'Chat' },
        { value: 'denuncia', label: 'Denúncia' },
        { value: 'configuracao', label: 'Configuração' },
      ],
    },
    {
      id: 'severity',
      label: 'Severidade',
      value: severity,
      type: 'select' as const,
      onChange: (value: string) => resetToFirstPageAnd(() => setSeverity(value as AdminAuditLog['severity'] | '')),
      options: [
        { value: '', label: 'Todas' },
        { value: 'alta', label: 'Alta' },
        { value: 'media', label: 'Média' },
        { value: 'baixa', label: 'Baixa' },
      ],
    },
    {
      id: 'outcome',
      label: 'Resultado',
      value: outcome,
      type: 'select' as const,
      onChange: (value: string) => resetToFirstPageAnd(() => setOutcome(value as AdminAuditLog['outcome'] | '')),
      options: [
        { value: '', label: 'Todos' },
        { value: 'ok', label: 'OK' },
        { value: 'warn', label: 'Atenção' },
        { value: 'danger', label: 'Crítico' },
      ],
    },
    {
      id: 'dateFrom',
      label: 'De',
      value: dateFrom,
      type: 'date' as const,
      onChange: (value: string) => resetToFirstPageAnd(() => setDateFrom(value)),
    },
    {
      id: 'dateTo',
      label: 'Até',
      value: dateTo,
      type: 'date' as const,
      onChange: (value: string) => resetToFirstPageAnd(() => setDateTo(value)),
    },
  ];

  function renderContent() {
    if (loading) {
      return <AdminLoadingState title="Carregando auditoria" description="Buscando eventos administrativos com filtros aplicados." />;
    }

    if (error) {
      return (
        <AdminErrorState
          title="Não foi possível carregar auditoria"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => {
            setPage(1);
            setReloadKey((current) => current + 1);
          }}
        />
      );
    }

    if (logs.length === 0) {
      return (
        <AdminEmptyState
          title={hasFilters ? 'Nenhum evento encontrado' : 'Nenhum evento de auditoria'}
          description={hasFilters ? 'Ajuste busca, filtros ou período para ampliar a consulta.' : 'Quando ações administrativas ocorrerem, elas aparecerão aqui.'}
        />
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <article key={log.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-950">{log.action}</h2>
                  <AdminStatusBadge status={log.severity}>{log.severity}</AdminStatusBadge>
                  <AdminStatusBadge status={log.outcome}>{log.outcome}</AdminStatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{log.details}</p>
                <p className="mt-2 text-xs text-slate-500">{log.by} • {log.type} • {log.target}</p>
              </div>
              <div className="flex flex-col gap-2 lg:items-end">
                <span className="text-xs font-medium text-slate-500">{formatAdminDateTime(log.date)}</span>
                <button
                  type="button"
                  onClick={() => navigate(auditTargetPath(log))}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-pink-700 transition hover:bg-pink-50"
                >
                  Abrir origem
                </button>
              </div>
            </article>
          ))}
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
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Auditoria</h1>
        <p className="mt-1 text-sm text-slate-500">Rastro pesquisável de ações administrativas, decisões e eventos de moderação.</p>
      </div>

      <AdminListToolbar
        title="Eventos administrativos"
        description="Use busca e filtros combinados para investigar ator, alvo, tipo e resultado sem carregar toda a auditoria no cliente."
        totalLabel={`${total} eventos`}
        search={
          <AdminSearchInput
            value={query}
            onChange={(value) => resetToFirstPageAnd(() => setQuery(value))}
            placeholder="Buscar por ação, ator, alvo ou detalhes"
            label="Buscar auditoria"
          />
        }
        filters={<AdminFilters fields={filterFields} />}
      />

      {renderContent()}
    </div>
  );
}
