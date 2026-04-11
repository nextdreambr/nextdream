import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search, Send, MessageCircle, ChevronRight, Heart, Star, TrendingUp } from 'lucide-react';
import { DreamCard } from '../../components/shared/DreamCard';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';
import { ApiError, PublicDream, Proposal, dreamsApi, proposalsApi } from '../../lib/api';
import { buildProposalMapByDream } from '../../lib/proposals';

export default function SupporterDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [suggestedDreams, setSuggestedDreams] = useState<PublicDream[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [proposalByDream, setProposalByDream] = useState<Map<string, Proposal>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [dreams, proposals] = await Promise.all([
          dreamsApi.listPublic(),
          proposalsApi.listMine(),
        ]);
        if (!mounted) return;
        setSuggestedDreams(dreams.filter((d) => d.status === 'publicado').slice(0, 3));
        setMyProposals(proposals);
        setProposalByDream(buildProposalMapByDream(proposals));
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar seu dashboard.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

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
          { label: 'Sonhos disponíveis', value: suggestedDreams.length, icon: Star, color: 'bg-pink-100 text-pink-600', link: '/apoiador/explorar' },
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
            <DreamCard
              key={dream.id}
              dream={{
                ...dream,
                tags: [dream.category, dream.format, dream.urgency],
                proposalStatus: proposalByDream.get(dream.id)?.status,
              }}
              onClick={() => navigate(`/apoiador/sonhos/${dream.id}`)}
            />
          ))}
          {!loading && suggestedDreams.length === 0 && (
            <p className="text-sm text-gray-500 px-2 py-3">Nenhum sonho público disponível no momento.</p>
          )}
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
              <div
                key={prop.id}
                onClick={() => navigate(`/apoiador/sonhos/${prop.dreamId}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/apoiador/sonhos/${prop.dreamId}`);
                  }
                }}
                role="button"
                tabIndex={0}
                className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-lg shrink-0">
                  {prop.dreamTitle?.includes('praia') ? '🌅' : prop.dreamTitle?.includes('violão') ? '🎵' : '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{prop.dreamTitle ?? 'Sonho'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {prop.status === 'aceita' ? '✅ Aceita — chat aberto!' : prop.status === 'em-analise' ? '⏳ Em análise' : '📬 Enviada'}
                  </p>
                </div>
                {prop.status === 'aceita' && (
                  <Link
                    to="/apoiador/chat"
                    onClick={(event) => event.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2.5 py-1.5 rounded-xl"
                  >
                    <MessageCircle className="w-3 h-3" /> Chat
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
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
              Cada conexão concluída fortalece uma rede de apoio baseada em tempo, presença e responsabilidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
