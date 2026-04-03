import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { ArrowLeft, Star, MapPin, Video, MapPinned, Clock, CheckCircle, XCircle, MessageCircle, Edit2, MoreVertical } from 'lucide-react';
import { mockDreams, mockProposals } from '../../data/mockData';
import { DreamStatusBadge, ProposalStatusBadge, UrgencyBadge } from '../../components/shared/StatusBadge';

export default function DreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'geral' | 'propostas' | 'atualizacoes'>('propostas');
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [refusedId, setRefusedId] = useState<string[]>([]);
  const [showRefuseModal, setShowRefuseModal] = useState<string | null>(null);

  const dream = mockDreams.find(d => d.id === id) || mockDreams[0];
  const proposals = mockProposals.filter(p => p.dreamId === dream.id);

  const handleAccept = (proposalId: string) => {
    setAcceptedId(proposalId);
    setTimeout(() => navigate('/paciente/chat'), 1000);
  };

  const handleRefuse = (proposalId: string) => {
    setRefusedId(prev => [...prev, proposalId]);
    setShowRefuseModal(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Dream header */}
      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 border-b border-pink-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl shrink-0">
                {dream.category === 'Experiência ao ar livre' ? '🌅' : dream.category === 'Arte e Música' ? '🎵' : dream.category === 'Culinária' ? '🍳' : '✨'}
              </div>
              <div>
                <h1 className="text-gray-800 mb-2" style={{ fontSize: '1.1rem' }}>{dream.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <DreamStatusBadge status={dream.status} size="md" />
                  {dream.urgency !== 'baixa' && <UrgencyBadge urgency={dream.urgency} />}
                  <span className="text-xs text-pink-600">{dream.category}</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-pink-100 rounded-xl transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pink-100">
          {(['geral', 'propostas', 'atualizacoes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors
                ${activeTab === tab ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'geral' ? 'Visão geral' : tab === 'propostas' ? `Propostas (${proposals.length})` : 'Atualizações'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'geral' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-gray-700 text-sm mb-2">Descrição</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{dream.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: dream.format === 'remoto' ? Video : MapPinned, label: 'Formato', value: dream.format === 'remoto' ? 'Online' : dream.format === 'presencial' ? 'Presencial' : 'Ambos' },
                  { icon: MapPin, label: 'Localização', value: dream.patientCity || 'Não informada' },
                  { icon: Clock, label: 'Publicado em', value: new Date(dream.createdAt).toLocaleDateString('pt-BR') },
                  { icon: Star, label: 'Propostas', value: `${proposals.length} recebida${proposals.length !== 1 ? 's' : ''}` },
                ].map((item, i) => (
                  <div key={i} className="bg-pink-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-700">{item.value}</p>
                  </div>
                ))}
              </div>

              {dream.restrictions && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Restrições importantes</p>
                  <p className="text-sm text-amber-600">{dream.restrictions}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-pink-200 text-pink-700 rounded-xl text-sm hover:bg-pink-50 transition-colors">
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'propostas' && (
            <div className="space-y-4">
              {proposals.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-pink-400" />
                  </div>
                  <p className="text-gray-600 text-sm">Nenhuma proposta ainda</p>
                  <p className="text-gray-400 text-xs mt-1">Apoiadores poderão enviar propostas quando seu sonho estiver publicado.</p>
                </div>
              ) : (
                proposals.map(proposal => {
                  const isAccepted = acceptedId === proposal.id || proposal.status === 'aceita';
                  const isRefused = refusedId.includes(proposal.id) || proposal.status === 'recusada';

                  return (
                    <div key={proposal.id}
                      className={`rounded-xl border p-5 transition-all
                        ${isAccepted ? 'border-green-200 bg-green-50' : isRefused ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-pink-100 bg-pink-50/30'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-pink-200 flex items-center justify-center text-pink-700 font-semibold text-sm">
                            {proposal.supporterName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{proposal.supporterName}</p>
                            <p className="text-xs text-gray-500">{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <ProposalStatusBadge status={isAccepted ? 'aceita' : isRefused ? 'recusada' : proposal.status} />
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{proposal.message}</p>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                          { label: 'O que oferece', value: proposal.offering },
                          { label: 'Disponibilidade', value: proposal.availability },
                          { label: 'Duração estimada', value: proposal.duration },
                        ].map((item, i) => (
                          <div key={i} className="bg-white rounded-lg p-2.5">
                            <p className="text-xs text-gray-400">{item.label}</p>
                            <p className="text-xs text-gray-700 mt-0.5">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {!isAccepted && !isRefused && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAccept(proposal.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" /> Aceitar proposta
                          </button>
                          <button
                            onClick={() => setShowRefuseModal(proposal.id)}
                            className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {isAccepted && (
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Proposta aceita! O chat foi aberto. 🎉</span>
                          <button onClick={() => navigate('/paciente/chat')} className="ml-auto flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-xl text-xs">
                            <MessageCircle className="w-3.5 h-3.5" /> Ir para o chat
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'atualizacoes' && (
            <div className="space-y-3">
              {[
                { date: '20/02/2026', text: 'Proposta de Pedro Rocha aceita. Chat aberto.' },
                { date: '18/02/2026', text: 'Nova proposta recebida de Pedro Rocha.' },
                { date: '15/02/2026', text: 'Sonho publicado com sucesso.' },
              ].map((u, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-600">{u.text}</p>
                    <p className="text-xs text-gray-400">{u.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refuse modal */}
      {showRefuseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-gray-800 mb-2">Recusar proposta</h3>
            <p className="text-gray-500 text-sm mb-4">Quer deixar um motivo? (opcional, mas ajuda o apoiador)</p>
            <textarea placeholder="Opcional: O que você poderia melhorar..." rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowRefuseModal(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleRefuse(showRefuseModal)} className="flex-1 bg-red-100 text-red-700 py-2.5 rounded-xl text-sm font-medium hover:bg-red-200">Recusar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}