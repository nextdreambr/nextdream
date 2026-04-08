import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, Inbox, MessageCircle, Plus, ChevronRight, CheckCircle, Clock, Users } from 'lucide-react';
import { DreamStatusBadge } from '../../components/shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import { ApiError, PublicDream, Proposal, dreamsApi, proposalsApi } from '../../lib/api';

export default function PatientDashboard() {
  const { currentUser } = useApp();
  const [myDreams, setMyDreams] = useState<PublicDream[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [dreams, proposals] = await Promise.all([
          dreamsApi.listMine(),
          proposalsApi.listReceived(),
        ]);
        if (!mounted) return;
        setMyDreams(dreams);
        setReceivedProposals(proposals);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar o dashboard.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleDreams = myDreams.slice(0, 3);
  const newProposals = receivedProposals.filter((p) => p.status === 'em-analise' || p.status === 'enviada').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 rounded-2xl p-6 text-white">
        <p className="text-pink-100 text-sm mb-1">Olá, {currentUser?.name?.split(' ')[0]} 💖</p>
        <h1 className="text-white mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Seu espaço de sonhos</h1>
        <p className="text-pink-100 text-sm leading-relaxed mb-4">
          Compartilhe o que você deseja e conecte-se com pessoas que têm tempo, presença e carinho para oferecer.
        </p>
        <Link
          to="/paciente/sonhos/criar"
          className="inline-flex items-center gap-2 bg-white text-pink-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-pink-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Compartilhar um sonho
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Meus sonhos',
            value: visibleDreams.length,
            icon: Star,
            color: 'bg-pink-100 text-pink-600',
            link: '/paciente/sonhos',
          },
          {
            label: 'Novas propostas',
            value: newProposals,
            icon: Inbox,
            color: 'bg-amber-100 text-amber-600',
            link: '/paciente/propostas',
            highlight: newProposals > 0,
          },
          {
            label: 'Conversas',
            value: 1,
            icon: MessageCircle,
            color: 'bg-teal-100 text-teal-600',
            link: '/paciente/chat',
          },
        ].map((stat, i) => (
          <Link key={i} to={stat.link}
            className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-all flex flex-col items-center text-center gap-2
              ${stat.highlight ? 'border-amber-200 shadow-amber-100 shadow-md' : 'border-pink-100'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{stat.value}</p>
            <p className="text-gray-500 text-xs">{stat.label}</p>
            {stat.highlight && <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-3 right-3" />}
          </Link>
        ))}
      </div>

      {/* My dreams */}
      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100">
          <h2 className="text-gray-800 text-sm">Meus sonhos</h2>
          <Link to="/paciente/sonhos" className="text-pink-600 text-xs hover:text-pink-700 flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myDreams.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-pink-500" />
            </div>
            <p className="text-gray-800 text-sm mb-1">Você ainda não publicou um sonho</p>
            <p className="text-gray-500 text-xs mb-4">Compartilhe um desejo e encontre alguém especial para realizá-lo.</p>
            <Link to="/paciente/sonhos/criar" className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-sm">
              <Plus className="w-4 h-4" /> Criar meu primeiro sonho
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-pink-50">
            {visibleDreams.map(dream => (
              <Link key={dream.id} to={`/paciente/sonhos/${dream.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-pink-50/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-xl shrink-0">
                  {dream.category === 'Experiência ao ar livre' ? '🌅' : dream.category === 'Arte e Música' ? '🎵' : dream.category === 'Culinária' ? '🍳' : '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 group-hover:text-pink-700 transition-colors truncate">{dream.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <DreamStatusBadge status={dream.status} />
                    <span className="text-xs text-amber-600 font-medium">Sonho ativo</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New proposals alert */}
      {newProposals > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-amber-800 font-medium text-sm">Você tem {newProposals} nova{newProposals > 1 ? 's' : ''} proposta{newProposals > 1 ? 's' : ''}!</p>
              <p className="text-amber-600 text-xs mt-0.5 mb-3">Apoiadores querem ajudar a realizar seus sonhos.</p>
              <Link to="/paciente/propostas" className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-amber-700 transition-colors">
                Ver propostas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* How it works reminder */}
      <div className="bg-white rounded-2xl border border-pink-100 p-5">
        <h3 className="text-gray-700 text-sm mb-4">Seu progresso para a realização</h3>
        <div className="space-y-3">
            {[
              { done: true, icon: CheckCircle, label: 'Conta criada', sub: 'Você está na plataforma ✓' },
            { done: visibleDreams.length > 0, icon: Star, label: 'Publicar um sonho', sub: visibleDreams.length > 0 ? `${visibleDreams.length} sonho${visibleDreams.length > 1 ? 's' : ''} publicado${visibleDreams.length > 1 ? 's' : ''}` : 'Conte o que você deseja', link: '/paciente/sonhos/criar' },
            { done: newProposals > 0, icon: Users, label: 'Receber uma proposta', sub: newProposals > 0 ? 'Apoiadores encontraram você!' : 'Aguardando propostas...' },
            { done: false, icon: MessageCircle, label: 'Aceitar e conversar', sub: 'Chat seguro se abrirá' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 ${item.done ? '' : 'opacity-50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                {item.done ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              {!item.done && item.link && (
                <Link to={item.link} className="text-xs text-pink-600 hover:text-pink-700">Fazer agora →</Link>
              )}
            </div>
          ))}
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
