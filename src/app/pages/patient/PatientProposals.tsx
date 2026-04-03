import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Inbox, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { mockProposals, mockDreams } from '../../data/mockData';
import { ProposalStatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';

export default function PatientProposals() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState<string[]>(['pr2']);
  const [refused, setRefused] = useState<string[]>([]);

  const myDreamIds = mockDreams.filter(d => d.patientId === 'p1').map(d => d.id);
  const proposals = mockProposals.filter(p => myDreamIds.includes(p.dreamId));

  const getStatus = (p: typeof proposals[0]) => {
    if (accepted.includes(p.id)) return 'aceita';
    if (refused.includes(p.id)) return 'recusada';
    return p.status;
  };

  const pending = proposals.filter(p => !accepted.includes(p.id) && !refused.includes(p.id) && p.status !== 'aceita' && p.status !== 'recusada');

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
                      {proposal.supporterName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{proposal.supporterName}</p>
                      <p className="text-xs text-pink-600">{proposal.dreamTitle}</p>
                    </div>
                  </div>
                  <ProposalStatusBadge status={status as any} />
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

                {isPending && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setAccepted(a => [...a, proposal.id]); setTimeout(() => navigate('/paciente/chat'), 500); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Aceitar
                    </button>
                    <button
                      onClick={() => setRefused(r => [...r, proposal.id])}
                      className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Recusar
                    </button>
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
    </div>
  );
}
