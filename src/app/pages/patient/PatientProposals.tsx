import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Inbox, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { ProposalStatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ApiError, Proposal, proposalsApi } from '../../lib/api';

export default function PatientProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [refused, setRefused] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await proposalsApi.listReceived();
        if (mounted) {
          setProposals(data);
          setAccepted(data.filter((proposal) => proposal.status === 'aceita').map((proposal) => proposal.id));
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar as propostas recebidas.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatus = (p: Proposal) => {
    if (accepted.includes(p.id)) return 'aceita';
    if (refused.includes(p.id)) return 'recusada';
    return p.status;
  };

  const pending = proposals.filter(p => !accepted.includes(p.id) && !refused.includes(p.id) && p.status !== 'aceita' && p.status !== 'recusada');

  const handleAccept = async (proposalId: string) => {
    setAcceptingId(proposalId);
    try {
      const acceptedProposal = await proposalsApi.accept(proposalId);
      setAccepted((current) => [...current, proposalId]);
      setTimeout(() => navigate(`/paciente/chat?conversationId=${acceptedProposal.conversationId}`), 300);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível aceitar a proposta agora.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Propostas recebidas</h1>
        <p className="text-gray-500 text-sm">{pending.length} aguardando sua decisão</p>
      </div>

      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm text-amber-700">
            Você tem <strong>{pending.length}</strong> proposta{pending.length > 1 ? 's' : ''} aguardando revisão.
          </p>
        </div>
      )}

      {proposals.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhuma proposta ainda"
          description="Quando apoiadores enviarem propostas para seus sonhos, elas aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {proposals.map(proposal => {
            const status = getStatus(proposal);
            const isPending = status === 'em-analise' || status === 'enviada';

            return (
              <div key={proposal.id}
                className={`bg-white rounded-2xl border p-5 transition-all
                  ${status === 'aceita' ? 'border-green-200' : status === 'recusada' ? 'border-gray-200 opacity-70' : 'border-pink-100 hover:border-pink-200 hover:shadow-sm'}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 font-semibold">
                      {(proposal.supporterName ?? 'A')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{proposal.supporterName ?? 'Apoiador'}</p>
                      <p className="text-xs text-pink-600">{proposal.dreamTitle ?? 'Sonho'}</p>
                      {proposal.managedByInstitution && proposal.institutionName && (
                        <p className="text-xs text-indigo-600 mt-1">Operado por {proposal.institutionName}</p>
                      )}
                    </div>
                  </div>
                  <ProposalStatusBadge status={status} />
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-3">{proposal.message}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Oferece', value: proposal.offering },
                    { label: 'Disponibilidade', value: proposal.availability },
                    { label: 'Duração', value: proposal.duration },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-xs text-gray-700 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {isPending && proposal.canRespond !== false && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(proposal.id)}
                      disabled={acceptingId === proposal.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      {acceptingId === proposal.id ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Aceitar</>
                      )}
                    </button>
                    <button
                      onClick={() => setRefused(r => [...r, proposal.id])}
                      className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Recusar
                    </button>
                  </div>
                )}

                {isPending && proposal.canRespond === false && (
                  <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                    A instituição responsável segue operando esta proposta. Você pode acompanhar o andamento por aqui.
                  </div>
                )}

                {status === 'aceita' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Proposta aceita!
                    </span>
                    <button onClick={() => navigate('/paciente/chat')}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-green-700 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" /> Abrir chat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
