import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, Inbox, MessageCircle, Search, XCircle } from 'lucide-react';
import { ProposalStatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ApiError, Proposal, proposalsApi } from '../../lib/api';
import { EntityPagination } from '../../components/shared/EntityPagination';

const PAGE_SIZE = 6;

const statusOptions: Array<{ value: Proposal['status'] | ''; label: string }> = [
  { value: '', label: 'Todos os status' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'em-analise', label: 'Em análise' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'recusada', label: 'Recusada' },
];

export default function InstitutionProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Proposal['status'] | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  async function loadProposals(nextPage = page, nextQuery = query, nextStatus = status) {
    setLoading(true);
    try {
      const data = await proposalsApi.listReceivedPage({
        page: nextPage,
        pageSize: PAGE_SIZE,
        query: nextQuery,
        status: nextStatus,
      });
      setProposals(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível carregar as propostas recebidas pela instituição.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProposals(page, query, status);
  }, [page, query, status]);

  const pending = proposals.filter((proposal) => proposal.status === 'em-analise' || proposal.status === 'enviada');

  async function handleAccept(proposalId: string) {
    setAcceptingId(proposalId);
    setError('');
    try {
      const acceptedProposal = await proposalsApi.accept(proposalId);
      await loadProposals(page, query, status);
      navigate(`/instituicao/chat?conversationId=${acceptedProposal.conversationId}`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível aceitar a proposta agora.');
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleReject(proposalId: string) {
    setRejectingId(proposalId);
    setError('');
    try {
      await proposalsApi.reject(proposalId);
      await loadProposals(page, query, status);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível recusar a proposta agora.');
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Propostas recebidas</h1>
        <p className="text-gray-500 text-sm">
          {pending.length} aguardando avaliação institucional • {total} proposta{total === 1 ? '' : 's'} no filtro atual
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar propostas"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as Proposal['status'] | '');
            setPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white border border-indigo-100 rounded-2xl p-6 text-sm text-gray-500">
          Carregando propostas...
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhuma proposta ainda"
          description="Quando apoiadores enviarem propostas para sonhos da instituição, elas aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const isPending = proposal.status === 'em-analise' || proposal.status === 'enviada';

            return (
              <div key={proposal.id} className="bg-white rounded-2xl border border-indigo-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{proposal.supporterName ?? 'Apoiador'}</p>
                    <p className="text-xs text-indigo-600">{proposal.dreamTitle ?? 'Sonho'}</p>
                  </div>
                  <ProposalStatusBadge status={proposal.status} />
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-3">{proposal.message}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Oferece', value: proposal.offering },
                    { label: 'Disponibilidade', value: proposal.availability },
                    { label: 'Duração', value: proposal.duration },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-xs text-gray-700 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {isPending ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(proposal.id)}
                      disabled={acceptingId === proposal.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      {acceptingId === proposal.id ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Aceitar</>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(proposal.id)}
                      aria-label={`Recusar proposta de ${proposal.supporterName ?? 'Apoiador'}`}
                      disabled={rejectingId === proposal.id}
                      className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      {rejectingId === proposal.id ? (
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : (
                        <><XCircle className="w-4 h-4" /> Recusar</>
                      )}
                    </button>
                  </div>
                ) : proposal.status === 'aceita' ? (
                  <button
                    onClick={() => navigate('/instituicao/chat')}
                    className="inline-flex items-center gap-2 text-sm text-green-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir conversa
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <EntityPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
