import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Building2, Eye, EyeOff, ArrowRight, CheckCircle, Heart, Mail, Lock, Star, User, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { isSandboxEnvironment } from '../../config/environment';
import { ApiError, ApiUserRole, authApi } from '../../lib/api';
import { BRAZIL_STATES } from '../../data/brazilCities';
import { getCitiesForState } from '../../lib/location';

type LocationState = {
  role?: ApiUserRole;
};

type PublicRole = Exclude<ApiUserRole, 'admin'>;

type RoleTheme = {
  pageBg: string;
  cardBorder: string;
  input: string;
  inputWithIcon: string;
  inputWithTrailingIcon: string;
  icon: string;
  button: string;
  link: string;
  checkbox: string;
  banner: string;
  bannerEyebrow: string;
  bannerBody: string;
  asideEyebrow: string;
  asideIcon: string;
};

type RoleCopy = {
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  profileDescription: string;
  primarySectionTitle: string;
  primarySectionBody: string;
  secondarySectionTitle: string;
  secondarySectionBody: string;
  sidebarEyebrow: string;
  sidebarTitle: string;
  sidebarBullets: string[];
  sidebarOutcomeTitle: string;
  sidebarOutcomes: string[];
  submitLabel: string;
};

const roleCardStyles: Record<PublicRole, string> = {
  paciente: 'border-[#ead8c4] text-[#8b3d44] hover:bg-[#fff8ef]',
  apoiador: 'border-[#c9e5dc] text-[#245b53] hover:bg-[#e5f4ee]',
  instituicao: 'border-[#d8cdeb] text-[#584478] hover:bg-[#f6f0ff]',
};

const roleCardActiveStyles: Record<PublicRole, string> = {
  paciente: 'bg-[#a8544a] text-white border-[#a8544a]',
  apoiador: 'bg-[#245b53] text-white border-[#245b53]',
  instituicao: 'bg-[#584478] text-white border-[#584478]',
};

const roleThemes: Record<PublicRole, RoleTheme> = {
  paciente: {
    pageBg: 'bg-[#fff8ef]',
    cardBorder: 'border-[#ead8c4]',
    input: 'w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]',
    inputWithIcon: 'w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]',
    inputWithTrailingIcon: 'w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]',
    icon: 'text-[#a8544a]',
    button: 'bg-[#a8544a] hover:bg-[#8b3d44] disabled:bg-[#e4aaa0]',
    link: 'text-[#a8544a] hover:text-[#8b3d44]',
    checkbox: 'text-[#a8544a]',
    banner: 'border-[#ead8c4] bg-[#fff4d8]',
    bannerEyebrow: 'text-[#8b3d44]',
    bannerBody: 'text-[#5c4b52]',
    asideEyebrow: 'text-[#f7d9c6]',
    asideIcon: 'text-[#f4cbbd]',
  },
  apoiador: {
    pageBg: 'bg-[#f2fbf8]',
    cardBorder: 'border-[#c9e5dc]',
    input: 'w-full rounded-xl border border-[#c9e5dc] bg-[#fbfffc] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed0c1]',
    inputWithIcon: 'w-full rounded-xl border border-[#c9e5dc] bg-[#fbfffc] pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed0c1]',
    inputWithTrailingIcon: 'w-full rounded-xl border border-[#c9e5dc] bg-[#fbfffc] pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed0c1]',
    icon: 'text-[#245b53]',
    button: 'bg-[#245b53] hover:bg-[#17453f] disabled:bg-[#9ed0c1]',
    link: 'text-[#245b53] hover:text-[#17453f]',
    checkbox: 'text-[#245b53]',
    banner: 'border-[#c9e5dc] bg-[#e5f4ee]',
    bannerEyebrow: 'text-[#245b53]',
    bannerBody: 'text-[#50645d]',
    asideEyebrow: 'text-[#c9e5dc]',
    asideIcon: 'text-[#9ed0c1]',
  },
  instituicao: {
    pageBg: 'bg-[#f8f5ff]',
    cardBorder: 'border-[#d8cdeb]',
    input: 'w-full rounded-xl border border-[#d8cdeb] bg-[#fffdfd] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d8cdeb]',
    inputWithIcon: 'w-full rounded-xl border border-[#d8cdeb] bg-[#fffdfd] pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d8cdeb]',
    inputWithTrailingIcon: 'w-full rounded-xl border border-[#d8cdeb] bg-[#fffdfd] pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d8cdeb]',
    icon: 'text-[#584478]',
    button: 'bg-[#584478] hover:bg-[#44345f] disabled:bg-[#cbbce9]',
    link: 'text-[#584478] hover:text-[#44345f]',
    checkbox: 'text-[#584478]',
    banner: 'border-[#d8cdeb] bg-[#f6f0ff]',
    bannerEyebrow: 'text-[#584478]',
    bannerBody: 'text-[#5f5268]',
    asideEyebrow: 'text-[#d8cdeb]',
    asideIcon: 'text-[#cbbce9]',
  },
};

const roleCopy: Record<PublicRole, RoleCopy> = {
  paciente: {
    introEyebrow: 'Cadastro de paciente',
    introTitle: 'Sua conta começa com clareza, acolhimento e segurança.',
    introBody: 'Depois do cadastro, vamos enviar um link de ativação para liberar seu primeiro acesso com segurança.',
    profileDescription: 'Cadastro pessoal com suporte seguro e navegação simples desde o primeiro acesso.',
    primarySectionTitle: 'Seus dados',
    primarySectionBody: 'Essas informações ajudam a personalizar sua conta e dar contexto ao seu perfil dentro da plataforma.',
    secondarySectionTitle: 'Acesso à conta',
    secondarySectionBody: 'Defina como você vai entrar na plataforma e manter sua conta protegida.',
    sidebarEyebrow: 'Como funciona para paciente',
    sidebarTitle: 'Seu espaço no NextDream é feito para organizar sonhos com calma.',
    sidebarBullets: [
      'Cadastre sua conta pessoal e confirme seu e-mail para ativar o acesso.',
      'Descreva seus sonhos com mais clareza e acompanhe propostas recebidas.',
      'Mantenha conversas, notificações e próximos passos no mesmo lugar.',
    ],
    sidebarOutcomeTitle: 'O que você consegue fazer depois do cadastro',
    sidebarOutcomes: [
      'Criar e editar seus sonhos',
      'Receber propostas de apoiadores',
      'Acompanhar mensagens e notificações',
    ],
    submitLabel: 'Criar conta de paciente',
  },
  apoiador: {
    introEyebrow: 'Cadastro de apoiador',
    introTitle: 'Seu apoio entra com contexto, confiança e intenção clara.',
    introBody: 'Depois do cadastro, vamos enviar um link de ativação para liberar sua conta com segurança.',
    profileDescription: 'Cadastro pessoal com foco em descoberta de sonhos, propostas e acompanhamento de conversas.',
    primarySectionTitle: 'Seus dados',
    primarySectionBody: 'Use seus dados principais para criar uma presença confiável e identificável dentro da comunidade.',
    secondarySectionTitle: 'Acesso à conta',
    secondarySectionBody: 'Defina como você vai acessar a plataforma e manter sua conta protegida.',
    sidebarEyebrow: 'Como funciona para apoiador',
    sidebarTitle: 'Seu perfil de apoiador foi pensado para explorar e agir com cuidado.',
    sidebarBullets: [
      'Crie sua conta, confirme seu e-mail e só então acesse a área para explorar sonhos publicados.',
      'Envie propostas com contexto e acompanhe o andamento de cada caso.',
      'Mantenha conversas abertas com mais visibilidade sobre cada sonho apoiado.',
    ],
    sidebarOutcomeTitle: 'O que você consegue fazer depois do cadastro',
    sidebarOutcomes: [
      'Explorar sonhos publicados',
      'Enviar propostas com contexto',
      'Acompanhar conversas e atualizações',
    ],
    submitLabel: 'Criar conta de apoiador',
  },
  instituicao: {
    introEyebrow: 'Cadastro institucional',
    introTitle: 'Preencha os dados principais da organização e do responsável pela conta.',
    introBody: 'Depois do cadastro, o responsável confirma o e-mail e a conta segue para análise da equipe.',
    profileDescription: 'Cadastro institucional com aprovação manual, operação segura e contato responsável.',
    primarySectionTitle: 'Dados da instituição',
    primarySectionBody: 'Esses dados identificam a organização dentro da plataforma e no processo de aprovação.',
    secondarySectionTitle: 'Responsável pela conta',
    secondarySectionBody: 'Esse contato será usado na aprovação, no acesso à conta e nas comunicações operacionais.',
    sidebarEyebrow: 'Como funciona para Hospital ou ONG',
    sidebarTitle: 'Sua instituição entra com contexto e operação segura.',
    sidebarBullets: [
      'O responsável confirma o e-mail da conta antes de qualquer acesso.',
      'A operação de pacientes e sonhos só libera após a aprovação manual da equipe.',
      'O responsável informado será o contato principal da conta.',
    ],
    sidebarOutcomeTitle: 'O que você vai conseguir depois da aprovação',
    sidebarOutcomes: [
      'Cadastrar pacientes acompanhados',
      'Publicar sonhos com responsabilidade',
      'Intermediar propostas e conversas',
    ],
    submitLabel: 'Criar conta institucional',
  },
};

const institutionTypes = ['ONG', 'Hospital', 'Clínica', 'Casa de apoio', 'Outro'];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [institutionResponsibleName, setInstitutionResponsibleName] = useState('');
  const [institutionResponsiblePhone, setInstitutionResponsiblePhone] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [institutionDescription, setInstitutionDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const tipo = searchParams.get('tipo');

  if (isSandboxEnvironment()) {
    const nextSearch = new URLSearchParams();
    if (tipo) {
      nextSearch.set('tipo', tipo);
    }

    return <Navigate to={`/sandbox${nextSearch.toString() ? `?${nextSearch.toString()}` : ''}`} replace />;
  }

  const stateRole = (location.state as LocationState | null)?.role;
  const initialRole: PublicRole =
    tipo === 'apoiador' || tipo === 'paciente' || tipo === 'instituicao'
      ? tipo
      : stateRole === 'apoiador' || stateRole === 'paciente' || stateRole === 'instituicao'
        ? stateRole
        : 'paciente';
  const [role, setRole] = useState<PublicRole>(initialRole);
  const cities = getCitiesForState(state);
  const isInstitution = role === 'instituicao';
  const theme = roleThemes[role];
  const copy = roleCopy[role];
  const hasIncompleteLocation = Boolean((state && !city) || (!state && city));
  const isInstitutionCoreInfoMissing = isInstitution && (
    !name.trim() ||
    !institutionResponsibleName.trim() ||
    !institutionType ||
    !institutionResponsiblePhone.trim() ||
    !email.trim() ||
    !password
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptTerms) {
      setError('Você precisa aceitar os termos para criar a conta.');
      return;
    }

    if (hasIncompleteLocation) {
      setError('Selecione estado e cidade juntos, ou deixe a localização em branco.');
      return;
    }

    setLoading(true);

    try {
      const registration = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        institutionType: isInstitution ? institutionType.trim() : undefined,
        institutionResponsibleName: isInstitution ? institutionResponsibleName.trim() : undefined,
        institutionResponsiblePhone: isInstitution ? institutionResponsiblePhone.trim() : undefined,
        institutionDescription: isInstitution ? institutionDescription.trim() || undefined : undefined,
        state: state || undefined,
        city: city.trim() || undefined,
      });
      const nextSearch = new URLSearchParams({
        email: registration.email,
        role: registration.role,
      });
      navigate(`/verificar-email?${nextSearch.toString()}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível criar a conta agora. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${theme.pageBg}`}>
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center xl:text-left">
          <h1 className="text-[#241b24]" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Criar conta no NextDream</h1>
          <p className="text-[#5c4b52] text-sm mt-2 font-semibold">{copy.profileDescription}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px] items-start">
          <div className={`bg-white rounded-3xl shadow-[0_24px_70px_rgba(92,62,51,0.08)] border ${theme.cardBorder} p-6 md:p-8`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm text-gray-700 block mb-1.5">Perfil</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'paciente' as const, label: 'Paciente', icon: Star },
                    { value: 'apoiador' as const, label: 'Apoiador', icon: Heart },
                    { value: 'instituicao' as const, label: 'Hospital / ONG', icon: Building2 },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      className={`py-2.5 rounded-xl border text-sm transition-colors inline-flex items-center justify-center gap-2 ${
                        role === item.value ? roleCardActiveStyles[item.value] : roleCardStyles[item.value]
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${theme.banner}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.bannerEyebrow}`}>{copy.introEyebrow}</p>
                <p className="mt-1 text-sm text-gray-900" style={{ fontWeight: 600 }}>{copy.introTitle}</p>
                <p className={`mt-2 text-xs leading-relaxed ${theme.bannerBody}`}>{copy.introBody}</p>
              </div>

              {isInstitution ? (
                <div className="space-y-5">
                  <section className={`rounded-2xl border bg-white p-5 space-y-4 ${theme.cardBorder}`}>
                    <div>
                      <h2 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{copy.primarySectionTitle}</h2>
                      <p className="text-xs text-gray-500 mt-1">{copy.primarySectionBody}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label htmlFor="register-name" className="text-sm text-gray-700 block mb-1.5">Nome da instituição</label>
                        <div className="relative">
                          <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex.: Casa Esperança"
                            autoComplete="organization"
                            required
                            className={theme.inputWithIcon}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="register-institution-type" className="text-sm text-gray-700 block mb-1.5">Tipo da instituição</label>
                        <select
                          id="register-institution-type"
                          value={institutionType}
                          onChange={(event) => setInstitutionType(event.target.value)}
                          required
                          className={theme.input}
                        >
                          <option value="">Selecione</option>
                          {institutionTypes.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="register-email" className="text-sm text-gray-700 block mb-1.5">E-mail institucional</label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contato@instituicao.org"
                            autoComplete="email"
                            required
                            className={theme.inputWithIcon}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="register-state" className="text-sm text-gray-700 block mb-1.5">Estado <span className="text-gray-400">(opcional)</span></label>
                        <select
                          id="register-state"
                          value={state}
                          onChange={(event) => {
                            setState(event.target.value);
                            setCity('');
                          }}
                          className={theme.input}
                        >
                          <option value="">Selecione</option>
                          {BRAZIL_STATES.map((item) => (
                            <option key={item.uf} value={item.uf}>
                              {item.name} ({item.uf})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="register-city" className="text-sm text-gray-700 block mb-1.5">Cidade <span className="text-gray-400">(opcional)</span></label>
                        <select
                          id="register-city"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          disabled={!state}
                          className={`${theme.input} disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200`}
                        >
                          <option value="">{state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                          {cities.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="register-institution-description" className="text-sm text-gray-700 block mb-1.5">Descrição curta da instituição</label>
                        <textarea
                          id="register-institution-description"
                          value={institutionDescription}
                          onChange={(e) => setInstitutionDescription(e.target.value)}
                          placeholder="Conte brevemente como a instituição acompanha pacientes ou assistidos."
                          rows={4}
                          className={`${theme.input} resize-none`}
                        />
                      </div>
                    </div>
                  </section>

                  <section className={`rounded-2xl border bg-white p-5 space-y-4 ${theme.cardBorder}`}>
                    <div>
                      <h2 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{copy.secondarySectionTitle}</h2>
                      <p className="text-xs text-gray-500 mt-1">{copy.secondarySectionBody}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="register-institution-responsible-name" className="text-sm text-gray-700 block mb-1.5">Nome do responsável</label>
                        <div className="relative">
                          <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-institution-responsible-name"
                            type="text"
                            value={institutionResponsibleName}
                            onChange={(e) => setInstitutionResponsibleName(e.target.value)}
                            placeholder="Ex.: Ana Souza"
                            autoComplete="name"
                            required
                            className={theme.inputWithIcon}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="register-institution-responsible-phone" className="text-sm text-gray-700 block mb-1.5">Telefone ou WhatsApp do responsável</label>
                        <div className="relative">
                          <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-institution-responsible-phone"
                            type="text"
                            inputMode="tel"
                            value={institutionResponsiblePhone}
                            onChange={(e) => setInstitutionResponsiblePhone(e.target.value)}
                            placeholder="Ex.: (11) 99999-9999"
                            autoComplete="tel"
                            required
                            className={theme.inputWithIcon}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="register-password" className="text-sm text-gray-700 block mb-1.5">Senha</label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            autoComplete="new-password"
                            required
                            className={theme.inputWithTrailingIcon}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-5">
                  <section className={`rounded-2xl border bg-white p-5 space-y-4 ${theme.cardBorder}`}>
                    <div>
                      <h2 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{copy.primarySectionTitle}</h2>
                      <p className="text-xs text-gray-500 mt-1">{copy.primarySectionBody}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label htmlFor="register-name" className="text-sm text-gray-700 block mb-1.5">Nome completo</label>
                        <div className="relative">
                          <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            autoComplete="name"
                            required
                            className={theme.inputWithIcon}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="register-state" className="text-sm text-gray-700 block mb-1.5">Estado <span className="text-gray-400">(opcional)</span></label>
                        <select
                          id="register-state"
                          value={state}
                          onChange={(event) => {
                            setState(event.target.value);
                            setCity('');
                          }}
                          className={theme.input}
                        >
                          <option value="">Selecione</option>
                          {BRAZIL_STATES.map((item) => (
                            <option key={item.uf} value={item.uf}>
                              {item.name} ({item.uf})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="register-city" className="text-sm text-gray-700 block mb-1.5">Cidade <span className="text-gray-400">(opcional)</span></label>
                        <select
                          id="register-city"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          disabled={!state}
                          className={`${theme.input} disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200`}
                        >
                          <option value="">{state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                          {cities.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className={`rounded-2xl border bg-white p-5 space-y-4 ${theme.cardBorder}`}>
                    <div>
                      <h2 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{copy.secondarySectionTitle}</h2>
                      <p className="text-xs text-gray-500 mt-1">{copy.secondarySectionBody}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label htmlFor="register-email" className="text-sm text-gray-700 block mb-1.5">E-mail</label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            autoComplete="email"
                            required
                            className={theme.inputWithIcon}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="register-password" className="text-sm text-gray-700 block mb-1.5">Senha</label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.icon}`} />
                          <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            autoComplete="new-password"
                            required
                            className={theme.inputWithTrailingIcon}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium">🚫 Importante ao criar sua conta:</p>
                <p className="text-xs text-amber-600 mt-1">O NextDream não permite pedidos de dinheiro, PIX ou doações. Nosso foco é presença, tempo, companhia e cuidado.</p>
              </div>

              {isInstitution && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-700 space-y-1">
                  <p className="font-semibold">Cadastro institucional com aprovação manual</p>
                  <p>Depois de confirmar o e-mail do responsável, a conta segue em análise antes de operar pacientes e sonhos.</p>
                </div>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className={`mt-1 rounded border-gray-300 ${theme.checkbox}`}
                />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                  Li e aceito os{' '}
                  <Link to="/termos" className={`${theme.link} hover:underline`}>Termos de Uso</Link>,{' '}
                  <Link to="/privacidade" className={`${theme.link} hover:underline`}>Política de Privacidade</Link>{' '}
                  e as <Link to="/diretrizes" className={`${theme.link} hover:underline`}>Diretrizes de Conduta</Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || hasIncompleteLocation || isInstitutionCoreInfoMissing}
                className={`w-full text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mt-2 ${theme.button}`}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{copy.submitLabel} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {isInstitutionCoreInfoMissing && (
                <p className="text-xs text-indigo-700" aria-live="polite">
                  Preencha os dados principais da instituição para continuar.
                </p>
              )}
            </form>

            <div className="mt-6 space-y-2">
              {['Sem cobrança financeira', 'Dados protegidos com criptografia', 'Sem PIX, vaquinha ou doações'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-[#24332b] text-white rounded-3xl p-6 space-y-5 border border-white/10">
            <div>
              <p className={`text-xs uppercase tracking-[0.18em] ${theme.asideEyebrow}`}>{copy.sidebarEyebrow}</p>
              <h2 className="mt-2 text-lg" style={{ fontWeight: 700 }}>{copy.sidebarTitle}</h2>
            </div>

            <div className="space-y-3">
              {copy.sidebarBullets.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-[#d9e7dd]">
                  <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${theme.asideIcon}`} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white" style={{ fontWeight: 600 }}>{copy.sidebarOutcomeTitle}</p>
              <div className="mt-3 space-y-2 text-sm text-[#d9e7dd]">
                {copy.sidebarOutcomes.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to={tipo ? `/login?tipo=${tipo}` : '/login'} className={`${theme.link} font-medium`}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
