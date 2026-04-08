import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle, Clock, MessageCircle, XCircle } from 'lucide-react';
import { DreamStatusBadge, ProposalStatusBadge, UrgencyBadge } from '../../components/shared/StatusBadge';
import { ApiError, Proposal, PublicDream, dreamsApi, proposalsApi } from '../../lib/api';

export default function DreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState<PublicDream | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingProposalId, setActingProposalId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const [dreams, dreamProposals] = await Promise.all([
          dreamsApi.listMine(),
          dreamsApi.listProposals(id),
        ]);
        if (!mounted) return;
        setDream(dreams.find((item) => item.id === id) ?? null);
        setProposals(dreamProposals);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar os detalhes do sonho.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const pendingProposals = useMemo(
    () => proposals.filter((proposal) => proposal.status === 'enviada' || proposal.status === 'em-analise'),
    [proposals],
  );

  const handleAccept = async (proposalId: string) => {
    setActingProposalId(proposalId);
    try {
      const acceptedProposal = await proposalsApi.accept(proposalId);
      if (!id) return;
      const updated = await dreamsApi.listProposals(id);
      setProposals(updated);
      navigate(`/paciente/chat?conversationId=${acceptedProposal.conversationId}`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível aceitar a proposta agora.');
    } finally {
      setActingProposalId(null);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-10 text-sm text-gray-500">Carregando detalhes...</div>;
  }

  if (!dream) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4">
        <p className="text-sm text-red-700">{error || 'Sonho não encontrado.'}</p>
        <button
          onClick={() => navigate('/paciente/sonhos')}
          className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-4 py-2 rounded-xl"
        >
          Voltar para meus sonhos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-gray-800 mb-2" style={{ fontSize: '1.1rem' }}>{dream.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <DreamStatusBadge status={dream.status} />
              <UrgencyBadge urgency={dream.urgency} />
              <span className="text-xs text-pink-600">{dream.category}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">{new Date(dream.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{dream.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-pink-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Formato</p>
            <p className="text-sm text-gray-700">{dream.format}</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Privacidade</p>
            <p className="text-sm text-gray-700">{dream.privacy}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-pink-100 flex items-center justify-between">
          <h2 className="text-sm text-gray-800">Propostas ({proposals.length})</h2>
          {pendingProposals.length > 0 && (
            <span className="text-xs text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              {pendingProposals.length} pendente(s)
            </span>
          )}
        </div>

        {proposals.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Ainda não há propostas para este sonho.</div>
        ) : (
          <div className="divide-y divide-pink-50">
            {proposals.map((proposal) => {
              const pending = proposal.status === 'enviada' || proposal.status === 'em-analise';
              return (
                <div key={proposal.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{proposal.supporterName ?? 'Apoiador'}</p>
                      <p className="text-xs text-gray-500">{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <ProposalStatusBadge status={proposal.status} />
                  </div>

                  <p className="text-sm text-gray-600">{proposal.message}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">Oferece</p>
                      <p className="text-xs text-gray-700 mt-0.5">{proposal.offering}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">Disponibilidade</p>
                      <p className="text-xs text-gray-700 mt-0.5">{proposal.availability}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">Duração</p>
                      <p className="text-xs text-gray-700 mt-0.5">{proposal.duration}</p>
                    </div>
                  </div>

                  {pending && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(proposal.id)}
                        disabled={actingProposalId === proposal.id}
                        className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        {actingProposalId === proposal.id ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><CheckCircle className="w-4 h-4" /> Aceitar</>
                        )}
                      </button>
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-400 text-sm flex items-center gap-1.5 cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" /> Recusar
                      </button>
                    </div>
                  )}

                  {proposal.status === 'aceita' && (
                    <button
                      onClick={() => navigate('/paciente/chat')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Abrir chat
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-pink-100 p-4 flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-4 h-4" />
        Atualize a página para acompanhar novas propostas em tempo real.
      </div>
    </div>
  );
}
