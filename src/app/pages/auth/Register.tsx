import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Building2, Eye, EyeOff, ArrowRight, CheckCircle, Heart, Mail, Lock, Star, User, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { isSandboxEnvironment } from '../../config/environment';
import { useApp } from '../../context/AppContext';
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
  paciente: 'border-pink-200 text-pink-700 hover:bg-pink-50',
  apoiador: 'border-teal-200 text-teal-700 hover:bg-teal-50',
  instituicao: 'border-indigo-200 text-indigo-700 hover:bg-indigo-50',
};

const roleCardActiveStyles: Record<PublicRole, string> = {
  paciente: 'bg-pink-600 text-white border-pink-600',
  apoiador: 'bg-teal-600 text-white border-teal-600',
  instituicao: 'bg-indigo-600 text-white border-indigo-600',
};

const roleThemes: Record<PublicRole, RoleTheme> = {
  paciente: {
    pageBg: 'bg-gradient-to-br from-pink-50 via-white to-rose-50',
    cardBorder: 'border-pink-100',
    input: 'w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300',
    inputWithIcon: 'w-full rounded-xl border border-pink-100 bg-pink-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300',
    inputWithTrailingIcon: 'w-full rounded-xl border border-pink-100 bg-pink-50 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300',
    icon: 'text-pink-400',
    button: 'bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300',
    link: 'text-pink-600 hover:text-pink-700',
    checkbox: 'text-pink-600',
    banner: 'border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50',
    bannerEyebrow: 'text-pink-700',
    bannerBody: 'text-pink-700',
    asideEyebrow: 'text-pink-200',
    asideIcon: 'text-pink-300',
  },
  apoiador: {
    pageBg: 'bg-gradient-to-br from-teal-50 via-white to-cyan-50',
    cardBorder: 'border-teal-100',
    input: 'w-full rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300',
    inputWithIcon: 'w-full rounded-xl border border-teal-100 bg-teal-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300',
    inputWithTrailingIcon: 'w-full rounded-xl border border-teal-100 bg-teal-50 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300',
    icon: 'text-teal-400',
    button: 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300',
    link: 'text-teal-600 hover:text-teal-700',
    checkbox: 'text-teal-600',
    banner: 'border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50',
    bannerEyebrow: 'text-teal-700',
    bannerBody: 'text-teal-700',
    asideEyebrow: 'text-teal-200',
    asideIcon: 'text-teal-300',
  },
  instituicao: {
    pageBg: 'bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50',
    cardBorder: 'border-indigo-100',
    input: 'w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300',
    inputWithIcon: 'w-full rounded-xl border border-indigo-100 bg-indigo-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300',
    inputWithTrailingIcon: 'w-full rounded-xl border border-indigo-100 bg-indigo-50 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300',
    icon: 'text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300',
    link: 'text-indigo-600 hover:text-indigo-700',
    checkbox: 'text-indigo-600',
    banner: 'border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50',
    bannerEyebrow: 'text-indigo-700',
    bannerBody: 'text-indigo-700',
    asideEyebrow: 'text-indigo-200',
    asideIcon: 'text-indigo-300',
  },
};

const roleCopy: Record<PublicRole, RoleCopy> = {
  paciente: {
    introEyebrow: 'Cadastro de paciente',
    introTitle: 'Sua conta começa com clareza, acolhimento e segurança.',
    introBody: 'Você entra na área do paciente logo após o cadastro para organizar seus sonhos e acompanhar tudo com tranquilidade.',
    profileDescription: 'Cadastro pessoal com suporte seguro e navegação simples desde o primeiro acesso.',
    primarySectionTitle: 'Seus dados',
    primarySectionBody: 'Essas informações ajudam a personalizar sua conta e dar contexto ao seu perfil dentro da plataforma.',
    secondarySectionTitle: 'Acesso à conta',
    secondarySectionBody: 'Defina como você vai entrar na plataforma e manter sua conta protegida.',
    sidebarEyebrow: 'Como funciona para paciente',
    sidebarTitle: 'Seu espaço no NextDream é feito para organizar sonhos com calma.',
    sidebarBullets: [
      'Cadastre sua conta pessoal e entre imediatamente na área do paciente.',
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
    introBody: 'Você entra na área do apoiador logo após o cadastro para explorar sonhos e construir conexões reais.',
    profileDescription: 'Cadastro pessoal com foco em descoberta de sonhos, propostas e acompanhamento de conversas.',
    primarySectionTitle: 'Seus dados',
    primarySectionBody: 'Use seus dados principais para criar uma presença confiável e identificável dentro da comunidade.',
    secondarySectionTitle: 'Acesso à conta',
    secondarySectionBody: 'Defina como você vai acessar a plataforma e manter sua conta protegida.',
    sidebarEyebrow: 'Como funciona para apoiador',
    sidebarTitle: 'Seu perfil de apoiador foi pensado para explorar e agir com rapidez.',
    sidebarBullets: [
      'Crie sua conta e entre direto na área para explorar sonhos publicados.',
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
    introBody: 'Assim que o cadastro for enviado, você entra na área institucional com o status em análise.',
    profileDescription: 'Cadastro institucional com aprovação manual, operação segura e contato responsável.',
    primarySectionTitle: 'Dados da instituição',
    primarySectionBody: 'Esses dados identificam a organização dentro da plataforma e no processo de aprovação.',
    secondarySectionTitle: 'Responsável pela conta',
    secondarySectionBody: 'Esse contato será usado na aprovação, no acesso à conta e nas comunicações operacionais.',
    sidebarEyebrow: 'Como funciona para Hospital ou ONG',
    sidebarTitle: 'Sua instituição entra com contexto e operação segura.',
    sidebarBullets: [
      'Sua instituição entra na área interna imediatamente após o cadastro.',
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
  const { login } = useApp();
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

  const routeByRole = (targetRole: ApiUserRole) => {
    if (targetRole === 'paciente') return '/paciente/dashboard';
    if (targetRole === 'apoiador') return '/apoiador/dashboard';
    if (targetRole === 'instituicao') return '/instituicao/dashboard';
    return '/admin';
  };

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
      const session = await authApi.register({
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
      login(session);
      navigate(routeByRole(session.user.role));
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
          <h1 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Criar conta no NextDream</h1>
          <p className="text-gray-500 text-sm mt-1">{copy.profileDescription}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px] items-start">
          <div className={`bg-white rounded-3xl shadow-sm border ${theme.cardBorder} p-6 md:p-8`}>
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
                <p className="text-xs text-amber-600 mt-1">O NextDream não permite pedidos de dinheiro, PIX ou doações. Nosso foco é presença, tempo e carinho.</p>
              </div>

              {isInstitution && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-700 space-y-1">
                  <p className="font-semibold">Cadastro institucional com aprovação manual</p>
                  <p>Contas de Hospital / ONG entram na área institucional logo após o cadastro, mas ficam em análise antes de operar pacientes e sonhos.</p>
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
              {['Sem cobrança nunca', 'Dados protegidos com criptografia', 'Sem dinheiro, PIX ou doações'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 border border-slate-800">
            <div>
              <p className={`text-xs uppercase tracking-[0.18em] ${theme.asideEyebrow}`}>{copy.sidebarEyebrow}</p>
              <h2 className="mt-2 text-lg" style={{ fontWeight: 700 }}>{copy.sidebarTitle}</h2>
            </div>

            <div className="space-y-3">
              {copy.sidebarBullets.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                  <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${theme.asideIcon}`} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white" style={{ fontWeight: 600 }}>{copy.sidebarOutcomeTitle}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
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
