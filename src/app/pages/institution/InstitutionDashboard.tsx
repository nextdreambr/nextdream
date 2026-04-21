import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Building2, Inbox, MessageCircle, Star, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError, institutionApi, type InstitutionOverview } from '../../lib/api';

export default function InstitutionDashboard() {
  const { currentUser } = useApp();
  const [overview, setOverview] = useState<InstitutionOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser?.approved) {
      setOverview(null);
      setError('');
      return;
    }

    let mounted = true;
    async function load() {
      setError('');
      try {
        const data = await institutionApi.overview();
        if (mounted) {
          setOverview(data);
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar o painel da instituição.');
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [currentUser?.approved, currentUser?.id]);

  if (!currentUser) {
    return null;
  }

  if (!currentUser.approved) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-sky-600 rounded-2xl p-6 text-white">
          <p className="text-indigo-100 text-sm mb-1">Olá, {currentUser.name.split(' ')[0]}</p>
          <h1 className="text-white mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Conta em análise</h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Recebemos seu cadastro institucional. Nossa equipe vai revisar os dados antes de liberar a operação de pacientes, sonhos e conversas.
          </p>
        </div>

        <div className="bg-white border border-indigo-100 rounded-2xl p-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5" />
            Conta em análise
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Enquanto isso, você pode acompanhar este status por aqui. Assim que a conta for aprovada, esta área vai liberar o cadastro de pacientes acompanhados e a publicação de sonhos.
          </p>
          <Link to="/contato" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
            Falar com a equipe <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Pacientes acompanhados', value: overview?.managedPatients ?? 0, icon: Users, to: '/instituicao/pacientes' },
    { label: 'Pacientes com acesso', value: overview?.linkedPatients ?? 0, icon: Users, to: '/instituicao/pacientes' },
    { label: 'Convites pendentes', value: overview?.pendingAccessInvites ?? 0, icon: Building2, to: '/instituicao/pacientes' },
    { label: 'Apoiadores com propostas', value: overview?.supporterConnections ?? 0, icon: MessageCircle, to: '/instituicao/propostas' },
    { label: 'Sonhos ativos', value: overview?.dreams ?? 0, icon: Star, to: '/instituicao/sonhos' },
    { label: 'Sonhos publicados', value: overview?.dreamsPublished ?? 0, icon: Star, to: '/instituicao/sonhos' },
    { label: 'Propostas pendentes', value: overview?.pendingProposals ?? 0, icon: Inbox, to: '/instituicao/propostas' },
    { label: 'Conversas ativas', value: overview?.activeConversations ?? 0, icon: MessageCircle, to: '/instituicao/chat' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-sky-600 rounded-2xl p-6 text-white">
        <p className="text-indigo-100 text-sm mb-1">Olá, {currentUser.name.split(' ')[0]}</p>
        <h1 className="text-white mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Operação institucional</h1>
        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
          Cadastre pacientes acompanhados, publique sonhos em nome deles e filtre as conexões com apoiadores de forma segura.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/instituicao/pacientes" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
            <Users className="w-4 h-4" />
            Adicionar paciente
          </Link>
          <Link to="/instituicao/sonhos/criar" className="inline-flex items-center gap-2 border border-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
            <Star className="w-4 h-4" />
            Publicar sonho
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="bg-white border border-indigo-100 rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl text-gray-800" style={{ fontWeight: 700 }}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>Próximos passos</h2>
            <p className="text-xs text-gray-500 mt-1">Use a mesma cadência operacional da área do paciente, agora com a instituição como operadora dos casos.</p>
          </div>
          <div className="space-y-3">
            {[
              {
                title: 'Cadastrar ou revisar pacientes',
                description: 'Garanta prontuário, localização e status de acesso antes de publicar novos sonhos.',
                to: '/instituicao/pacientes',
              },
              {
                title: 'Publicar sonhos com contexto claro',
                description: 'Conecte cada sonho ao beneficiário certo e mantenha visível quem opera o caso.',
                to: '/instituicao/sonhos/criar',
              },
              {
                title: 'Acompanhar propostas e conversas',
                description: 'Centralize resposta institucional com contexto de paciente, sonho e apoiador.',
                to: '/instituicao/propostas',
              },
            ].map((item) => (
              <Link key={item.title} to={item.to} className="block rounded-2xl border border-indigo-50 bg-indigo-50/60 p-4 hover:border-indigo-100 hover:bg-indigo-50 transition-colors">
                <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>Visão da operação</h2>
            <p className="text-xs text-gray-500 mt-1">A instituição atua como ponte entre o beneficiário e o apoiador, sem perder contexto do caso.</p>
          </div>
          <div className="space-y-3">
            {[
              `Pacientes com acesso ativo: ${overview?.linkedPatients ?? 0}`,
              `Convites pendentes para pacientes: ${overview?.pendingAccessInvites ?? 0}`,
              `Propostas aceitas até agora: ${overview?.acceptedProposals ?? 0}`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0"></div>
                <p className="text-sm text-gray-600">{item}</p>
              </div>
            ))}
          </div>
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
