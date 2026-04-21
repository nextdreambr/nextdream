import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Send, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ProposalStatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ApiError, Proposal, proposalsApi } from '../../lib/api';

export default function MyProposals() {
  const navigate = useNavigate();
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const proposals = await proposalsApi.listMine();
        if (mounted) setMyProposals(proposals);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar suas propostas.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const statusIcon = {
    enviada: <Send className="w-4 h-4 text-blue-500" />,
    'em-analise': <Clock className="w-4 h-4 text-yellow-500" />,
    aceita: <CheckCircle className="w-4 h-4 text-green-500" />,
    recusada: <XCircle className="w-4 h-4 text-red-500" />,
    expirada: <XCircle className="w-4 h-4 text-gray-400" />,
  };

  const statusGroups = [
    { key: 'aceita', label: 'Aceitas', emoji: '✅' },
    { key: 'em-analise', label: 'Em análise', emoji: '⏳' },
    { key: 'enviada', label: 'Enviadas', emoji: '📬' },
    { key: 'recusada', label: 'Recusadas', emoji: '❌' },
  ];

  return (
    <div data-sandbox-tour-id="supporter-proposals-panel" className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Minhas Propostas</h1>
        <p className="text-gray-500 text-sm">{myProposals.length} propostas enviadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {statusGroups.map(group => {
          const count = myProposals.filter(p => p.status === group.key).length;
          return (
            <div key={group.key} className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
              <p className="text-lg mb-1">{group.emoji}</p>
              <p className="text-xl text-gray-800" style={{ fontWeight: 700 }}>{count}</p>
              <p className="text-gray-500 text-xs">{group.label}</p>
            </div>
          );
        })}
      </div>

      {myProposals.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Nenhuma proposta ainda"
          description="Explore sonhos publicados e envie sua primeira proposta. Pode ser o começo de uma conexão incrível."
          actionLabel="Explorar sonhos"
          onAction={() => navigate('/apoiador/explorar')}
        />
      ) : (
        <div className="space-y-3">
          {myProposals.map(proposal => (
            <div
              key={proposal.id}
              onClick={() => navigate(`/apoiador/sonhos/${proposal.dreamId}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/apoiador/sonhos/${proposal.dreamId}`);
                }
              }}
              role="button"
              tabIndex={0}
              className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-sm
                ${proposal.status === 'aceita' ? 'border-green-200' : proposal.status === 'recusada' ? 'border-gray-200 opacity-70' : 'border-gray-100'} text-left w-full cursor-pointer`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-xl shrink-0">
                  {proposal.dreamTitle?.includes('praia') ? '🌅' : proposal.dreamTitle?.includes('histórias') ? '💬' : proposal.dreamTitle?.includes('sarau') ? '📚' : '✨'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{proposal.dreamTitle ?? 'Sonho'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Enviada em {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <ProposalStatusBadge status={proposal.status} />
              </div>

              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">{proposal.message}</p>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                {statusIcon[proposal.status]}
                <span className="capitalize">{proposal.status}</span>
                <span className="text-gray-300">•</span>
                <span>{proposal.availability}</span>
              </div>

              {proposal.status === 'aceita' && (
                <div className="mt-3 pt-3 border-t border-green-100">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate('/apoiador/chat');
                    }}
                    className="flex items-center gap-2 text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" /> Abrir conversa
                  </button>
                </div>
              )}
            </div>
          ))}
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
