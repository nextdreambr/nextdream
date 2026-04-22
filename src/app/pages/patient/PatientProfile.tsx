import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, Heart, LogOut, MapPin, Shield, Sparkles, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError, PublicDream, Proposal, dreamsApi, notificationsApi, proposalsApi } from '../../lib/api';
import {
  loadSandboxProfileState,
  persistSandboxProfileState,
  type SandboxProfileState,
} from '../../lib/sandboxProfileState';

type ProfileSection = 'visao-geral' | 'privacidade' | 'seguranca' | 'historico';

interface HistoryEntry {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  path?: string;
}

function buildDreamPath(dream: PublicDream) {
  return dream.canEdit === false ? `/paciente/sonhos/${dream.id}` : `/paciente/sonhos/editar/${dream.id}`;
}

export default function PatientProfile() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ProfileSection>('visao-geral');
  const [myDreams, setMyDreams] = useState<PublicDream[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<Proposal[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [profileState, setProfileState] = useState<SandboxProfileState | null>(null);
  const [error, setError] = useState('');
  const [privacyFeedback, setPrivacyFeedback] = useState('');
  const [securityFeedback, setSecurityFeedback] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setProfileState(loadSandboxProfileState(currentUser.id, 'paciente'));
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [dreams, proposals, preferences] = await Promise.all([
          dreamsApi.listMine(),
          proposalsApi.listReceived(),
          notificationsApi.getPreferences(),
        ]);
        if (!mounted) return;
        setMyDreams(dreams);
        setReceivedProposals(proposals);
        setEmailEnabled(preferences.emailEnabled);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar dados do perfil.');
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const completedDreams = myDreams.filter((dream) => dream.status === 'concluido').length;
  const recentDreams = myDreams
    .slice()
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3);

  const historyEntries = useMemo<HistoryEntry[]>(() => {
    const dreamEntries = myDreams.map((dream) => ({
      id: `dream-${dream.id}`,
      title: dream.title,
      description: `Sonho em ${dream.status}.`,
      createdAt: dream.updatedAt,
      path: buildDreamPath(dream),
    }));

    const proposalEntries = receivedProposals.map((proposal) => ({
      id: `proposal-${proposal.id}`,
      title: `${proposal.supporterName ?? 'Alguém'} enviou uma proposta ${proposal.status}`,
      description: 'A proposta já apareceu na sua central de respostas desta sessão.',
      createdAt: proposal.createdAt,
      path: '/paciente/propostas',
    }));

    return [...proposalEntries, ...dreamEntries].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }, [myDreams, receivedProposals]);

  function updateProfileState(updater: (current: SandboxProfileState) => SandboxProfileState) {
    setProfileState((current) => {
      if (!current) return current;
      return updater(current);
    });
  }

  function handleSavePrivacy() {
    if (!currentUser || !profileState) return;
    persistSandboxProfileState(currentUser.id, profileState);
    setPrivacyFeedback('Preferências salvas no sandbox');
  }

  function handleSaveSecurity() {
    if (!currentUser || !profileState) return;
    const nextState = {
      ...profileState,
      security: {
        ...profileState.security,
        lastSavedAt: new Date().toISOString(),
      },
    };
    persistSandboxProfileState(currentUser.id, nextState);
    setProfileState(nextState);
    setSecurityFeedback('Ajustes de segurança salvos no sandbox');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!currentUser || !profileState) {
    return <div className="max-w-3xl mx-auto py-8 text-sm text-gray-500">Carregando perfil...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Meu Perfil</h1>
          <p className="text-sm text-gray-500">Um resumo do que você já publicou, recebeu e revisou nesta sessão sandbox.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50"
        >
          <LogOut className="w-4 h-4" />
          Sair da demo
        </button>
      </div>

      <section className="bg-white rounded-3xl border border-pink-100 p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-2xl font-semibold text-pink-700">
            {currentUser.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>{currentUser.name}</h2>
              <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700">Paciente</span>
              {currentUser.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <Shield className="w-3.5 h-3.5" />
                  Conta verificada
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">{currentUser.email}</p>
            {profileState.privacy.showCity && (currentUser.locationLabel ?? currentUser.city) && (
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {currentUser.locationLabel ?? currentUser.city}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Sonhos publicados', value: myDreams.length, icon: Star, color: 'bg-pink-100 text-pink-700' },
            { label: 'Propostas recebidas', value: receivedProposals.length, icon: Heart, color: 'bg-rose-100 text-rose-700' },
            { label: 'Sonhos concluídos', value: completedDreams, icon: Sparkles, color: 'bg-amber-100 text-amber-700' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {activeSection !== 'historico' && (
          <div className="rounded-2xl border border-pink-100 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-pink-50 px-5 py-4">
            <div>
              <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Meus sonhos recentes</h3>
              <p className="text-xs text-gray-500">Abra o sonho certo e continue a jornada do ponto em que parou.</p>
            </div>
            <Link to="/paciente/sonhos/criar" className="text-sm font-medium text-pink-600 hover:text-pink-700">
              Novo sonho
            </Link>
          </div>
          <div className="divide-y divide-pink-50">
            {recentDreams.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-500">Você ainda não publicou sonhos nesta sessão.</p>
            ) : (
              recentDreams.map((dream) => (
                <Link
                  key={dream.id}
                  to={buildDreamPath(dream)}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-pink-50/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{dream.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {dream.category} • Atualizado em {new Date(dream.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700">
                    {dream.status}
                  </span>
                </Link>
              ))
            )}
          </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl border border-pink-100 p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'visao-geral' as const, label: 'Visão geral' },
            { id: 'privacidade' as const, label: 'Privacidade' },
            { id: 'seguranca' as const, label: 'Segurança' },
            { id: 'historico' as const, label: 'Histórico' },
          ].map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setActiveSection(section.id);
                setPrivacyFeedback('');
                setSecurityFeedback('');
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === 'visao-geral' && (
          <div className="rounded-2xl bg-pink-50 p-4 text-sm text-pink-900">
            Use as seções abaixo para simular ajustes de privacidade, registrar mudanças de segurança e revisar o histórico desta sessão.
          </div>
        )}

        {activeSection === 'privacidade' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base text-gray-900" style={{ fontWeight: 700 }}>Privacidade no sandbox</h2>
              <p className="text-sm text-gray-500">Essas preferências ficam salvas só nesta sessão demonstrativa.</p>
            </div>

            {[
              {
                key: 'showCity' as const,
                label: 'Mostrar cidade no perfil',
                description: 'Exibe sua localização resumida nas superfícies do sandbox.',
              },
              {
                key: 'showDreamContext' as const,
                label: 'Mostrar contexto do sonho',
                description: 'Mantém lembretes visuais do que você considera importante ao publicar.',
              },
              {
                key: 'highlightSafetyReminder' as const,
                label: 'Destacar lembretes de segurança',
                description: 'Mantém avisos de conversa responsável em evidência.',
              },
            ].map((item) => {
              const checked = profileState.privacy[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{item.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-label={item.label}
                    aria-checked={checked}
                    onClick={() => {
                      setPrivacyFeedback('');
                      updateProfileState((current) => ({
                        ...current,
                        privacy: {
                          ...current.privacy,
                          [item.key]: !checked,
                        },
                      }));
                    }}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-pink-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSavePrivacy}
                className="rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-700"
              >
                Salvar preferências
              </button>
              {privacyFeedback && <p className="text-sm text-green-700">{privacyFeedback}</p>}
            </div>
          </div>
        )}

        {activeSection === 'seguranca' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base text-gray-900" style={{ fontWeight: 700 }}>Segurança no sandbox</h2>
              <p className="text-sm text-gray-500">Registre lembretes visuais para esta sessão sem alterar uma conta real.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <Shield className="w-4 h-4 text-pink-600" />
                Conversas financeiras continuam bloqueadas no sandbox.
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <Bell className="w-4 h-4 text-pink-600" />
                Notificações por e-mail: {emailEnabled ? 'ativas' : 'desativadas'}.
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <Sparkles className="w-4 h-4 text-pink-600" />
                Seu lembrete visual de segurança está {profileState.privacy.highlightSafetyReminder ? 'ativo' : 'oculto'}.
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSecurity}
              className="rounded-xl border border-pink-200 px-4 py-2.5 text-sm font-medium text-pink-700 hover:bg-pink-50"
            >
              Registrar ajuste
            </button>
            {securityFeedback && <p className="text-sm text-green-700">{securityFeedback}</p>}
          </div>
        )}

        {activeSection === 'historico' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base text-gray-900" style={{ fontWeight: 700 }}>Histórico desta sessão</h2>
              <p className="text-sm text-gray-500">Uma linha do tempo simples com sonhos e propostas já carregados no sandbox.</p>
            </div>

            <div className="space-y-3">
              {historyEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Assim que você publicar sonhos ou receber propostas, os eventos aparecem aqui.
                </div>
              ) : (
                historyEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {entry.path ? (
                          <Link to={entry.path} className="text-sm text-gray-900 hover:text-pink-700" style={{ fontWeight: 600 }}>
                            {entry.title}
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{entry.title}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">{entry.description}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                        <Bell className="w-3.5 h-3.5" />
                        {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
