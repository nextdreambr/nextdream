import { Link } from 'react-router';
import { Search, Send, MessageCircle, ChevronRight, Heart, Star, TrendingUp } from 'lucide-react';
import { mockDreams, mockProposals } from '../../data/mockData';
import { DreamCard } from '../../components/shared/DreamCard';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';

export default function SupporterDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const suggestedDreams = mockDreams.filter(d => d.status === 'publicado').slice(0, 3);
  const myProposals = mockProposals.filter(p => p.supporterId === 's1');
  const acceptedProposals = myProposals.filter(p => p.status === 'aceita').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
        <p className="text-teal-100 text-sm mb-1">Olá, {currentUser?.name?.split(' ')[0]} 💚</p>
        <h1 className="text-white mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Você pode mudar uma vida hoje</h1>
        <p className="text-teal-100 text-sm leading-relaxed mb-4">
          Explore sonhos de pessoas que precisam de presença, tempo e carinho. Sua contribuição não tem preço.
        </p>
        <Link
          to="/apoiador/explorar"
          className="inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors"
        >
          <Search className="w-4 h-4" />
          Explorar sonhos
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Propostas enviadas', value: myProposals.length, icon: Send, color: 'bg-blue-100 text-blue-600', link: '/apoiador/propostas' },
          { label: 'Conexões feitas', value: acceptedProposals, icon: Heart, color: 'bg-teal-100 text-teal-600', link: '/apoiador/chat' },
          { label: 'Sonhos disponíveis', value: mockDreams.filter(d => d.status === 'publicado').length, icon: Star, color: 'bg-pink-100 text-pink-600', link: '/apoiador/explorar' },
        ].map((s, i) => (
          <Link key={i} to={s.link}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all flex flex-col items-center text-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Suggested dreams */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-gray-800 text-sm">Sonhos esperando por você</h2>
            <p className="text-gray-400 text-xs">Sugestões baseadas no seu perfil</p>
          </div>
          <Link to="/apoiador/explorar" className="text-teal-600 text-xs hover:text-teal-700 flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="p-4 space-y-3">
          {suggestedDreams.map(dream => (
            <DreamCard key={dream.id} dream={dream} onClick={() => navigate(`/apoiador/sonhos/${dream.id}`)} />
          ))}
        </div>
      </div>

      {/* My recent proposals */}
      {myProposals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-800 text-sm">Minhas propostas recentes</h2>
            <Link to="/apoiador/propostas" className="text-teal-600 text-xs hover:text-teal-700 flex items-center gap-1">
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myProposals.slice(0, 3).map(prop => (
              <div key={prop.id} className="px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-lg shrink-0">
                  {prop.dreamTitle.includes('praia') ? '🌅' : prop.dreamTitle.includes('violão') ? '🎵' : '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{prop.dreamTitle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {prop.status === 'aceita' ? '✅ Aceita — chat aberto!' : prop.status === 'em-analise' ? '⏳ Em análise' : '📬 Enviada'}
                  </p>
                </div>
                {prop.status === 'aceita' && (
                  <Link to="/apoiador/chat" className="flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2.5 py-1.5 rounded-xl">
                    <MessageCircle className="w-3 h-3" /> Chat
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact reminder */}
      <div className="bg-gradient-to-r from-pink-50 to-teal-50 border border-pink-100 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">Seu impacto importa</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Apoiadores como você já realizaram <strong>98 conexões</strong> desde que o NextDream começou. Cada sonho realizado é uma vida transformada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
