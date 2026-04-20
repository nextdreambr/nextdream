import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Building2, Eye, EyeOff, ArrowRight, CheckCircle, Heart, Mail, Lock, Star, User } from 'lucide-react';
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

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
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
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoImg} alt="NextDream" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Criar conta no NextDream</h1>
          <p className="text-gray-500 text-sm mt-1">Gratuito • Sem cartão • Conexões humanas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700 font-medium">🚫 Importante ao criar sua conta:</p>
              <p className="text-xs text-amber-600 mt-1">O NextDream não permite pedidos de dinheiro, PIX ou doações. Nosso foco é presença, tempo e carinho.</p>
            </div>

            {role === 'instituicao' && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-700">
                Contas institucionais passam por aprovação manual antes de começar a operar pacientes e sonhos.
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
              disabled={loading || hasIncompleteLocation}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Criar conta <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
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

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to={tipo ? `/login?tipo=${tipo}` : '/login'} className="text-pink-600 hover:text-pink-700 font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
