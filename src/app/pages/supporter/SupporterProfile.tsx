import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, Heart, LogOut, MapPin, Shield, Sparkles, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ApiError,
  AppNotification,
  Conversation,
  Proposal,
  conversationsApi,
  notificationsApi,
  proposalsApi,
} from '../../lib/api';
import {
  loadSandboxProfileState,
  persistSandboxProfileState,
  SANDBOX_HISTORY_FILTERS,
  type SandboxHistoryFilter,
  type SandboxProfileState,
} from '../../lib/sandboxProfileState';

type ProfileSection = 'visao-geral' | 'privacidade' | 'seguranca' | 'historico';

interface HistoryEntry {
  id: string;
  kind: SandboxHistoryFilter;
  title: string;
  description: string;
  createdAt: string;
  path?: string;
}

const historyFilterLabels: Record<SandboxHistoryFilter, string> = {
  todos: 'Todos',
  sonhos: 'Sonhos',
  propostas: 'Propostas',
  conversas: 'Conversas',
  notificacoes: 'Notificações',
  visitas: 'Visitas',
};

export default function SupporterProfile() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ProfileSection>('visao-geral');
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [profileState, setProfileState] = useState<SandboxProfileState | null>(null);
  const [error, setError] = useState('');
  const [privacyFeedback, setPrivacyFeedback] = useState('');
  const [securityFeedback, setSecurityFeedback] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setProfileState(loadSandboxProfileState(currentUser.id, 'apoiador'));
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [proposals, conversationList, notificationList, preferences] = await Promise.all([
          proposalsApi.listMine(),
          conversationsApi.listMine(),
          notificationsApi.listMine(),
          notificationsApi.getPreferences(),
        ]);
        if (!mounted) return;
        setMyProposals(proposals);
        setConversations(conversationList);
        setNotifications(notificationList);
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

  const acceptedProposals = myProposals.filter((proposal) => proposal.status === 'aceita').length;
  const historyEntries = useMemo<HistoryEntry[]>(() => {
    const proposalEntries = myProposals.map((proposal) => ({
      id: `proposal-${proposal.id}`,
      kind: 'propostas' as const,
      title: `Sua proposta para "${proposal.dreamTitle ?? 'um sonho'}" foi ${proposal.status}`,
      description: proposal.patientName
        ? `Paciente: ${proposal.patientName}.`
        : 'Acompanhe a resposta e retome o contato quando fizer sentido.',
      createdAt: proposal.createdAt,
      path: '/apoiador/propostas',
    }));

    const conversationEntries = conversations.map((conversation) => ({
      id: `conversation-${conversation.id}`,
      kind: 'conversas' as const,
      title: `Conversa ativa sobre "${conversation.dreamTitle ?? 'um sonho'}"`,
      description: 'O chat segue disponível para você continuar a combinação desta sessão.',
      createdAt: conversation.createdAt,
      path: `/apoiador/chat?conversationId=${conversation.id}`,
    }));

    const notificationEntries = notifications.map((notification) => ({
      id: `notification-${notification.id}`,
      kind: 'notificacoes' as const,
      title: notification.title,
      description: notification.message,
      createdAt: notification.createdAt,
      path: notification.actionPath,
    }));

    const visitedEntries = (profileState?.visitedDreams ?? []).map((dream) => ({
      id: `visit-${dream.dreamId}`,
      kind: 'visitas' as const,
      title: dream.title,
      description: 'Sonho visitado e salvo nesta sessão.',
      createdAt: dream.visitedAt,
      path: dream.path,
    }));

    return [...notificationEntries, ...conversationEntries, ...proposalEntries, ...visitedEntries].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }, [conversations, myProposals, notifications, profileState?.visitedDreams]);

  function updateProfileState(updater: (current: SandboxProfileState) => SandboxProfileState) {
    setProfileState((current) => {
      if (!current) return current;
      return updater(current);
    });
  }

  function persistProfileSnapshot(nextState: SandboxProfileState) {
    if (!currentUser) return;
    persistSandboxProfileState(currentUser.id, nextState);
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
    persistProfileSnapshot(nextState);
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

  const filteredHistoryEntries = historyEntries.filter((entry) => {
    if (profileState.historyFilter === 'todos') return true;
    return entry.kind === profileState.historyFilter;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Meu Perfil</h1>
          <p className="text-sm text-gray-500">Seu resumo de propostas, conexões aceitas e sonhos visitados no sandbox.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
        >
          <LogOut className="w-4 h-4" />
          Sair da demo
        </button>
      </div>

      <section className="bg-white rounded-3xl border border-teal-100 p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-2xl font-semibold text-teal-700">
            {currentUser.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>{currentUser.name}</h2>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">Apoiador</span>
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
            { label: 'Propostas enviadas', value: myProposals.length, icon: Star, color: 'bg-teal-100 text-teal-700' },
            { label: 'Conexões aceitas', value: acceptedProposals, icon: Heart, color: 'bg-pink-100 text-pink-700' },
            { label: 'Notificações por e-mail', value: emailEnabled ? 'On' : 'Off', icon: Bell, color: 'bg-amber-100 text-amber-700' },
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

        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
          <p className="text-sm text-teal-900" style={{ fontWeight: 600 }}>Impacto já em andamento</p>
          <p className="mt-1 text-sm text-teal-700">
            Você tem {acceptedProposals} proposta{acceptedProposals === 1 ? '' : 's'} aceita{acceptedProposals === 1 ? '' : 's'} nesta sessão de demonstração.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-teal-100 p-5 space-y-4">
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
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === 'visao-geral' && (
          <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-900">
            Use as seções abaixo para simular preferências do apoiador, registrar um ajuste de segurança e rever sua atividade nesta sessão.
          </div>
        )}

        {activeSection === 'privacidade' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base text-gray-900" style={{ fontWeight: 700 }}>Privacidade no sandbox</h2>
              <p className="text-sm text-gray-500">Esses ajustes ficam salvos apenas para esta conta demo.</p>
            </div>

            {[
              {
                key: 'showCity' as const,
                label: 'Mostrar cidade no perfil',
                description: 'Exibe sua localização resumida nas áreas autenticadas.',
              },
              {
                key: 'showDreamContext' as const,
                label: 'Mostrar contexto do sonho visitado',
                description: 'Mantém mais detalhes visíveis quando você revisita sonhos.',
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
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-teal-600' : 'bg-gray-300'}`}
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
                className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
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
              <p className="text-sm text-gray-500">Registre um rascunho de senha e marque o ajuste como salvo só para esta sessão.</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="supporter-demo-password" className="text-sm text-gray-700">
                Nova senha de demonstração
              </label>
              <input
                id="supporter-demo-password"
                type="password"
                value={profileState.security.demoPasswordDraft}
                onChange={(event) => {
                  setSecurityFeedback('');
                  updateProfileState((current) => ({
                    ...current,
                    security: {
                      ...current.security,
                      demoPasswordDraft: event.target.value,
                    },
                  }));
                }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
                placeholder="Digite um rascunho seguro para a demo"
              />
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
              Mensagens com PIX, dinheiro e doações seguem bloqueadas. Notificações por e-mail: {emailEnabled ? 'ativas' : 'desativadas'}.
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4">
              <div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Checklist de conversa segura revisado</p>
                <p className="mt-1 text-xs text-gray-500">Marca nesta sessão que você revisou os lembretes de combinação segura.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-label="Checklist de conversa segura revisado"
                aria-checked={profileState.security.safetyChecklist}
                onClick={() => {
                  setSecurityFeedback('');
                  updateProfileState((current) => ({
                    ...current,
                    security: {
                      ...current.security,
                      safetyChecklist: !current.security.safetyChecklist,
                    },
                  }));
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  profileState.security.safetyChecklist ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    profileState.security.safetyChecklist ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveSecurity}
              className="rounded-xl border border-teal-200 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
            >
              Salvar segurança
            </button>
            {securityFeedback && <p className="text-sm text-green-700">{securityFeedback}</p>}
          </div>
        )}

        {activeSection === 'historico' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base text-gray-900" style={{ fontWeight: 700 }}>Histórico desta sessão</h2>
              <p className="text-sm text-gray-500">Veja propostas enviadas, conversas, notificações e sonhos visitados ao longo da navegação no sandbox.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SANDBOX_HISTORY_FILTERS.map((filter) => {
                const checked = profileState.historyFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      const nextState = {
                        ...profileState,
                        historyFilter: filter,
                      };
                      setProfileState(nextState);
                      persistProfileSnapshot(nextState);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      checked ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    }`}
                  >
                    {historyFilterLabels[filter]}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {filteredHistoryEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Nenhum evento desta categoria apareceu nesta sessão ainda.
                </div>
              ) : (
                filteredHistoryEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {entry.path ? (
                          <Link to={entry.path} className="text-sm text-gray-900 hover:text-teal-700" style={{ fontWeight: 600 }}>
                            {entry.title}
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{entry.title}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">{entry.description}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                        <Sparkles className="w-3.5 h-3.5" />
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
