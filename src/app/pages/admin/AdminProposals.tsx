import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, HandHeart, MapPin, MessageCircle } from 'lucide-react';
import { AdminProposalSummary, ApiError, Proposal, adminApi } from '../../lib/api';
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

type BooleanFilter = 'true' | 'false' | '';
type ProposalRiskFilter = 'high' | 'medium' | 'pending' | 'low' | '';

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

function proposalRisk(proposal: AdminProposalSummary): { level: AdminRiskLevel; label: string } {
  if (proposal.riskLevel === 'high') return { level: 'high', label: `${proposal.reportCount ?? 1} denúncia${(proposal.reportCount ?? 1) === 1 ? '' : 's'}` };
  if (proposal.riskLevel === 'medium') return { level: 'medium', label: `${proposal.reportCount ?? 1} denúncia${(proposal.reportCount ?? 1) === 1 ? '' : 's'}` };
  if (proposal.riskLevel === 'pending') return { level: 'pending', label: 'Em análise' };
  if ((proposal.reportCount ?? 0) > 0) return { level: 'medium', label: `${proposal.reportCount} denúncia${proposal.reportCount === 1 ? '' : 's'}` };
  return { level: 'low', label: 'Sem alerta' };
}

function supporterLabel(proposal: AdminProposalSummary) {
  return proposal.supporterName ?? 'Apoiador não informado';
}

function dreamLabel(proposal: AdminProposalSummary) {
  return proposal.dreamTitle ?? 'Sonho não informado';
}

export default function AdminProposals() {
  const [items, setItems] = useState<AdminProposalSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Proposal['status'] | ''>('');
  const [dream, setDream] = useState('');
  const [location, setLocation] = useState('');
  const [conversation, setConversation] = useState<BooleanFilter>('');
  const [report, setReport] = useState<BooleanFilter>('');
  const [risk, setRisk] = useState<ProposalRiskFilter>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProposals() {
      setLoading(true);
      setError('');

      try {
        const response = await adminApi.listProposals({
          page,
          pageSize,
          query,
          status,
          dream,
          location,
          conversation,
          report,
          risk,
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
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar propostas.');
          setItems([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProposals();

    return () => {
      mounted = false;
    };
  }, [page, pageSize, query, status, dream, location, conversation, report, risk, dateFrom, dateTo, reloadToken]);

  const hasActiveFilters = Boolean(query || status || dream || location || conversation || report || risk || dateFrom || dateTo);
  const riskCount = useMemo(() => items.filter((proposal) => (proposal.reportCount ?? 0) > 0 || proposal.riskLevel === 'high').length, [items]);

  const filterFields: AdminFilterField[] = [
    {
      id: 'status',
      label: 'Status',
      value: status,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'enviada', label: 'Enviada' },
        { value: 'em-analise', label: 'Em análise' },
        { value: 'aceita', label: 'Aceita' },
        { value: 'recusada', label: 'Recusada' },
        { value: 'expirada', label: 'Expirada' },
      ],
      onChange: (value) => {
        setPage(1);
        setStatus(value as Proposal['status'] | '');
      },
    },
    {
      id: 'dream',
      label: 'Sonho relacionado',
      value: dream,
      placeholder: 'Título ou categoria',
      onChange: (value) => {
        setPage(1);
        setDream(value);
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
      id: 'conversation',
      label: 'Com conversa',
      value: conversation,
      type: 'select',
      options: [
        { value: '', label: 'Todas' },
        { value: 'true', label: 'Com conversa' },
        { value: 'false', label: 'Sem conversa' },
      ],
      onChange: (value) => {
        setPage(1);
        setConversation(value as BooleanFilter);
      },
    },
    {
      id: 'report',
      label: 'Com denúncia',
      value: report,
      type: 'select',
      options: [
        { value: '', label: 'Todas' },
        { value: 'true', label: 'Com denúncia' },
        { value: 'false', label: 'Sem denúncia' },
      ],
      onChange: (value) => {
        setPage(1);
        setReport(value as BooleanFilter);
      },
    },
    {
      id: 'risk',
      label: 'Risco',
      value: risk,
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'high', label: 'Alto' },
        { value: 'medium', label: 'Médio' },
        { value: 'pending', label: 'Pendente' },
        { value: 'low', label: 'Baixo' },
      ],
      onChange: (value) => {
        setPage(1);
        setRisk(value as ProposalRiskFilter);
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
    setDream('');
    setLocation('');
    setConversation('');
    setReport('');
    setRisk('');
    setDateFrom('');
    setDateTo('');
  }

  function renderProposals() {
    if (loading) {
      return <AdminLoadingState title="Carregando propostas" description="Buscando apoiador, sonho, conversa e sinais de risco." />;
    }

    if (error) {
      return (
        <AdminErrorState
          title="Não foi possível carregar propostas"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => setReloadToken((current) => current + 1)}
        />
      );
    }

    if (items.length === 0) {
      return (
        <AdminEmptyState
          title={hasActiveFilters ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta registrada'}
          description={
            hasActiveFilters
              ? 'Ajuste busca, sonho, status, risco ou período para ampliar o recorte.'
              : 'Quando apoiadores enviarem propostas, elas aparecerão nesta fila.'
          }
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      );
    }

    return (
      <div className="divide-y divide-slate-100">
        {items.map((proposal) => {
          const riskBadge = proposalRisk(proposal);
          return (
            <article key={proposal.id} className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.85fr)_220px_150px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge status={proposal.status}>{proposal.status}</AdminStatusBadge>
                  <AdminRiskBadge level={riskBadge.level} label={riskBadge.label} />
                  {proposal.conversationId ? (
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                      Conversa {proposal.conversationStatus ?? 'vinculada'}
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      Sem conversa
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-950">{supporterLabel(proposal)}</h2>
                <p className="mt-1 text-sm font-medium text-slate-700">{dreamLabel(proposal)}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {proposal.message ?? proposal.offering ?? 'Mensagem não informada'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Criada em {formatDateTime(proposal.createdAt)}</span>
                  <span>Atualizada em {formatDateTime(proposal.updatedAt ?? proposal.createdAt)}</span>
                </div>
              </div>

              <div className="text-sm">
                <div className="text-xs font-medium text-slate-500">Sonho relacionado</div>
                <div className="mt-1 font-semibold text-slate-950">{dreamLabel(proposal)}</div>
                <div className="mt-3 text-xs font-medium text-slate-500">Localização</div>
                <div className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-950">
                  <MapPin className="size-4 text-slate-400" />
                  {proposal.locationLabel ?? 'Não informada'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-bold text-slate-950">{proposal.conversationId ? 1 : 0}</div>
                  <div className="mt-1 text-xs text-slate-500">conversa</div>
                </div>
                <div className={`rounded-xl border p-3 ${(proposal.reportCount ?? 0) > 0 ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-950'}`}>
                  <div className="font-bold">{proposal.reportCount ?? 0}</div>
                  <div className="mt-1 text-xs">{(proposal.reportCount ?? 0) === 1 ? 'denúncia' : 'denúncias'}</div>
                </div>
              </div>

              <div className="flex items-start justify-end">
                <Link
                  to={`/admin/propostas/${proposal.id}`}
                  aria-label={`Abrir proposta de ${supporterLabel(proposal)}`}
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
        eyebrow="Triagem de propostas"
        title="Propostas"
        subtitle="Acompanhamento administrativo de ofertas de apoio, contexto do sonho, conversa vinculada e sinais de moderação."
        meta={
          <>
            <span>{total} propostas encontradas</span>
            <span>{riskCount} com risco nesta página</span>
          </>
        }
      />

      <AdminListToolbar
        title="Lista de propostas"
        description="Busca e filtros consultam a API administrativa."
        totalLabel={loading ? 'Carregando total' : `${total} propostas`}
        search={
          <AdminSearchInput
            value={query}
            onChange={(value) => {
              setPage(1);
              setQuery(value);
            }}
            placeholder="Buscar por apoiador, sonho, mensagem ou cidade"
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
            <HandHeart className="size-4 text-pink-700" />
            Propostas operacionais
          </div>
          <div className="text-sm text-slate-500">Conversa e denúncia indicam contexto que precisa acompanhar a decisão.</div>
        </div>
        {renderProposals()}
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
            <div className="font-semibold text-slate-950">Nenhuma proposta selecionada nesta tela</div>
            <p className="mt-1">
              O detalhe abre em página dedicada para manter sonho, apoiador, conversa, denúncias e ações sensíveis no mesmo contexto.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
