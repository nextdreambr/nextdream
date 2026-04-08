import { useEffect, useRef, useState } from 'react';
import { MapPin, Shield, Bell, Lock, ChevronRight, Edit2, Heart, Send, CheckCircle, Star, Award, Clock, Globe, AlertTriangle, X, Save, Loader2, Camera, Trash2, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';
import { ApiError, Proposal, proposalsApi } from '../../lib/api';

const helpTypes = [
  { id: 'companhia', emoji: '🤝', label: 'Companhia' },
  { id: 'presença', emoji: '🏠', label: 'Visita presencial' },
  { id: 'aprendizado', emoji: '📚', label: 'Ensinar algo' },
  { id: 'experiencia', emoji: '🌟', label: 'Proporcionar experiência' },
  { id: 'video', emoji: '📹', label: 'Videochamada' },
  { id: 'motorista', emoji: '🚗', label: 'Transporte' },
  { id: 'culinaria', emoji: '🍳', label: 'Culinária' },
  { id: 'arte', emoji: '🎨', label: 'Arte e música' },
];

export default function SupporterProfile() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [activeHelp, setActiveHelp] = useState(['companhia', 'video', 'aprendizado']);
  const [editActiveHelp, setEditActiveHelp] = useState(['companhia', 'video', 'aprendizado']);
  const [name, setName] = useState(currentUser?.name || '');
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState('Adoro ajudar pessoas e tenho experiência em acessibilidade. Moro em Santos e posso me deslocar pela Baixada Santista. Falo inglês e espanhol também.');
  const [editBio, setEditBio] = useState(bio);
  const [notifications, setNotifications] = useState({
    novasProp: true,
    atualizacoes: true,
    chat: true,
    email: false,
  });
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await proposalsApi.listMine();
        if (mounted) setMyProposals(data);
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

  const accepted = myProposals.filter(p => p.status === 'aceita').length;
  const sent = myProposals.length;

  const handleStartEditing = () => {
    setEditName(name || currentUser?.name || '');
    setEditBio(bio);
    setEditActiveHelp([...activeHelp]);
    setTempAvatarUrl(avatarUrl);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditName(name || currentUser?.name || '');
    setEditBio(bio);
    setEditActiveHelp([...activeHelp]);
    setTempAvatarUrl(null);
    setEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setName(editName);
      setBio(editBio);
      setActiveHelp([...editActiveHelp]);
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

  const statsItems = [
    { label: 'Propostas enviadas', value: sent, icon: Send, color: 'bg-teal-100 text-teal-600' },
    { label: 'Conexões realizadas', value: accepted, icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { label: 'Sonhos ajudados', value: accepted, icon: Star, color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Meu Perfil</h1>
        <button
          onClick={() => editing ? handleCancel() : handleStartEditing()}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-colors
            ${editing ? 'bg-teal-600 text-white border-teal-600' : 'text-teal-600 border-teal-200 hover:bg-teal-50'}`}
        >
          {editing ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Edit2 className="w-3.5 h-3.5" /> Editar perfil</>}
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-teal-100 p-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-semibold">
                {currentUser?.name?.[0] || 'F'}
              </div>
            )}
            {editing && (
              <button
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center shadow-md transition-colors"
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
                className="text-gray-800 font-medium text-base w-full border-b border-teal-300 focus:outline-none focus:border-teal-500 pb-0.5 mb-1 bg-transparent"
              />
            ) : (
              <h2 className="text-gray-800 mb-1">{name || currentUser?.name}</h2>
            )}
            <p className="text-gray-500 text-sm">{currentUser?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Apoiador</span>
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
        <div className="mt-5 pt-4 border-t border-teal-50">
          <p className="text-xs text-gray-400 mb-2 font-medium">Sobre mim</p>
          {editing ? (
            <div>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-teal-50 border border-teal-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statsItems.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2`}>
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-gray-800 text-xl" style={{ fontWeight: 700 }}>{item.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Impact badge */}
      {accepted > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Award className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-800">Apoiador Ativo 💚</p>
            <p className="text-xs text-teal-600 mt-0.5">
              Você já ajudou a realizar {accepted} {accepted === 1 ? 'sonho' : 'sonhos'}. Que impacto incrível!
            </p>
          </div>
        </div>
      )}

      {/* Help types */}
      <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-teal-50 flex items-center justify-between">
          <h3 className="text-gray-700 text-sm">Como posso ajudar</h3>
          {editing && <span className="text-xs text-teal-500">Toque para ativar/desativar</span>}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {helpTypes.map(h => {
              const isActive = editing ? editActiveHelp.includes(h.id) : activeHelp.includes(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => editing && setEditActiveHelp(prev => prev.includes(h.id) ? prev.filter(x => x !== h.id) : [...prev, h.id])}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                    ${isActive ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-gray-100 text-gray-400 bg-gray-50'}
                    ${editing ? 'cursor-pointer hover:border-teal-300' : 'cursor-default'}`}
                >
                  <span className="text-base">{h.emoji}</span>
                  <span className="leading-tight">{h.label}</span>
                  {isActive && <CheckCircle className="w-3 h-3 text-teal-500 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-teal-50">
          <h3 className="text-gray-700 text-sm">Disponibilidade</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-teal-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Horas por semana</p>
              {editing ? (
                <select
                  defaultValue="3-5h"
                  className="text-sm text-gray-700 bg-teal-50 border border-teal-100 rounded-lg px-2 py-1 mt-0.5 focus:outline-none w-full"
                >
                  <option value="1-2h">1-2h</option>
                  <option value="3-5h">3-5h</option>
                  <option value="6-10h">6-10h</option>
                  <option value="10h+">10h+</option>
                </select>
              ) : (
                <p className="text-sm text-gray-700">3-5 horas</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-teal-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Dias preferenciais</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['Sáb', 'Dom', 'Sex'].map(d => (
                  <span key={d} className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs">{d}</span>
                ))}
                {editing && (
                  <button className="border border-dashed border-teal-300 text-teal-500 px-2 py-0.5 rounded-full text-xs hover:bg-teal-50">+ Adicionar</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-teal-50">
          <h3 className="text-gray-700 text-sm">Configurações</h3>
        </div>

        <button
          onClick={() => setShowNotifSettings(!showNotifSettings)}
          className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-teal-50/30 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Notificações</p>
            <p className="text-xs text-gray-500">E-mail e alertas in-app</p>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showNotifSettings ? 'rotate-90' : ''}`} />
        </button>

        {showNotifSettings && (
          <div className="px-5 pb-4 bg-teal-50/30 border-b border-gray-50">
            <div className="space-y-3 pt-3">
              {[
                { key: 'novasProp' as const, label: 'Novas propostas aceitas', desc: 'Quando um paciente aceitar sua proposta' },
                { key: 'atualizacoes' as const, label: 'Atualizações de sonhos', desc: 'Quando sonhos que você viu forem atualizados' },
                { key: 'chat' as const, label: 'Novas mensagens no chat', desc: 'Mensagens recebidas nas conversas' },
                { key: 'email' as const, label: 'Resumo por e-mail', desc: 'Resumo semanal de atividades' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${notifications[item.key] ? 'bg-teal-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {[
          { icon: Lock, label: 'Privacidade', desc: 'Visibilidade do perfil e dados' },
          { icon: Shield, label: 'Segurança', desc: 'Senha e autenticação em 2 fatores' },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-teal-50/30 transition-colors text-left last:border-0">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
              <item.icon className="w-4 h-4 text-teal-600" />
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

      {/* Conduct reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Lembrete de conduta:</strong> O NextDream não permite pedidos de dinheiro, PIX ou qualquer compensação financeira. Seu papel é oferecer tempo, presença e carinho. Violações resultam em suspensão imediata.
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* App version */}
      <p className="text-xs text-center text-gray-400 pb-2">NextDream v1.0 • Protótipo</p>

      {/* Floating save bar */}
      {editing && (
        <div className="fixed bottom-14 left-0 right-0 z-40 md:left-64">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white border border-teal-200 rounded-2xl shadow-lg p-4 flex items-center justify-between gap-3">
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
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors disabled:opacity-80"
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
                <div className="w-24 h-24 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 text-4xl font-semibold">
                  {currentUser?.name?.[0] || 'F'}
                </div>
              )}
              <div className="w-full space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
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
