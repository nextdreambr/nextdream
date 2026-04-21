import { FormEvent, useEffect, useState } from 'react';
import {
  Building2,
  Inbox,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
  ShieldOff,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiError, institutionApi, notificationsApi, type InstitutionOverview } from '../../lib/api';
import { BRAZIL_STATES } from '../../data/brazilCities';
import { formatLocationLabel, getCitiesForState } from '../../lib/location';

const institutionTypes = ['ONG', 'Hospital', 'Clínica', 'Casa de apoio', 'Outro'];

export default function InstitutionProfile() {
  const { currentUser, updateCurrentUser } = useApp();
  const [overview, setOverview] = useState<InstitutionOverview | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    state: '',
    city: '',
    institutionType: '',
    institutionResponsibleName: '',
    institutionResponsiblePhone: '',
    institutionDescription: '',
  });
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const cities = getCitiesForState(form.state);

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [profile, summary, preferences] = await Promise.all([
          institutionApi.getProfile(),
          institutionApi.overview(),
          notificationsApi.getPreferences(),
        ]);

        if (!mounted) return;
        setOverview(summary);
        setForm({
          name: profile.name,
          email: profile.email,
          state: profile.state ?? '',
          city: profile.city ?? '',
          institutionType: profile.institutionType ?? '',
          institutionResponsibleName: profile.institutionResponsibleName ?? '',
          institutionResponsiblePhone: profile.institutionResponsiblePhone ?? '',
          institutionDescription: profile.institutionDescription ?? '',
        });
        setEmailEnabled(preferences.emailEnabled);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError) setError(err.message);
        else setError('Não foi possível carregar o perfil institucional.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    try {
      const profile = await institutionApi.updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        state: form.state || undefined,
        city: form.city || undefined,
        institutionType: form.institutionType || undefined,
        institutionResponsibleName: form.institutionResponsibleName.trim() || undefined,
        institutionResponsiblePhone: form.institutionResponsiblePhone.trim() || undefined,
        institutionDescription: form.institutionDescription.trim() || undefined,
      });
      updateCurrentUser(profile);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível atualizar os dados institucionais.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function toggleEmailNotifications() {
    const nextValue = !emailEnabled;
    setSavingNotifications(true);
    setError('');
    try {
      await notificationsApi.updatePreferences({ emailEnabled: nextValue });
      setEmailEnabled(nextValue);
      updateCurrentUser({ emailNotificationsEnabled: nextValue });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível atualizar as preferências de notificação.');
    } finally {
      setSavingNotifications(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingPassword(true);
    setError('');
    setPasswordMessage('');
    try {
      await institutionApi.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Senha atualizada com sucesso.');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível atualizar a senha.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Perfil da instituição</h1>
        <p className="text-sm text-gray-500">Dados operacionais, preferências de conta e segurança da instituição.</p>
      </div>

      <div className="bg-white border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-semibold shrink-0">
            {currentUser.name?.[0] || 'I'}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h2 className="text-gray-800">{currentUser.name}</h2>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
            {(currentUser.institutionResponsibleName || currentUser.institutionResponsiblePhone) && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {currentUser.institutionResponsibleName && (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {currentUser.institutionResponsibleName}
                  </span>
                )}
                {currentUser.institutionResponsiblePhone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {currentUser.institutionResponsiblePhone}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {currentUser.institutionType || 'Instituição'}
              </span>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${currentUser.approved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                {currentUser.approved ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                {currentUser.approved ? 'Conta aprovada' : 'Conta pendente'}
              </span>
              {formatLocationLabel(currentUser) && (
                <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {formatLocationLabel(currentUser)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pacientes', value: overview?.managedPatients ?? 0, icon: Users },
          { label: 'Sonhos', value: overview?.dreams ?? 0, icon: Star },
          { label: 'Propostas', value: overview?.proposals ?? 0, icon: Inbox },
          { label: 'Conversas', value: overview?.activeConversations ?? 0, icon: MessageCircle },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-indigo-100 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl text-gray-800" style={{ fontWeight: 700 }}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
        <form onSubmit={handleProfileSubmit} className="bg-white border border-indigo-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Dados institucionais</h2>
              <p className="text-xs text-gray-500">Atualize identidade pública, localização e contexto operacional.</p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Carregando dados do perfil...</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="institution-profile-name" className="text-sm text-gray-700 block mb-1.5">Nome da instituição</label>
                  <input
                    id="institution-profile-name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label htmlFor="institution-profile-email" className="text-sm text-gray-700 block mb-1.5">E-mail institucional</label>
                  <input
                    id="institution-profile-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="institution-profile-responsible-name" className="text-sm text-gray-700 block mb-1.5">Nome do responsável</label>
                  <input
                    id="institution-profile-responsible-name"
                    value={form.institutionResponsibleName}
                    onChange={(event) => setForm((current) => ({ ...current, institutionResponsibleName: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label htmlFor="institution-profile-responsible-phone" className="text-sm text-gray-700 block mb-1.5">Telefone ou WhatsApp do responsável</label>
                  <input
                    id="institution-profile-responsible-phone"
                    value={form.institutionResponsiblePhone}
                    onChange={(event) => setForm((current) => ({ ...current, institutionResponsiblePhone: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="institution-profile-type" className="text-sm text-gray-700 block mb-1.5">Tipo institucional</label>
                  <select
                    id="institution-profile-type"
                    value={form.institutionType}
                    onChange={(event) => setForm((current) => ({ ...current, institutionType: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Selecione</option>
                    {institutionTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="institution-profile-state" className="text-sm text-gray-700 block mb-1.5">Estado</label>
                  <select
                    id="institution-profile-state"
                    value={form.state}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      state: event.target.value,
                      city: '',
                    }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Selecione</option>
                    {BRAZIL_STATES.map((item) => (
                      <option key={item.uf} value={item.uf}>
                        {item.name} ({item.uf})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="institution-profile-city" className="text-sm text-gray-700 block mb-1.5">Cidade</label>
                  <select
                    id="institution-profile-city"
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    disabled={!form.state}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                  >
                    <option value="">{form.state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                    {cities.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="institution-profile-description" className="text-sm text-gray-700 block mb-1.5">Descrição institucional</label>
                <textarea
                  id="institution-profile-description"
                  rows={5}
                  value={form.institutionDescription}
                  onChange={(event) => setForm((current) => ({ ...current, institutionDescription: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-3 rounded-xl text-sm font-medium"
              >
                {savingProfile ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar dados institucionais
              </button>
            </>
          )}
        </form>

        <div className="space-y-6">
          <div className="bg-white border border-indigo-100 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Preferências</h2>
              <p className="text-xs text-gray-500">Controle comunicações importantes da conta.</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-800">Receber notificações por e-mail</p>
                <p className="text-xs text-gray-500">Alertas sobre propostas, conversas e atualizações operacionais.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailEnabled}
                aria-label="Receber notificações por e-mail"
                onClick={toggleEmailNotifications}
                disabled={savingNotifications}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${emailEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${emailEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="bg-white border border-indigo-100 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Segurança</h2>
              <p className="text-xs text-gray-500">Troque a senha de acesso da instituição com validação da senha atual.</p>
            </div>
            <div>
              <label htmlFor="institution-current-password" className="text-sm text-gray-700 block mb-1.5">Senha atual</label>
              <input
                id="institution-current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label htmlFor="institution-new-password" className="text-sm text-gray-700 block mb-1.5">Nova senha</label>
              <input
                id="institution-new-password"
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-5 py-3 rounded-xl text-sm font-medium"
            >
              {savingPassword ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Atualizar senha
            </button>
            {passwordMessage && (
              <p className="text-sm text-green-700">{passwordMessage}</p>
            )}
          </form>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>}
    </div>
  );
}
