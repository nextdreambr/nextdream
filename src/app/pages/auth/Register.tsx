import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Building2, Eye, EyeOff, ArrowRight, CheckCircle, Heart, Mail, Lock, Star, User, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiError, ApiUserRole, authApi } from '../../lib/api';
import { BRAZIL_STATES } from '../../data/brazilCities';
import { getCitiesForState } from '../../lib/location';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

type LocationState = {
  role?: ApiUserRole;
};

const roleCardStyles: Record<Exclude<ApiUserRole, 'admin'>, string> = {
  paciente: 'border-pink-200 text-pink-700 hover:bg-pink-50',
  apoiador: 'border-teal-200 text-teal-700 hover:bg-teal-50',
  instituicao: 'border-indigo-200 text-indigo-700 hover:bg-indigo-50',
};

const roleCardActiveStyles: Record<Exclude<ApiUserRole, 'admin'>, string> = {
  paciente: 'bg-pink-600 text-white border-pink-600',
  apoiador: 'bg-teal-600 text-white border-teal-600',
  instituicao: 'bg-indigo-600 text-white border-indigo-600',
};

const institutionTypes = ['ONG', 'Hospital', 'Clínica', 'Casa de apoio', 'Outro'];

const institutionSupportBullets = [
  'Sua instituição entra na área interna imediatamente após o cadastro.',
  'A operação de pacientes e sonhos só libera após a aprovação manual da equipe.',
  'O responsável informado será o contato principal da conta.',
];

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
  const stateRole = (location.state as LocationState | null)?.role;
  const initialRole: Exclude<ApiUserRole, 'admin'> =
    tipo === 'apoiador' || tipo === 'paciente' || tipo === 'instituicao'
      ? tipo
      : stateRole === 'apoiador' || stateRole === 'paciente' || stateRole === 'instituicao'
        ? stateRole
        : 'paciente';
  const [role, setRole] = useState<Exclude<ApiUserRole, 'admin'>>(initialRole);
  const cities = getCitiesForState(state);
  const hasIncompleteLocation = Boolean((state && !city) || (!state && city));
  const isInstitution = role === 'instituicao';
  const isInstitutionCoreInfoMissing = isInstitution && (
    !name.trim() ||
    !institutionResponsibleName.trim() ||
    !institutionType ||
    !institutionResponsiblePhone.trim() ||
    !email.trim() ||
    !password
  );
  const submitButtonClassName =
    role === 'instituicao'
      ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'
      : role === 'apoiador'
        ? 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300'
        : 'bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300';
  const formCardClassName = isInstitution
    ? 'bg-white rounded-3xl shadow-sm border border-indigo-100 p-6 md:p-8'
    : 'bg-white rounded-2xl shadow-sm border border-pink-100 p-8';
  const regularFieldClassName = isInstitution
    ? 'w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300'
    : 'w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300';

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
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isInstitution ? 'bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50' : 'bg-pink-50'}`}>
      <div className={`w-full ${isInstitution ? 'max-w-5xl' : 'max-w-md'}`}>
        <div className={`mb-8 ${isInstitution ? 'text-left' : 'text-center'}`}>
          <img src={logoImg} alt="NextDream" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Criar conta no NextDream</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isInstitution
              ? 'Cadastro institucional com aprovação manual, operação segura e contato responsável.'
              : 'Gratuito • Sem cartão • Conexões humanas'}
          </p>
        </div>

        <div className={isInstitution ? 'grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px] items-start' : ''}>
          <div className={formCardClassName}>
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

            {isInstitution && (
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Cadastro institucional</p>
                <p className="mt-1 text-sm text-indigo-900" style={{ fontWeight: 600 }}>
                  Preencha os dados principais da organização e do responsável pela conta.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-indigo-700">
                  Assim que o cadastro for enviado, você entra na área institucional com o status <strong>em análise</strong>.
                </p>
              </div>
            )}

            {isInstitution ? (
              <div className="space-y-5">
                <section className="rounded-2xl border border-indigo-100 bg-white p-5 space-y-4">
                  <div>
                    <h2 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Dados da instituição</h2>
                    <p className="text-xs text-gray-500 mt-1">Esses dados identificam a organização dentro da plataforma e no processo de aprovação.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label htmlFor="register-name" className="text-sm text-gray-700 block mb-1.5">
                        Nome da instituição
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                          id="register-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex.: Casa Esperança"
                          autoComplete="organization"
                          required
                          className="w-full rounded-xl border border-indigo-100 bg-indigo-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="register-institution-type" className="text-sm text-gray-700 block mb-1.5">
                        Tipo da instituição
                      </label>
                      <select
                        id="register-institution-type"
                        value={institutionType}
                        onChange={(event) => setInstitutionType(event.target.value)}
                        required
                        className={regularFieldClassName}
                      >
                        <option value="">Selecione</option>
                        {institutionTypes.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="register-email" className="text-sm text-gray-700 block mb-1.5">
                        E-mail institucional
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                          id="register-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contato@instituicao.org"
                          autoComplete="email"
                          required
                          className="w-full rounded-xl border border-indigo-100 bg-indigo-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                        className={regularFieldClassName}
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
                        className={`${regularFieldClassName} disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200`}
                      >
                        <option value="">{state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                        {cities.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="register-institution-description" className="text-sm text-gray-700 block mb-1.5">
                        Descrição curta da instituição
                      </label>
                      <textarea
                        id="register-institution-description"
                        value={institutionDescription}
                        onChange={(e) => setInstitutionDescription(e.target.value)}
                        placeholder="Conte brevemente como a instituição acompanha pacientes ou assistidos."
                        rows={4}
                        className={`${regularFieldClassName} resize-none`}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-indigo-100 bg-white p-5 space-y-4">
                  <div>
                    <h2 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Responsável pela conta</h2>
                    <p className="text-xs text-gray-500 mt-1">Esse contato será usado na aprovação, no acesso à conta e nas comunicações operacionais.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="register-institution-responsible-name" className="text-sm text-gray-700 block mb-1.5">
                        Nome do responsável
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                          id="register-institution-responsible-name"
                          type="text"
                          value={institutionResponsibleName}
                          onChange={(e) => setInstitutionResponsibleName(e.target.value)}
                          placeholder="Ex.: Ana Souza"
                          autoComplete="name"
                          required
                          className="w-full rounded-xl border border-indigo-100 bg-indigo-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="register-institution-responsible-phone" className="text-sm text-gray-700 block mb-1.5">
                        Telefone ou WhatsApp do responsável
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                          id="register-institution-responsible-phone"
                          type="text"
                          inputMode="tel"
                          value={institutionResponsiblePhone}
                          onChange={(e) => setInstitutionResponsiblePhone(e.target.value)}
                          placeholder="Ex.: (11) 99999-9999"
                          autoComplete="tel"
                          required
                          className="w-full rounded-xl border border-indigo-100 bg-indigo-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="register-password" className="text-sm text-gray-700 block mb-1.5">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          minLength={8}
                          autoComplete="new-password"
                          required
                          className="w-full rounded-xl border border-indigo-100 bg-indigo-50 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
              <>
                <div>
                  <label htmlFor="register-name" className="text-sm text-gray-700 block mb-1.5">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      autoComplete="name"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="text-sm text-gray-700 block mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="register-state" className="text-sm text-gray-700 block mb-1.5">Estado <span className="text-gray-400">(opcional)</span></label>
                    <select
                      id="register-state"
                      value={state}
                      onChange={(event) => {
                        setState(event.target.value);
                        setCity('');
                      }}
                      className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
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
                      className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                    >
                      <option value="">{state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                      {cities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="text-sm text-gray-700 block mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                      autoComplete="new-password"
                      required
                      className="w-full pl-10 pr-10 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
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
              </>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700 font-medium">🚫 Importante ao criar sua conta:</p>
              <p className="text-xs text-amber-600 mt-1">O NextDream não permite pedidos de dinheiro, PIX ou doações. Nosso foco é presença, tempo e carinho.</p>
            </div>

            {role === 'instituicao' && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-700 space-y-1">
                <p className="font-semibold">Cadastro institucional com aprovação manual</p>
                <p>
                  Contas de Hospital / ONG entram na área institucional logo após o cadastro, mas ficam em análise antes de operar pacientes e sonhos.
                </p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-pink-600"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                Li e aceito os{' '}
                <Link to="/termos" className="text-pink-600 hover:underline">Termos de Uso</Link>,{' '}
                <Link to="/privacidade" className="text-pink-600 hover:underline">Política de Privacidade</Link>{' '}
                e as <Link to="/diretrizes" className="text-pink-600 hover:underline">Diretrizes de Conduta</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || hasIncompleteLocation || isInstitutionCoreInfoMissing}
              className={`w-full text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mt-2 ${submitButtonClassName}`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isInstitution ? 'Criar conta institucional' : 'Criar conta'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {isInstitutionCoreInfoMissing && (
              <p className="text-xs text-indigo-700" aria-live="polite">
                Preencha os dados principais da instituição para continuar.
              </p>
            )}
          </form>

          <div className="mt-6 space-y-2">
            {['Sem cobrança nunca', 'Dados protegidos com criptografia', 'Sem dinheiro, PIX ou doações'].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                {item}
              </div>
            ))}
          </div>
          </div>

          {isInstitution && (
            <aside className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 border border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">Como funciona para Hospital ou ONG</p>
                <h2 className="mt-2 text-lg" style={{ fontWeight: 700 }}>Sua instituição entra com contexto e operação segura.</h2>
              </div>

              <div className="space-y-3">
                {institutionSupportBullets.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-indigo-300 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-white" style={{ fontWeight: 600 }}>O que você vai conseguir depois da aprovação</p>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-300" /> Cadastrar pacientes acompanhados</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-300" /> Publicar sonhos com responsabilidade</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-300" /> Intermediar propostas e conversas</div>
                </div>
              </div>
            </aside>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to={tipo ? `/login?tipo=${tipo}` : '/login'} className="text-pink-600 hover:text-pink-700 font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
