import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CalendarClock, ExternalLink, FileWarning, ShieldAlert } from 'lucide-react';
import { AdminReportSeverity, AdminReportSummary, ApiError, adminApi } from '../../lib/api';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilters,
  AdminListToolbar,
  AdminLoadingState,
  AdminPageHeader,
  AdminPagination,
  AdminRiskBadge,
  AdminSearchInput,
  AdminStatusBadge,
  type AdminFilterField,
  type AdminRiskLevel,
} from './components';

type ReportStatusFilter = AdminReportSummary['status'] | '';
type ReportSeverityFilter = AdminReportSeverity | '';

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

function reportEntity(report: AdminReportSummary) {
  return report.entityLabel ?? report.targetSummary?.dreamTitle ?? `${targetTypeLabel(report.targetType)} ${report.targetId}`;
}

function reporterLabel(report: AdminReportSummary) {
  return report.reporterName ?? 'Não informado';
}

function accusedLabel(report: AdminReportSummary) {
  return report.accusedName ?? report.targetSummary?.senderName ?? report.targetSummary?.supporterName ?? report.targetSummary?.patientName ?? 'Não informado';
}

export default function AdminReports() {
  const [items, setItems] = useState<AdminReportSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ReportStatusFilter>('aberto');
  const [severity, setSeverity] = useState<ReportSeverityFilter>('');
  const [type, setType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [entity, setEntity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      setLoading(true);
      setError('');

      try {
        const response = await adminApi.listReports({
          page,
          pageSize,
          query,
          status,
          severity,
          type,
          targetType,
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
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar denúncias.');
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

    void loadReports();

    return () => {
      mounted = false;
    };
  }, [page, pageSize, query, status, severity, type, targetType, entity, dateFrom, dateTo, reloadToken]);

  const hasActiveFilters = Boolean(query || status || severity || type || targetType || entity || dateFrom || dateTo);
  const criticalCount = useMemo(
    () => items.filter((report) => report.severity === 'critical' || report.severity === 'high').length,
    [items],
  );

  const filterFields: AdminFilterField[] = [
    {
      id: 'status',
      label: 'Status',
      value: status,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'aberto', label: 'Aberto' },
        { value: 'em-analise', label: 'Em análise' },
        { value: 'resolvido', label: 'Resolvido' },
      ],
      onChange: (value) => {
        setPage(1);
        setStatus(value as ReportStatusFilter);
      },
    },
    {
      id: 'severity',
      label: 'Severidade',
      value: severity,
      type: 'select',
      options: [
        { value: '', label: 'Todas' },
        { value: 'critical', label: 'Crítica' },
        { value: 'high', label: 'Alta' },
        { value: 'medium', label: 'Média' },
        { value: 'low', label: 'Baixa' },
      ],
      onChange: (value) => {
        setPage(1);
        setSeverity(value as ReportSeverityFilter);
      },
    },
    {
      id: 'type',
      label: 'Tipo da denúncia',
      value: type,
      placeholder: 'chat-moderation',
      onChange: (value) => {
        setPage(1);
        setType(value);
      },
    },
    {
      id: 'targetType',
      label: 'Tipo de alvo',
      value: targetType,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'chat', label: 'Chat' },
        { value: 'message', label: 'Mensagem' },
        { value: 'dream', label: 'Sonho' },
        { value: 'proposal', label: 'Proposta' },
        { value: 'user', label: 'Usuário' },
      ],
      onChange: (value) => {
        setPage(1);
        setTargetType(value);
      },
    },
    {
      id: 'entity',
      label: 'Entidade relacionada',
      value: entity,
      placeholder: 'Sonho, chat, usuário ou alvo',
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
    setSeverity('');
    setType('');
    setTargetType('');
    setEntity('');
    setDateFrom('');
    setDateTo('');
  }

  function renderReports() {
    if (loading) {
      return <AdminLoadingState title="Carregando denúncias" description="Buscando fila, severidade e entidades relacionadas." />;
    }

    if (error) {
      return (
        <AdminErrorState
          title="Não foi possível carregar denúncias"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => setReloadToken((current) => current + 1)}
        />
      );
    }

    if (items.length === 0) {
      return (
        <AdminEmptyState
          title={hasActiveFilters ? 'Nenhuma denúncia encontrada' : 'Nenhuma denúncia registrada'}
          description={
            hasActiveFilters
              ? 'Ajuste status, severidade, tipo ou entidade para ampliar a busca.'
              : 'Quando houver denúncias ou sinalizações, elas aparecerão nesta fila.'
          }
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      );
    }

    return (
      <div className="divide-y divide-slate-100">
        {items.map((report) => {
          const severity = severityBadge(report.severity);
          return (
            <article key={report.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)_190px_150px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminRiskBadge level={severity.level} label={severity.label} />
                  <AdminStatusBadge status={report.status}>{report.status}</AdminStatusBadge>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {targetTypeLabel(report.targetType)}
                  </span>
                </div>
                <h2 className="mt-3 text-sm font-semibold text-slate-950">{report.type}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{report.reason}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    Criada em {formatDateTime(report.createdAt)}
                  </span>
                  <span>Atualizada em {formatDateTime(report.updatedAt ?? report.resolvedAt ?? report.createdAt)}</span>
                </div>
              </div>

              <div className="text-sm">
                <div className="text-xs font-medium text-slate-500">Entidade relacionada</div>
                <div className="mt-1 font-semibold text-slate-950">{reportEntity(report)}</div>
                <div className="mt-2 text-xs text-slate-500">Alvo: {report.targetId}</div>
              </div>

              <div className="grid gap-2 text-sm">
                <div>
                  <div className="text-xs font-medium text-slate-500">Denunciante</div>
                  <div className="mt-1 font-semibold text-slate-900">{reporterLabel(report)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Denunciado</div>
                  <div className="mt-1 font-semibold text-slate-900">{accusedLabel(report)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Responsável</div>
                  <div className="mt-1 font-semibold text-slate-900">{report.responsibleName ?? 'Não atribuído'}</div>
                </div>
              </div>

              <div className="flex items-start justify-end">
                <Link
                  to={`/admin/denuncias/${report.id}`}
                  aria-label={`Abrir denúncia ${report.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-800 transition hover:bg-pink-100"
                >
                  Abrir
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Risco e moderação"
        title="Denúncias"
        subtitle="Central operacional para priorizar, investigar e resolver denúncias com severidade, status, entidade relacionada e histórico rastreável."
        meta={
          <>
            <span>{total} denúncias encontradas</span>
            <span>{criticalCount} críticas/altas nesta página</span>
          </>
        }
      />

      <AdminListToolbar
        title="Fila de denúncias"
        description="Busca e filtros são aplicados na API administrativa. A resolução acontece no detalhe da denúncia."
        totalLabel={loading ? 'Carregando total' : `${total} denúncias`}
        search={
          <AdminSearchInput
            value={query}
            onChange={(value) => {
              setPage(1);
              setQuery(value);
            }}
            placeholder="Buscar por tipo, motivo, alvo ou entidade"
            debounceMs={250}
          />
        }
        filters={<AdminFilters fields={filterFields} />}
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

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <FileWarning className="size-4 text-pink-700" />
            Casos
          </div>
          <div className="text-sm text-slate-500">Priorize severidade alta antes de casos resolvidos.</div>
        </div>
        {renderReports()}
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

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4" />
          <div>
            <div className="font-semibold">Limitações de atribuição</div>
            <p className="mt-1 text-amber-800">
              O contrato atual ainda não registra denunciante, responsável ou severidade persistida. A severidade exibida é calculada a partir do tipo, alvo e status da denúncia.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
