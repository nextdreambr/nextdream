import { useEffect, useRef, useState } from 'react';
import { MapPin, Shield, Bell, Lock, ChevronRight, Edit2, Star, MessageCircle, Heart, AlertTriangle, CheckCircle, X, Save, Clock, Loader2, Camera, Trash2, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';
import { ApiError, PublicDream, Proposal, dreamsApi, proposalsApi } from '../../lib/api';

export default function PatientProfile() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState(currentUser?.name || '');
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState('Moradora de Santos, apaixonada por natureza e música. Durante o tratamento, descobri o quanto a presença de outras pessoas pode ser transformadora.');
  const [editBio, setEditBio] = useState(bio);
  const [notifications, setNotifications] = useState({
    novasPropostas: true,
    chat: true,
    lembretes: true,
    email: false,
  });
  const [myDreams, setMyDreams] = useState<PublicDream[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
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
        setMyProposals(proposals);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar dados do perfil.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const completedDreams = myDreams.filter(d => d.status === 'concluido').length;

  const handleStartEditing = () => {
    setEditName(name || currentUser?.name || '');
    setEditBio(bio);
    setTempAvatarUrl(avatarUrl);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditName(name || currentUser?.name || '');
    setEditBio(bio);
    setTempAvatarUrl(null);
    setEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setName(editName);
      setBio(editBio);
      if (tempAvatarUrl !== null) setAvatarUrl(tempAvatarUrl);
      setSaving(false);
      setEditing(false);
    }, 1000);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempAvatarUrl(url);
      setShowPhotoModal(false);
    }
  };

  const handleRemovePhoto = () => {
    setTempAvatarUrl(null);
    setAvatarUrl(null);
    setShowPhotoModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayAvatar = editing ? (tempAvatarUrl ?? avatarUrl) : avatarUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Meu Perfil</h1>
        <button
          onClick={() => editing ? handleCancel() : handleStartEditing()}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-colors
            ${editing ? 'bg-pink-600 text-white border-pink-600' : 'text-pink-600 border-pink-200 hover:bg-pink-50'}`}
        >
          {editing ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Edit2 className="w-3.5 h-3.5" /> Editar perfil</>}
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700 text-2xl font-semibold">
                {currentUser?.name?.[0] || 'A'}
              </div>
            )}
            {editing && (
              <button
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="text-gray-800 font-medium text-base w-full border-b border-pink-300 focus:outline-none focus:border-pink-500 pb-0.5 mb-1 bg-transparent"
              />
            ) : (
              <h2 className="text-gray-800 mb-1">{name || currentUser?.name}</h2>
            )}
            <p className="text-gray-500 text-sm">{currentUser?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">Paciente</span>
              {currentUser?.verified && (
                <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />Verificado
                </span>
              )}
              {currentUser?.city && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{currentUser.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5 pt-4 border-t border-pink-50">
          <p className="text-xs text-gray-400 mb-2 font-medium">Sobre mim</p>
          {editing ? (
            <div>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-pink-50 border border-pink-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sonhos publicados', value: myDreams.length, icon: Star, color: 'bg-pink-100 text-pink-600' },
          { label: 'Propostas recebidas', value: myProposals.length, icon: Heart, color: 'bg-pink-100 text-pink-600' },
          { label: 'Sonhos realizados', value: completedDreams, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2`}>
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-gray-800 text-xl" style={{ fontWeight: 700 }}>{item.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent dreams */}
      {myDreams.length > 0 && (
        <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-pink-50">
            <h3 className="text-gray-700 text-sm">Meus sonhos recentes</h3>
          </div>
          <div className="divide-y divide-pink-50">
            {myDreams.slice(0, 3).map(dream => (
              <div key={dream.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-base shrink-0">
                  {dream.category === 'Experiência ao ar livre' ? '🌅' : dream.category === 'Arte e Música' ? '🎵' : dream.category === 'Culinária' ? '🍳' : '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{dream.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      dream.status === 'concluido' ? 'bg-green-100 text-green-700' :
                      dream.status === 'publicado' ? 'bg-blue-100 text-blue-700' :
                      dream.status === 'em-conversa' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{dream.status}</span>
                    <span className="text-xs text-gray-400">Atualizado em {new Date(dream.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                {dream.status === 'em-conversa' && (
                  <MessageCircle className="w-4 h-4 text-teal-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification status */}
      {!currentUser?.verified && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Verificação de conta pendente</p>
            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
              Contas verificadas recebem mais propostas e geram mais confiança nos apoiadores. Envie um documento para verificação.
            </p>
            <button className="mt-2 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl transition-colors font-medium">
              Solicitar verificação
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-pink-50">
          <h3 className="text-gray-700 text-sm">Configurações</h3>
        </div>

        {/* Notifications toggle */}
        <button
          onClick={() => setShowNotifSettings(!showNotifSettings)}
          className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-pink-50/30 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-pink-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Notificações</p>
            <p className="text-xs text-gray-500">E-mail e alertas in-app</p>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showNotifSettings ? 'rotate-90' : ''}`} />
        </button>

        {showNotifSettings && (
          <div className="px-5 pb-4 bg-pink-50/30 border-b border-gray-50">
            <div className="space-y-3 pt-3">
              {[
                { key: 'novasPropostas' as const, label: 'Novas propostas', desc: 'Quando um apoiador enviar uma proposta' },
                { key: 'chat' as const, label: 'Mensagens no chat', desc: 'Novas mensagens nas conversas ativas' },
                { key: 'lembretes' as const, label: 'Lembretes de sonhos', desc: 'Lembrar de responder propostas' },
                { key: 'email' as const, label: 'Resumo por e-mail', desc: 'Resumo semanal da sua conta' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${notifications[item.key] ? 'bg-pink-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {[
          { icon: Lock, label: 'Privacidade', desc: 'Visibilidade do perfil e sonhos' },
          { icon: Shield, label: 'Segurança', desc: 'Senha e autenticação' },
          { icon: Clock, label: 'Histórico', desc: 'Ver todas as atividades da conta' },
        ].map((item, i, arr) => (
          <button key={i} className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-pink-50/30 transition-colors text-left ${i < arr.length - 1 ? 'border-b border-gray-50' : 'border-b border-gray-50'}`}>
            <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
              <item.icon className="w-4 h-4 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50/50 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-600">Sair da conta</p>
            <p className="text-xs text-gray-500">Encerrar sessão atual</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Safety reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Sua segurança é prioridade:</strong> O NextDream nunca exige dinheiro. Se alguém pedir PIX, transferência ou qualquer valor, denuncie imediatamente pelo chat. Sua privacidade está protegida.
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="text-xs text-center text-gray-400 pb-2">NextDream v1.0 • Protótipo</p>

      {/* Floating save bar */}
      {editing && (
        <div className="fixed bottom-14 left-0 right-0 z-40 md:left-64">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white border border-pink-200 rounded-2xl shadow-lg p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600 hidden sm:block">
                Você tem alterações não salvas
              </p>
              <p className="text-sm text-gray-600 sm:hidden">
                Alterações pendentes
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors disabled:opacity-80"
                  style={{ fontWeight: 600 }}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Salvar alterações</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPhotoModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Foto do perfil</h3>
              <button onClick={() => setShowPhotoModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 flex flex-col items-center gap-4">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700 text-4xl font-semibold">
                  {currentUser?.name?.[0] || 'A'}
                </div>
              )}
              <div className="w-full space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  {displayAvatar ? 'Trocar foto' : 'Enviar foto'}
                </button>
                {displayAvatar && (
                  <button
                    onClick={handleRemovePhoto}
                    className="flex items-center justify-center gap-2 w-full border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover foto
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center">JPG, PNG ou GIF. Tamanho máximo: 5MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
