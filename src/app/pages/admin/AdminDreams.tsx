import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, FileText, MapPin, MessageCircle } from 'lucide-react';
import { AdminDreamSummary, ApiError, PublicDream, adminApi } from '../../lib/api';
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

type ProposalFilter = 'with' | 'without' | '';
type BooleanFilter = 'true' | 'false' | '';

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

function requesterLabel(dream: AdminDreamSummary) {
  return dream.institutionName ?? dream.operatorName ?? dream.patientName ?? 'Solicitante não informado';
}

function beneficiaryLabel(dream: AdminDreamSummary) {
  if (dream.managedPatientName) return dream.managedPatientName;
  if (dream.institutionName && dream.patientName) return dream.patientName;
  return 'Não informado';
}

function dreamRisk(dream: AdminDreamSummary): { level: AdminRiskLevel; label: string } {
  if ((dream.reportCount ?? 0) > 0) return { level: 'high', label: `${dream.reportCount} denúncia${dream.reportCount === 1 ? '' : 's'}` };
  if (dream.status === 'pausado' || dream.status === 'cancelado') return { level: 'medium', label: 'Pendência' };
  if ((dream.proposalCount ?? 0) === 0) return { level: 'pending', label: 'Sem proposta' };
  return { level: 'low', label: 'Sem alerta' };
}

export default function AdminDreams() {
  const [items, setItems] = useState<AdminDreamSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PublicDream['status'] | ''>('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [report, setReport] = useState<BooleanFilter>('');
  const [proposal, setProposal] = useState<ProposalFilter>('');
  const [format, setFormat] = useState<PublicDream['format'] | ''>('');
  const [urgency, setUrgency] = useState<PublicDream['urgency'] | ''>('');
  const [privacy, setPrivacy] = useState<PublicDream['privacy'] | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDreams() {
      setLoading(true);
      setError('');

      try {
        const response = await adminApi.listDreams({
          page,
          pageSize,
          query,
          status,
          category,
          location,
          report,
          proposal,
          format,
          urgency,
          privacy,
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
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar sonhos.');
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

    void loadDreams();

    return () => {
      mounted = false;
    };
  }, [page, pageSize, query, status, category, location, report, proposal, format, urgency, privacy, dateFrom, dateTo, reloadToken]);

  const hasActiveFilters = Boolean(query || status || category || location || report || proposal || format || urgency || privacy || dateFrom || dateTo);
  const pendingCount = useMemo(
    () => items.filter((dream) => (dream.reportCount ?? 0) > 0 || (dream.proposalCount ?? 0) === 0 || dream.status === 'pausado').length,
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
        { value: 'rascunho', label: 'Rascunho' },
        { value: 'publicado', label: 'Publicado' },
        { value: 'em-conversa', label: 'Em conversa' },
        { value: 'realizando', label: 'Realizando' },
        { value: 'concluido', label: 'Concluído' },
        { value: 'pausado', label: 'Pausado' },
        { value: 'cancelado', label: 'Cancelado' },
      ],
      onChange: (value) => {
        setPage(1);
        setStatus(value as PublicDream['status'] | '');
      },
    },
    {
      id: 'category',
      label: 'Categoria',
      value: category,
      placeholder: 'Categoria',
      onChange: (value) => {
        setPage(1);
        setCategory(value);
      },
    },
    {
      id: 'location',
      label: 'Cidade ou estado',
      value: location,
      placeholder: 'Niterói, RJ',
      onChange: (value) => {
        setPage(1);
        setLocation(value);
      },
    },
    {
      id: 'report',
      label: 'Com denúncia',
      value: report,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Com denúncia' },
        { value: 'false', label: 'Sem denúncia' },
      ],
      onChange: (value) => {
        setPage(1);
        setReport(value as BooleanFilter);
      },
    },
    {
      id: 'proposal',
      label: 'Propostas',
      value: proposal,
      type: 'select',
      options: [
        { value: '', label: 'Todas' },
        { value: 'with', label: 'Com proposta' },
        { value: 'without', label: 'Sem proposta' },
      ],
      onChange: (value) => {
        setPage(1);
        setProposal(value as ProposalFilter);
      },
    },
    {
      id: 'format',
      label: 'Formato',
      value: format,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'remoto', label: 'Remoto' },
        { value: 'presencial', label: 'Presencial' },
        { value: 'ambos', label: 'Ambos' },
      ],
      onChange: (value) => {
        setPage(1);
        setFormat(value as PublicDream['format'] | '');
      },
    },
    {
      id: 'urgency',
      label: 'Urgência',
      value: urgency,
      type: 'select',
      options: [
        { value: '', label: 'Todas' },
        { value: 'baixa', label: 'Baixa' },
        { value: 'media', label: 'Média' },
        { value: 'alta', label: 'Alta' },
      ],
      onChange: (value) => {
        setPage(1);
        setUrgency(value as PublicDream['urgency'] | '');
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
    setCategory('');
    setLocation('');
    setReport('');
    setProposal('');
    setFormat('');
    setUrgency('');
    setPrivacy('');
    setDateFrom('');
    setDateTo('');
  }

  function renderDreams() {
    if (loading) {
      return <AdminLoadingState title="Carregando sonhos" description="Buscando status, propostas, conversas e denúncias relacionadas." />;
    }

    if (error) {
      return (
        <AdminErrorState
          title="Não foi possível carregar sonhos"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => setReloadToken((current) => current + 1)}
        />
      );
    }

    if (items.length === 0) {
      return (
        <AdminEmptyState
          title={hasActiveFilters ? 'Nenhum sonho encontrado' : 'Nenhum sonho registrado'}
          description={
            hasActiveFilters
              ? 'Ajuste busca, status, categoria, localização ou pendências para ampliar o recorte.'
              : 'Quando houver sonhos cadastrados, eles aparecerão nesta fila.'
          }
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      );
    }

    return (
      <div className="divide-y divide-slate-100">
        {items.map((dream) => {
          const risk = dreamRisk(dream);
          return (
            <article key={dream.id} className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)_220px_150px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge status={dream.status}>{dream.status}</AdminStatusBadge>
                  <AdminRiskBadge level={risk.level} label={risk.label} />
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {dream.category}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-950">{dream.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" />
                    {dream.locationLabel ?? 'Localização não informada'}
                  </span>
                  <span>{dream.format}</span>
                  <span>Urgência {dream.urgency}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Criado em {formatDateTime(dream.createdAt)}</span>
                  <span>Atualizado em {formatDateTime(dream.updatedAt)}</span>
                </div>
              </div>

              <div className="text-sm">
                <div className="text-xs font-medium text-slate-500">Solicitante</div>
                <div className="mt-1 font-semibold text-slate-950">{requesterLabel(dream)}</div>
                <div className="mt-3 text-xs font-medium text-slate-500">Beneficiário</div>
                <div className="mt-1 font-semibold text-slate-950">{beneficiaryLabel(dream)}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-bold text-slate-950">{dream.proposalCount ?? 0}</div>
                  <div className="mt-1 text-xs text-slate-500">propostas</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-bold text-slate-950">{dream.chatCount ?? 0}</div>
                  <div className="mt-1 text-xs text-slate-500">chats</div>
                </div>
                <div className={`rounded-xl border p-3 ${(dream.reportCount ?? 0) > 0 ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-950'}`}>
                  <div className="font-bold">{dream.reportCount ?? 0}</div>
                  <div className="mt-1 text-xs">{(dream.reportCount ?? 0) === 1 ? 'denúncia' : 'denúncias'}</div>
                </div>
              </div>

              <div className="flex items-start justify-end">
                <Link
                  to={`/admin/sonhos/${dream.id}`}
                  aria-label={`Abrir sonho ${dream.title}`}
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
        eyebrow="Moderação de sonhos"
        title="Sonhos"
        subtitle="Fila administrativa para acompanhar publicação, propostas, conversas e denúncias relacionadas a cada sonho."
        meta={
          <>
            <span>{total} sonhos encontrados</span>
            <span>{pendingCount} pendências nesta página</span>
          </>
        }
      />

      <AdminListToolbar
        title="Lista de sonhos"
        description="Busca e filtros são aplicados na API administrativa."
        totalLabel={loading ? 'Carregando total' : `${total} sonhos`}
        search={
          <AdminSearchInput
            value={query}
            onChange={(value) => {
              setPage(1);
              setQuery(value);
            }}
            placeholder="Buscar por título, solicitante, beneficiário, cidade ou categoria"
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
            <FileText className="size-4 text-pink-700" />
            Sonhos operacionais
          </div>
          <div className="text-sm text-slate-500">Denúncias e ausência de propostas aparecem como pendência.</div>
        </div>
        {renderDreams()}
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <MessageCircle className="mt-0.5 size-4 text-slate-400" />
          <div>
            <div className="font-semibold text-slate-950">Nenhum sonho selecionado nesta tela</div>
            <p className="mt-1">
              A investigação completa abre em página dedicada para preservar contexto, abas e ações sensíveis sem modal.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
